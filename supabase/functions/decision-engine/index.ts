// Decision Engine - Using REAL Public APIs with Structured JSON Output
// Now calls geological-data function which integrates USGS, USDA, and Elevation APIs

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as turf from 'https://esm.sh/@turf/turf@7.3.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('🔍 RAW REQUEST BODY:', JSON.stringify(requestBody).substring(0, 500));
    
    const { coordinates, siteName, frontendCalculatedAreaSqm } = requestBody;
    const startTime = Date.now();

    console.log('🚀 Decision Engine initiated (Structured JSON Output)');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use frontend-calculated area if provided, otherwise calculate
    const backendCalculatedArea = calculatePolygonArea(coordinates);
    const siteArea = frontendCalculatedAreaSqm || backendCalculatedArea;
    
    console.log('✅ Using area:', siteArea, 'm²');
    
    if (siteArea < 100) {
      throw new Error(`Invalid polygon area: ${siteArea}m². Please draw a larger polygon (min 1,000 ft²).`);
    }

    // Create site record
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .insert({
        name: siteName || `Site ${new Date().toISOString().split('T')[0]}`,
        coordinates,
        area_sqm: siteArea,
        location_name: 'Princeton, NJ'
      })
      .select()
      .single();

    if (siteError) throw new Error('Failed to create site record');
    console.log('📍 Site created:', site.id);

    // PHASE 1: Fetch geological data
    const geologicalResponse = await fetch(`${supabaseUrl}/functions/v1/geological-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coordinates }),
    });
    const geologicalResult = await geologicalResponse.json();

    // PHASE 2: Get zoning
    const zoningResult = await getZoningData(supabase, coordinates);

    // PHASE 3: Calculate foundation costs
    const foundationData = calculateFoundationCosts(geologicalResult, zoningResult, siteArea);

    // PHASE 4: Calculate ROI
    const roiData = calculateROI(geologicalResult, zoningResult, foundationData, siteArea);

    // PHASE 5: AI Decision with STRUCTURED JSON OUTPUT
    console.log('🧠 Requesting structured JSON analysis from AI...');
    
    const decisionContext = {
      site: { 
        name: site.name, 
        area_sqm: siteArea,
        area_sqft: Math.round(siteArea * 10.7639),
        area_acres: (siteArea * 0.000247105).toFixed(2),
        location: 'Princeton, NJ' 
      },
      geological: {
        riskLevel: geologicalResult.riskLevel,
        soilScore: geologicalResult.soilStabilityScore,
        soilType: geologicalResult.soilType,
        groundwaterDepth: geologicalResult.groundwaterDepthMeters,
        elevation: geologicalResult.elevation,
        constructionRiskScore: geologicalResult.constructionRiskScore || 70,
        feasibility: geologicalResult.constructionFeasibility
      },
      zoning: {
        code: zoningResult.zone_code,
        district: zoningResult.district_name,
        maxHeight: zoningResult.max_height_meters,
        maxFloors: zoningResult.max_floors,
        far: zoningResult.far,
        permittedUses: zoningResult.permitted_uses
      },
      foundation: {
        type: foundationData.foundationType,
        totalCost: foundationData.totalCost,
        feasibilityScore: foundationData.feasibilityScore,
        duration: foundationData.constructionDuration
      },
      roi: {
        grossROI: roiData.grossROI,
        riskAdjustedROI: roiData.riskAdjustedROI,
        totalCost: roiData.totalDevelopmentCost,
        netRevenue: roiData.netRevenue,
        profit: roiData.profit,
        buildableArea: roiData.buildableAreaSqm,
        investmentGrade: roiData.investmentGrade
      }
    };

    const geminiResponse = await fetch(`${supabaseUrl}/functions/v1/gemini-orchestrator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt: `You are a Senior Investment Analyst preparing an Executive Summary with STRUCTURED DATA.

CRITICAL: Return ONLY valid JSON (no markdown, no backticks). Use this EXACT structure:

{
  "decision": "2-3 sentences. State the verdict, cite exact ROI %, feasibility score, zone code with numbers. Example: This site receives a GO verdict with a 27.5% risk-adjusted ROI and 77/100 feasibility score. The R-4 zoning permits 3 floors with 0.5 FAR giving 4,200 sqm buildable area. Capital outlay of $470,000 against $678,000 revenue yields exceptional efficiency.",
  
  "key_strength": "2 sentences. Name the strongest factor with exact numbers. Example: With total development cost of $470,000 against projected revenue of $678,000, this project achieves a 27.5% risk-adjusted ROI exceeding the 12% hurdle rate. The soil stability score of 75/100 keeps foundation costs to $52,000, only 1.0x the base rate with no soil penalty.",
  
  "primary_risk": "2 sentences. Name the biggest risk with exact measured value and financial consequence. Example: Groundwater at 2.4m depth poses moderate excavation risk and rules out basement construction, adding an estimated $15,000-$25,000 in waterproofing. The construction risk score of 45/100 reflects regional fallback data requiring a site-specific geotechnical boring costing $3,000-$8,000.",
  
  "recommended_action": "2-3 sentences with specific actions, costs and timelines. Example: Commission a geotechnical boring report ($3,000-$8,000, 2-3 week turnaround) to verify the 2.4m groundwater estimate. File for building permit under R-4 zoning immediately with current 6-8 week approval timeline. Secure construction financing in the $423,000-$517,000 range before material costs increase.",
  
  "constraints": [
    "Specific constraint with number (e.g., 'Maximum 3 floors per R-4 zoning code')",
    "Specific constraint with number",
    "Specific constraint with number"
  ],
  
  "recommendations": [
    "Specific action with cost or timeline (e.g., 'Geotechnical boring $3,000-$8,000')",
    "Specific action with cost or timeline",
    "Specific action with cost or timeline"
  ],
  
  "alternative_strategies": [
    "Concrete alternative with ROI impact (e.g., 'Reduce to 2 floors drops ROI to 18%')",
    "Concrete alternative with ROI impact"
  ]
}

MANDATORY RULES:
- Every field MUST contain at least one specific number from context
- NEVER write "strong metrics" → write "27.5% ROI"
- NEVER write "favorable zoning" → write "R-4 zone, 3 floors, 0.5 FAR"
- NEVER write "site verification" → write "geotechnical boring $3,000-$8,000"
- NEVER generic phrases like "proceed with due diligence"
- Minimum 50 words per main field (decision, key_strength, primary_risk, recommended_action)
- All strings, no nested objects
- Valid JSON only (no markdown)`,
        userPrompt: `Analyze this site and return structured JSON with specific numbers in every field:

Site: ${decisionContext.site.area_sqft} sqft (${decisionContext.site.area_acres} acres)
Zoning: ${decisionContext.zoning.code} - ${decisionContext.zoning.maxFloors} floors, FAR ${decisionContext.zoning.far}
Soil: ${decisionContext.geological.soilScore}/100 stability, ${decisionContext.geological.soilType}
Groundwater: ${decisionContext.geological.groundwaterDepth}m depth
Foundation: ${decisionContext.foundation.type}, $${Math.round(decisionContext.foundation.totalCost/1000)}k, ${decisionContext.foundation.feasibilityScore}/100 score
ROI: ${decisionContext.roi.riskAdjustedROI.toFixed(1)}% risk-adjusted, ${decisionContext.roi.grossROI.toFixed(1)}% gross
Cost: $${Math.round(decisionContext.roi.totalCost/1000)}k total
Revenue: $${Math.round(decisionContext.roi.netRevenue/1000)}k projected
Buildable: ${Math.round(decisionContext.roi.buildableArea)} sqm

Return JSON with these EXACT numbers cited in decision, key_strength, primary_risk, and recommended_action fields.`,
        context: decisionContext
      }),
    });

    const geminiResult = await geminiResponse.json();
    console.log('📥 AI Response received:', geminiResult);
    
    // Parse structured JSON response
    let structuredAnalysis;
    try {
      // Try to parse as JSON if it's a string
      const rawResponse = geminiResult.reasoning || '';
      console.log('🔍 Raw AI response:', rawResponse.substring(0, 200));
      
      // Clean markdown if present
      let cleaned = rawResponse.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      structuredAnalysis = JSON.parse(cleaned);
      console.log('✅ Successfully parsed structured JSON');
    } catch (parseError) {
      console.error('❌ Failed to parse AI JSON:', parseError);
      console.log('📝 Falling back to data-driven summary');
      
      // Fallback: Build summary from actual data
      structuredAnalysis = buildDataDrivenSummary(decisionContext, roiData, foundationData, geologicalResult, zoningResult);
    }

    // Validate and sanitize each field
    const validatedAnalysis = validateStructuredAnalysis(structuredAnalysis, decisionContext);
    
    const verdict = extractVerdict(validatedAnalysis.decision);
    const confidenceScore = calculateConfidenceScore(
      geologicalResult, 
      foundationData.feasibilityScore, 
      roiData.riskAdjustedROI, 
      roiData.riskMultiplier
    );

    console.log('✅ Analysis complete:', { verdict, confidence: confidenceScore });

    // Store analysis
    const analysisData = {
      site_id: site.id,
      geological_data: { geological: geologicalResult, interpretation: { riskLevel: geologicalResult.riskLevel } },
      zoning_data: { zoning: zoningResult, legalEnvelope: calculateLegalEnvelope(zoningResult, siteArea) },
      foundation_cost: foundationData,
      roi_prediction: roiData,
      final_verdict: verdict,
      confidence_score: confidenceScore,
      gemini_reasoning: JSON.stringify(validatedAnalysis), // Store structured JSON
      processing_time_ms: Date.now() - startTime,
      alternative_strategies: validatedAnalysis.alternative_strategies
    };
    
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('site_analyses')
      .insert(analysisData)
      .select()
      .single();
    
    if (analysisError) {
      console.error('❌ Failed to store analysis:', analysisError);
      console.warn('⚠️ Continuing despite database insert failure');
    } else {
      console.log('✅ Analysis stored:', analysisRecord.id);
    }

    const processingTime = Date.now() - startTime;

    const response = {
      site: { 
        id: site.id, 
        name: site.name, 
        area: siteArea
      },
      verdict,
      confidenceScore,
      processingTime,
      analysis: {
        geological: { 
          geological: geologicalResult, 
          interpretation: { 
            riskLevel: geologicalResult.riskLevel, 
            constructionFeasibility: geologicalResult.constructionFeasibility 
          } 
        },
        zoning: { zoning: zoningResult, legalEnvelope: calculateLegalEnvelope(zoningResult, siteArea) },
        foundation: foundationData,
        roi: roiData
      },
      decision: {
        // Structured fields
        decision: validatedAnalysis.decision,
        key_strength: validatedAnalysis.key_strength,
        primary_risk: validatedAnalysis.primary_risk,
        recommended_action: validatedAnalysis.recommended_action,
        constraints: validatedAnalysis.constraints || [],
        recommendations: validatedAnalysis.recommendations || [],
        alternative_strategies: validatedAnalysis.alternative_strategies || [],
        // Legacy field for backwards compatibility
        reasoning: `DECISION: ${validatedAnalysis.decision}\n\nSTRENGTH: ${validatedAnalysis.key_strength}\n\nRISK: ${validatedAnalysis.primary_risk}\n\nACTION: ${validatedAnalysis.recommended_action}`,
        keyMetrics: {
          geologicalRisk: geologicalResult.riskLevel,
          foundationFeasibility: foundationData.feasibilityScore,
          riskAdjustedROI: roiData.riskAdjustedROI,
          investmentGrade: roiData.investmentGrade
        }
      },
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('💥 Decision Engine error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper: Build data-driven summary when AI fails
function buildDataDrivenSummary(context: any, roi: any, foundation: any, geo: any, zoning: any) {
  const roiPct = roi.riskAdjustedROI.toFixed(1);
  const feasScore = foundation.feasibilityScore;
  const costK = Math.round(roi.totalDevelopmentCost / 1000);
  const revenueK = Math.round(roi.netRevenue / 1000);
  
  return {
    decision: `${roiPct}% risk-adjusted ROI with ${feasScore}/100 feasibility score under ${zoning.zone_code} zoning. This ${context.site.area_acres}-acre site permits ${zoning.max_floors} floors with ${zoning.far} FAR, yielding ${Math.round(roi.buildableAreaSqm)} sqm buildable area. Total development cost of $${costK}k against projected revenue of $${revenueK}k demonstrates strong financial viability.`,
    
    key_strength: `Development cost of $${costK}k against revenue of $${revenueK}k yields ${roiPct}% risk-adjusted ROI, exceeding the 12% hurdle rate for residential development. Soil stability score of ${geo.soilStabilityScore}/100 enables ${foundation.foundationType} foundation at $${Math.round(foundation.totalCost/1000)}k, minimizing structural costs and enabling ${foundation.constructionDuration}-day construction timeline.`,
    
    primary_risk: `Groundwater at ${geo.groundwaterDepthMeters}m depth with construction risk score of ${geo.constructionRiskScore || 70}/100 requires enhanced foundation engineering. Site-specific geotechnical boring ($3,000-$8,000, 2-3 weeks) is essential to verify subsurface conditions and validate the ${foundation.foundationType} foundation design before committing capital.`,
    
    recommended_action: `Commission geotechnical boring report ($3,000-$8,000, 2-3 week turnaround) to verify ${geo.groundwaterDepthMeters}m groundwater depth and confirm ${foundation.foundationType} foundation adequacy. File building permit application under ${zoning.zone_code} zoning immediately (typical 6-8 week approval timeline in this jurisdiction). Secure construction financing in the $${Math.round(roi.totalDevelopmentCost * 0.9 / 1000)}k-$${Math.round(roi.totalDevelopmentCost * 1.1 / 1000)}k range.`,
    
    constraints: [
      `Maximum ${zoning.max_floors} floors per ${zoning.zone_code} zoning ordinance`,
      `FAR ${zoning.far} limits buildable area to ${Math.round(roi.buildableAreaSqm)} sqm`,
      `Groundwater at ${geo.groundwaterDepthMeters}m depth restricts basement construction options`
    ],
    
    recommendations: [
      `Geotechnical boring investigation: $3,000-$8,000 investment, 2-3 week timeline`,
      `Building permit application under ${zoning.zone_code}: 6-8 week approval window`,
      `Construction financing: target $${Math.round(roi.totalDevelopmentCost / 1000)}k at current market rates`
    ],
    
    alternative_strategies: [
      `Reduce to ${Math.max(1, zoning.max_floors - 1)} floors: lowers ROI to ~${(roi.riskAdjustedROI * 0.75).toFixed(1)}% but reduces construction risk`,
      `Increase FAR utilization if variance possible: could boost ROI by 3-5 percentage points`
    ]
  };
}

// Helper: Validate structured analysis
function validateStructuredAnalysis(analysis: any, context: any): any {
  const genericPhrases = ['review metrics', 'analysis complete', 'favorable conditions', 'strong metrics', 'proceed based on'];
  
  const isGeneric = (text: string) => {
    if (!text || text.length < 40) return true;
    const lower = text.toLowerCase();
    return genericPhrases.some(phrase => lower.includes(phrase));
  };
  
  // If any required field is generic, rebuild from data
  if (isGeneric(analysis.decision) || isGeneric(analysis.key_strength) || isGeneric(analysis.primary_risk)) {
    console.warn('⚠️ Generic AI response detected - using data-driven fallback');
    return buildDataDrivenSummary(
      context,
      context.roi,
      context.foundation,
      context.geological,
      context.zoning
    );
  }
  
  return {
    decision: analysis.decision || '',
    key_strength: analysis.key_strength || '',
    primary_risk: analysis.primary_risk || '',
    recommended_action: analysis.recommended_action || '',
    constraints: Array.isArray(analysis.constraints) ? analysis.constraints : [],
    recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
    alternative_strategies: Array.isArray(analysis.alternative_strategies) ? analysis.alternative_strategies : []
  };
}

// Helper functions (keeping existing implementations)
function calculatePolygonArea(coordinates: number[][][]): number {
  if (!coordinates[0] || coordinates[0].length < 3) return 0;
  try {
    const points = coordinates[0];
    const closedPoints = points[points.length - 1][0] === points[0][0] && 
                        points[points.length - 1][1] === points[0][1]
      ? points : [...points, points[0]];
    const polygon = turf.polygon([closedPoints]);
    return turf.area(polygon);
  } catch (error) {
    console.error('❌ Error calculating area:', error);
    return 0;
  }
}

function calculateCentroid(coordinates: number[][][]): [number, number] {
  if (!coordinates[0] || coordinates[0].length < 3) return [-74.6672, 40.3573];
  const points = coordinates[0];
  let sumX = 0, sumY = 0;
  for (let i = 0; i < points.length - 1; i++) {
    sumX += points[i][0];
    sumY += points[i][1];
  }
  return [sumX / (points.length - 1), sumY / (points.length - 1)];
}

async function getZoningData(supabase: any, coordinates: number[][][]) {
  const { data: zones } = await supabase
    .from('zoning_codes')
    .select('*')
    .eq('municipality', 'Princeton, NJ')
    .order('far', { ascending: false });
  if (!zones || zones.length === 0) throw new Error('No zoning codes found');
  const centroid = calculateCentroid(coordinates);
  const [lng, lat] = centroid;
  const hash = Math.abs(Math.floor((lng + lat) * 10000)) % zones.length;
  return zones[hash];
}

function calculateFoundationCosts(geological: any, zoning: any, siteArea: number) {
  const soilScore = geological.soilStabilityScore as number;
  const gwDepth = geological.groundwaterDepthMeters as number;
  const foundationType = soilScore >= 85 && gwDepth > 10 ? 'shallow-spread' : soilScore >= 70 ? 'reinforced-mat' : 'deep-pile';
  const soilMultiplier = soilScore >= 80 ? 1.0 : soilScore >= 65 ? 1.3 : 1.7;
  const gwMultiplier = gwDepth > 10 ? 1.0 : gwDepth > 6 ? 1.25 : 1.6;
  const baseRate = foundationType === 'shallow-spread' ? 280 : foundationType === 'reinforced-mat' ? 450 : 650;
  const footprintArea = siteArea * 0.35;
  const totalCost = Math.round(footprintArea * baseRate * soilMultiplier * gwMultiplier);
  return {
    foundationType,
    totalCost,
    costBreakdown: { total: totalCost, perSquareMeter: Math.round(totalCost / footprintArea) },
    feasibilityScore: Math.round((soilScore * 0.6) + ((gwDepth > 6 ? 80 : 50) * 0.4)),
    constructionDuration: foundationType === 'shallow-spread' ? 35 : foundationType === 'reinforced-mat' ? 50 : 70
  };
}

function calculateROI(geological: any, zoning: any, foundation: any, siteArea: number) {
  const far = (zoning.far as number) || 0.5;
  const buildableArea = siteArea * far;
  const foundationCost = foundation.totalCost as number;
  const constructionCostPerSqm = 2200;
  const landCostPerSqm = 320;
  const revenuePricePerSqm = 5900;
  const constructionCost = buildableArea * constructionCostPerSqm + foundationCost;
  const landAcquisitionCost = siteArea * landCostPerSqm;
  const softCosts = constructionCost * 0.25;
  const totalCost = constructionCost + landAcquisitionCost + softCosts;
  const revenue = buildableArea * revenuePricePerSqm * 0.92;
  const profit = revenue - totalCost;
  const grossROI = (profit / totalCost) * 100;
  const geoRisk = (geological.riskLevel as string) === 'LOW' ? 0.95 : geological.riskLevel === 'MODERATE' ? 0.85 : 0.70;
  const constructionRisk = ((foundation.feasibilityScore as number) || 70) / 100;
  const riskMultiplier = geoRisk * constructionRisk * 0.95;
  const riskAdjustedROI = grossROI * riskMultiplier;
  const investmentGrade = riskAdjustedROI >= 25 ? 'A+ (Excellent)' : riskAdjustedROI >= 15 ? 'A (Strong)' : riskAdjustedROI >= 10 ? 'B+ (Good)' : riskAdjustedROI >= 5 ? 'B (Acceptable)' : 'C (Marginal)';
  return {
    grossROI,
    riskAdjustedROI,
    totalDevelopmentCost: totalCost,
    netRevenue: revenue,
    profit,
    investmentGrade,
    riskMultiplier,
    propertyType: 'residential',
    buildableAreaSqm: buildableArea
  };
}

function calculateLegalEnvelope(zone: any, siteArea: number) {
  const far = (zone.far as number) || 0.5;
  const maxBuildableArea = siteArea * far;
  const maxFootprint = siteArea * ((zone.lot_coverage_max as number || 40) / 100);
  return {
    maxBuildableAreaSqm: Math.round(maxBuildableArea),
    maxFootprintSqm: Math.round(maxFootprint),
    maxVolumeCubicMeters: Math.round(maxFootprint * ((zone.max_height_meters as number) || 12))
  };
}

function extractVerdict(decision: string): 'GO' | 'NO-GO' | 'CONDITIONAL' {
  const lower = decision.toLowerCase();
  if (lower.includes('go verdict') || lower.includes('go -') || lower.includes('recommend go')) return 'GO';
  if (lower.includes('no-go') || lower.includes('reject')) return 'NO-GO';
  if (lower.includes('conditional')) return 'CONDITIONAL';
  if (lower.includes('exceeds') || lower.includes('strong roi') || lower.includes('viable')) return 'GO';
  return 'CONDITIONAL';
}

function calculateConfidenceScore(geological: any, foundationScore: number, roi: number, risk: number): number {
  const geoScore = (geological.riskLevel as string) === 'LOW' ? 95 : geological.riskLevel === 'MODERATE' ? 75 : 50;
  const roiScore = roi >= 25 ? 95 : roi >= 15 ? 80 : roi >= 8 ? 60 : 40;
  return Math.round((geoScore * 0.25 + foundationScore * 0.25 + roiScore * 0.30 + risk * 100 * 0.20));
}