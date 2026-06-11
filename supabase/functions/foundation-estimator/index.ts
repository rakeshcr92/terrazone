// Foundation Cost Estimator - Calculates foundation costs based on geological data
// Combines geological risks with construction vendor data and Gemini insights

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { geologicalData, zoningData, siteArea, siteAnalysisId } = await req.json();

    console.log('Foundation estimator started:', { siteArea, siteAnalysisId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get construction vendor data
    const { data: vendors } = await supabase
      .from('construction_vendors')
      .select('*')
      .eq('specialty', 'foundation')
      .order('cost_multiplier', { ascending: true });

    // Calculate base costs
    const soilScore = geologicalData.geological.analysis.soilStabilityScore;
    const gwDepth = geologicalData.geological.analysis.groundwaterDepthMeters;
    const bedrockDepth = geologicalData.geological.analysis.bedrockDepthMeters;

    // Determine foundation type based on conditions
    const foundationType = determineFoundationType(soilScore, gwDepth, bedrockDepth);
    
    // Calculate complexity multipliers
    const soilComplexityMultiplier = soilScore >= 80 ? 1.0 : soilScore >= 65 ? 1.3 : 1.7;
    const groundwaterRiskMultiplier = gwDepth > 10 ? 1.0 : gwDepth > 6 ? 1.25 : 1.6;
    const bedrockMultiplier = bedrockDepth < 10 ? 1.4 : 1.0;

    // Base rates (per square meter)
    const baseRates = {
      'shallow-spread': 280,
      'reinforced-mat': 450,
      'deep-pile': 650,
      'caisson': 720
    };

    const baseRate = baseRates[foundationType as keyof typeof baseRates] || 400;
    const totalMultiplier = soilComplexityMultiplier * groundwaterRiskMultiplier * bedrockMultiplier;

    // Calculate detailed costs
    const footprintArea = (zoningData.legalEnvelope.maxFootprintSqm || siteArea * 0.4);
    const excavationVolume = footprintArea * 3; // Average 3m depth

    const costs = {
      excavation: Math.round(excavationVolume * 45 * (bedrockDepth < 10 ? 1.5 : 1.0)),
      material: Math.round(footprintArea * baseRate * totalMultiplier * 0.4),
      labor: Math.round(footprintArea * baseRate * totalMultiplier * 0.45),
      engineering: Math.round(footprintArea * baseRate * totalMultiplier * 0.15),
      waterproofing: gwDepth < 8 ? Math.round(footprintArea * 120) : Math.round(footprintArea * 60),
      dewatering: gwDepth < 6 ? Math.round(footprintArea * 85) : 0
    };

    const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

    // Calculate feasibility score
    const feasibilityScore = calculateFeasibilityScore(
      soilScore, gwDepth, bedrockDepth, totalCost, footprintArea
    );

    // Get Gemini insights
    const geminiResponse = await fetch(`${supabaseUrl}/functions/v1/gemini-orchestrator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt: `You are a construction cost analyst specializing in foundation engineering.
Analyze the foundation cost estimate and provide:
1. Cost optimization opportunities
2. Alternative foundation strategies
3. Risk factors that could increase costs
4. Timeline implications

Be specific about cost drivers and actionable recommendations.`,
        userPrompt: 'Analyze this foundation cost estimate and provide optimization insights:',
        context: {
          foundationType,
          costs,
          totalCost,
          complexity: { soilComplexityMultiplier, groundwaterRiskMultiplier, bedrockMultiplier },
          feasibilityScore,
          bestVendor: vendors?.[0]
        }
      }),
    });

    const geminiResult = await geminiResponse.json();

    // Store in database
    if (siteAnalysisId) {
      await supabase.from('foundation_estimates').insert({
        site_analysis_id: siteAnalysisId,
        excavation_cost: costs.excavation,
        material_cost: costs.material,
        labor_cost: costs.labor,
        engineering_cost: costs.engineering,
        total_cost: totalCost,
        soil_complexity_multiplier: soilComplexityMultiplier,
        groundwater_risk_multiplier: groundwaterRiskMultiplier,
        foundation_type: foundationType,
        construction_duration_days: estimateConstructionDuration(foundationType, footprintArea),
        feasibility_score: feasibilityScore
      });
    }

    const result = {
      foundationType,
      costBreakdown: {
        ...costs,
        total: totalCost,
        perSquareMeter: Math.round(totalCost / footprintArea)
      },
      riskMultipliers: {
        soilComplexity: soilComplexityMultiplier,
        groundwaterRisk: groundwaterRiskMultiplier,
        bedrockProximity: bedrockMultiplier,
        combined: totalMultiplier
      },
      feasibilityScore,
      constructionDuration: estimateConstructionDuration(foundationType, footprintArea),
      interpretation: {
        reasoning: geminiResult.reasoning,
        recommendedVendor: vendors?.[0] || null
      },
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in foundation-estimator:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function determineFoundationType(soilScore: number, gwDepth: number, bedrockDepth: number): string {
  if (soilScore >= 85 && gwDepth > 10) {
    return 'shallow-spread';
  } else if (soilScore >= 70 && gwDepth > 6) {
    return 'reinforced-mat';
  } else if (bedrockDepth < 12 && soilScore < 70) {
    return 'caisson';
  } else {
    return 'deep-pile';
  }
}

function calculateFeasibilityScore(
  soilScore: number, 
  gwDepth: number, 
  bedrockDepth: number, 
  totalCost: number, 
  area: number
): number {
  const costPerSqm = totalCost / area;
  
  // Score components (0-100)
  const soilComponent = soilScore; // Already 0-100
  const gwComponent = gwDepth > 10 ? 100 : gwDepth > 6 ? 75 : gwDepth > 3 ? 50 : 25;
  const bedrockComponent = bedrockDepth > 15 ? 100 : bedrockDepth > 10 ? 80 : 60;
  const costComponent = costPerSqm < 500 ? 100 : costPerSqm < 800 ? 75 : costPerSqm < 1200 ? 50 : 25;
  
  // Weighted average
  const score = (soilComponent * 0.35 + gwComponent * 0.25 + bedrockComponent * 0.20 + costComponent * 0.20);
  
  return Math.round(score);
}

function estimateConstructionDuration(foundationType: string, area: number): number {
  const baseDays = {
    'shallow-spread': 30,
    'reinforced-mat': 45,
    'deep-pile': 60,
    'caisson': 75
  };
  
  const base = baseDays[foundationType as keyof typeof baseDays] || 45;
  const areaFactor = Math.floor(area / 500); // +1 day per 500 sqm
  
  return base + areaFactor;
}