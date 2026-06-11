Deno.serve(async (req) => {
  // CORS headers for browser requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { coordinates } = await req.json();

    if (!coordinates || !Array.isArray(coordinates)) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulate processing time (realistic API delay)
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Calculate polygon area to generate deterministic results
    const area = calculatePolygonArea(coordinates);
    
    // Generate deterministic mock data based on area
    const soilStabilityScore = Math.min(95, Math.max(65, 80 + (area % 15) - 7));
    const groundwaterDepth = Math.min(15, Math.max(3, 8 + (area % 7)));
    
    const recommendations = generateRecommendations(soilStabilityScore, groundwaterDepth);

    const response = {
      analysis: {
        soilStabilityScore,
        groundwaterDepthMeters: groundwaterDepth,
        soilType: area > 5000 ? 'Clay loam with sand layers' : 'Sandy loam',
        bearingCapacity: `${Math.round(150 + (area % 50))} kPa`,
        seismicRisk: 'Low (Zone 2)',
        drainageQuality: groundwaterDepth > 10 ? 'Good' : 'Moderate'
      },
      recommendations,
      timestamp: new Date().toISOString(),
      location: 'Princeton, NJ'
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in geotech function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Calculate approximate area of polygon using Shoelace formula
function calculatePolygonArea(coordinates: number[][][]): number {
  if (!coordinates[0] || coordinates[0].length < 3) return 0;
  
  const points = coordinates[0];
  let area = 0;
  
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    area += x1 * y2 - x2 * y1;
  }
  
  return Math.abs(area / 2) * 100000; // Scale for visualization
}

function generateRecommendations(soilScore: number, gwDepth: number): string[] {
  const recs: string[] = [];
  
  if (soilScore >= 85) {
    recs.push('Soil conditions are excellent for standard foundation systems');
  } else if (soilScore >= 75) {
    recs.push('Foundation system suitable with standard reinforcement');
  } else {
    recs.push('Consider enhanced foundation design with soil stabilization');
  }

  if (gwDepth < 5) {
    recs.push('Shallow groundwater detected - waterproofing required below grade');
    recs.push('Install perimeter drainage and sump pump systems');
  } else if (gwDepth < 8) {
    recs.push('Moderate groundwater depth - standard waterproofing recommended');
  }

  recs.push('Geotechnical report valid for 12 months from site conditions');
  recs.push('Conduct seasonal monitoring if construction spans multiple seasons');

  return recs;
}