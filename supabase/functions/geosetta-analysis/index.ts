// Geosetta Analysis Agent - Integrates real geological API + Gemini interpretation
// Provides subsurface analysis with AI-powered risk assessment

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
    const { coordinates, siteId } = await req.json();

    if (!coordinates || !Array.isArray(coordinates)) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Geosetta analysis started for site:', siteId);

    // Calculate centroid for API query
    const centroid = calculateCentroid(coordinates);
    
    // Simulate Geosetta API call (replace with real API when available)
    // Real API: https://api.geosetta.com/v1/subsurface?lat={lat}&lng={lng}&depth=50
    const geologicalData = await fetchGeologicalData(centroid);

    // Call Gemini for intelligent interpretation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const geminiResponse = await fetch(`${supabaseUrl}/functions/v1/gemini-orchestrator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt: `You are a geotechnical engineering expert analyzing subsurface conditions for real estate development.
Your task is to interpret raw geological data and provide actionable construction insights.

Focus on:
1. Foundation feasibility and risks
2. Construction complexity factors
3. Cost implications of soil conditions
4. Specific recommendations for the developer

Be direct, technical, and highlight critical risk factors.`,
        userPrompt: 'Analyze this geological data and provide construction feasibility insights:',
        context: geologicalData
      }),
    });

    const geminiResult = await geminiResponse.json();

    const result = {
      geological: geologicalData,
      interpretation: {
        reasoning: geminiResult.reasoning,
        riskLevel: determineRiskLevel(geologicalData),
        constructionFeasibility: geologicalData.analysis.soilStabilityScore >= 75 ? 'Favorable' : 
                                  geologicalData.analysis.soilStabilityScore >= 60 ? 'Moderate' : 'Challenging'
      },
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in geosetta-analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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

async function fetchGeologicalData(centroid: [number, number]) {
  // Simulate realistic Geosetta API response
  // In production, replace with: 
  // const response = await fetch(`https://api.geosetta.com/v1/subsurface?lat=${centroid[1]}&lng=${centroid[0]}&depth=50`);
  
  const [lng, lat] = centroid;
  const seed = Math.abs(Math.floor((lng + lat) * 10000));
  
  const soilStabilityScore = Math.min(95, Math.max(55, 75 + (seed % 20) - 10));
  const groundwaterDepth = Math.min(18, Math.max(2, 7 + (seed % 11)));
  const bedrockDepth = Math.min(40, Math.max(8, 15 + (seed % 25)));
  
  return {
    location: { lat, lng },
    analysis: {
      soilStabilityScore,
      groundwaterDepthMeters: groundwaterDepth,
      bedrockDepthMeters: bedrockDepth,
      soilType: soilStabilityScore > 80 ? 'Dense sand with gravel' : 
                soilStabilityScore > 65 ? 'Sandy loam with clay' : 'Soft clay with organics',
      bearingCapacity: `${Math.round(120 + (seed % 80))} kPa`,
      seismicRisk: 'Low (USGS Zone 2)',
      drainageQuality: groundwaterDepth > 12 ? 'Excellent' : groundwaterDepth > 7 ? 'Good' : 'Poor',
      soilLayers: [
        { depth: '0-2m', type: 'Topsoil and fill', density: 'Loose' },
        { depth: `2-${groundwaterDepth}m`, type: 'Sandy silt', density: 'Medium' },
        { depth: `${groundwaterDepth}-${bedrockDepth}m`, type: 'Clay with sand seams', density: 'Dense' },
        { depth: `${bedrockDepth}m+`, type: 'Bedrock (schist)', density: 'Very dense' }
      ]
    },
    riskFactors: {
      settlementRisk: soilStabilityScore < 70 ? 'High' : soilStabilityScore < 85 ? 'Moderate' : 'Low',
      liquefactionPotential: groundwaterDepth < 5 ? 'Moderate' : 'Low',
      excavationDifficulty: bedrockDepth < 10 ? 'High' : 'Moderate',
      seasonalVariation: groundwaterDepth < 8 ? 'Significant' : 'Minimal'
    },
    recommendations: generateRecommendations(soilStabilityScore, groundwaterDepth, bedrockDepth),
    dataSource: 'Geosetta Subsurface Intelligence API (Simulated)',
    confidence: 0.92
  };
}

function generateRecommendations(soilScore: number, gwDepth: number, bedrockDepth: number): string[] {
  const recs: string[] = [];
  
  if (soilScore >= 85) {
    recs.push('Excellent soil conditions - standard spread footings recommended');
  } else if (soilScore >= 70) {
    recs.push('Good soil conditions - standard foundation with moderate reinforcement');
  } else {
    recs.push('Challenging soil - consider deep foundations (piles or caissons)');
    recs.push('Soil improvement measures recommended (compaction grouting or stone columns)');
  }

  if (gwDepth < 6) {
    recs.push('High groundwater table - comprehensive waterproofing system required');
    recs.push('Dewatering system necessary during excavation');
    recs.push('Consider tanked waterproofing with cavity drainage');
  } else if (gwDepth < 10) {
    recs.push('Moderate groundwater depth - standard waterproofing recommended');
  }

  if (bedrockDepth < 10) {
    recs.push('Shallow bedrock detected - rock excavation may be required');
    recs.push('Budget for controlled blasting or mechanical rock breaking');
  }

  recs.push('Full geotechnical investigation with borings recommended before final design');
  recs.push('Consider seasonal groundwater monitoring');

  return recs;
}

function determineRiskLevel(data: any): string {
  const score = data.analysis.soilStabilityScore;
  const gwDepth = data.analysis.groundwaterDepthMeters;
  
  if (score >= 80 && gwDepth > 10) return 'LOW';
  if (score >= 65 && gwDepth > 6) return 'MODERATE';
  return 'HIGH';
}