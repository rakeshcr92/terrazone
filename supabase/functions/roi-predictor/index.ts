// ROI Predictor - Market intelligence + risk-adjusted ROI calculation
// Fuses geological, zoning, foundation, and market data with Gemini insights

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
    const { 
      geologicalData, 
      zoningData, 
      foundationData, 
      siteArea, 
      municipality 
    } = await req.json();

    console.log('ROI predictor started:', { siteArea, municipality });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Retrieve market intelligence
    const { data: marketData } = await supabase
      .from('market_intelligence')
      .select('*')
      .eq('municipality', municipality || 'Princeton, NJ')
      .order('data_date', { ascending: false })
      .limit(4);

    // Calculate buildable specifications
    const buildableArea = zoningData.legalEnvelope.maxBuildableAreaSqm;
    const maxHeight = zoningData.zoning.maxBuildingHeightMeters;
    const maxFloors = zoningData.zoning.maxFloors;

    // Determine optimal property type based on zoning
    const propertyType = determineOptimalPropertyType(zoningData.zoning);
    const relevantMarket = marketData?.find(m => m.property_type === propertyType) || marketData?.[0];

    // Calculate costs
    const foundationCost = foundationData.costBreakdown.total;
    const constructionCostPerSqm = estimateConstructionCost(propertyType, foundationData.foundationType);
    const totalConstructionCost = Math.round(buildableArea * constructionCostPerSqm + foundationCost);
    
    const landAcquisitionCost = Math.round(siteArea * 800); // Estimate $800/sqm for Princeton
    const softCosts = Math.round(totalConstructionCost * 0.25); // 25% for permits, design, etc.
    const totalDevelopmentCost = totalConstructionCost + landAcquisitionCost + softCosts;

    // Calculate revenue
    const pricePerSqm = relevantMarket?.avg_price_per_sqm || 6500;
    const grossRevenue = Math.round(buildableArea * pricePerSqm);
    const netRevenue = Math.round(grossRevenue * 0.92); // 8% for sales costs

    // Calculate ROI metrics
    const profit = netRevenue - totalDevelopmentCost;
    const roiPercent = (profit / totalDevelopmentCost) * 100;
    const profitMargin = (profit / netRevenue) * 100;

    // Risk adjustments
    const geologicalRisk = geologicalData.interpretation.riskLevel === 'LOW' ? 0.95 : 
                           geologicalData.interpretation.riskLevel === 'MODERATE' ? 0.85 : 0.70;
    const constructionRisk = foundationData.feasibilityScore / 100;
    const marketRisk = relevantMarket?.price_trend === 'rising' ? 1.0 : 
                       relevantMarket?.price_trend === 'stable' ? 0.9 : 0.75;
    
    const combinedRiskMultiplier = geologicalRisk * constructionRisk * marketRisk;
    const riskAdjustedProfit = Math.round(profit * combinedRiskMultiplier);
    const riskAdjustedROI = (riskAdjustedProfit / totalDevelopmentCost) * 100;

    // Get Gemini strategic insights
    const geminiResponse = await fetch(`${supabaseUrl}/functions/v1/gemini-orchestrator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt: `You are a real estate investment analyst providing strategic ROI guidance.
Analyze the complete project financials and market conditions to provide:
1. Investment viability assessment
2. Optimal building configuration (floors, units, mix)
3. Market timing recommendations
4. Risk mitigation strategies
5. Alternative development scenarios

Focus on maximizing risk-adjusted returns and identifying deal-breakers.`,
        userPrompt: 'Analyze this development opportunity and provide strategic investment recommendations:',
        context: {
          costs: { foundation: foundationCost, construction: totalConstructionCost, total: totalDevelopmentCost },
          revenue: { gross: grossRevenue, net: netRevenue },
          roi: { base: roiPercent, riskAdjusted: riskAdjustedROI, profitMargin },
          risks: { geological: geologicalRisk, construction: constructionRisk, market: marketRisk },
          market: relevantMarket,
          zoning: zoningData.zoning,
          propertyType
        }
      }),
    });

    const geminiResult = await geminiResponse.json();

    const result = {
      propertyType,
      developmentSpecs: {
        buildableAreaSqm: buildableArea,
        maxHeight: maxHeight,
        maxFloors: maxFloors,
        estimatedUnits: estimateUnits(propertyType, buildableArea)
      },
      costAnalysis: {
        landAcquisition: landAcquisitionCost,
        foundationCost,
        constructionCost: totalConstructionCost - foundationCost,
        softCosts,
        totalDevelopmentCost,
        costPerSqm: Math.round(totalDevelopmentCost / buildableArea)
      },
      revenueProjection: {
        grossRevenue,
        netRevenue,
        pricePerSqm,
        absorptionRate: relevantMarket?.absorption_rate || 70
      },
      roiAnalysis: {
        grossProfit: profit,
        grossROI: roiPercent,
        profitMargin,
        riskAdjustedProfit,
        riskAdjustedROI,
        paybackPeriodYears: estimatePaybackPeriod(propertyType, riskAdjustedROI)
      },
      riskAssessment: {
        geologicalRiskFactor: geologicalRisk,
        constructionRiskFactor: constructionRisk,
        marketRiskFactor: marketRisk,
        combinedRiskMultiplier,
        confidenceLevel: combinedRiskMultiplier >= 0.85 ? 'High' : 
                         combinedRiskMultiplier >= 0.75 ? 'Moderate' : 'Low'
      },
      marketIntelligence: {
        marketTrend: relevantMarket?.price_trend || 'unknown',
        vacancyRate: relevantMarket?.vacancy_rate || 0,
        yoyGrowth: relevantMarket?.yoy_growth_percent || 0,
        competitionLevel: relevantMarket?.vacancy_rate > 10 ? 'High' : 
                          relevantMarket?.vacancy_rate > 5 ? 'Moderate' : 'Low'
      },
      interpretation: {
        reasoning: geminiResult.reasoning,
        investmentGrade: determineInvestmentGrade(riskAdjustedROI, combinedRiskMultiplier)
      },
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in roi-predictor:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function determineOptimalPropertyType(zoning: any): string {
  const permittedUses = zoning.permittedUses || [];
  
  if (permittedUses.some((use: string) => use.toLowerCase().includes('mixed'))) {
    return 'mixed-use';
  } else if (permittedUses.some((use: string) => use.toLowerCase().includes('residential'))) {
    return 'residential';
  } else if (permittedUses.some((use: string) => use.toLowerCase().includes('commercial') || 
             use.toLowerCase().includes('retail') || use.toLowerCase().includes('office'))) {
    return 'commercial';
  } else if (permittedUses.some((use: string) => use.toLowerCase().includes('research') || 
             use.toLowerCase().includes('lab'))) {
    return 'commercial';
  }
  
  return 'residential';
}

function estimateConstructionCost(propertyType: string, foundationType: string): number {
  const baseCosts = {
    'residential': 2200,
    'commercial': 2600,
    'mixed-use': 2400,
    'industrial': 1400
  };
  
  const foundationMultiplier = foundationType.includes('pile') || foundationType.includes('caisson') ? 1.15 : 1.0;
  
  return (baseCosts[propertyType as keyof typeof baseCosts] || 2200) * foundationMultiplier;
}

function estimateUnits(propertyType: string, buildableArea: number): number {
  if (propertyType === 'residential') {
    return Math.floor(buildableArea / 85); // Avg 85 sqm per unit
  } else if (propertyType === 'mixed-use') {
    return Math.floor((buildableArea * 0.6) / 85); // 60% residential
  }
  return 0; // Commercial/industrial not measured in units
}

function estimatePaybackPeriod(propertyType: string, roi: number): number {
  if (roi <= 0) return 999;
  
  const annualizedReturn = propertyType === 'residential' ? roi / 2.5 : roi / 3; // Development + sales period
  return Math.round((100 / annualizedReturn) * 10) / 10;
}

function determineInvestmentGrade(roi: number, riskMultiplier: number): string {
  const adjustedScore = roi * riskMultiplier;
  
  if (adjustedScore >= 30 && riskMultiplier >= 0.85) return 'A+ (Excellent)';
  if (adjustedScore >= 20 && riskMultiplier >= 0.75) return 'A (Strong)';
  if (adjustedScore >= 12 && riskMultiplier >= 0.70) return 'B+ (Good)';
  if (adjustedScore >= 8) return 'B (Acceptable)';
  if (adjustedScore >= 4) return 'C (Marginal)';
  return 'D (Not Recommended)';
}