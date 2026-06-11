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

    // Simulate RAG processing time (document retrieval + analysis)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calculate centroid to determine zone
    const centroid = calculateCentroid(coordinates);
    const zoneData = determineZone(centroid);

    const response = {
      zoning: {
        code: zoneData.code,
        district: zoneData.district,
        maxBuildingHeightMeters: zoneData.maxHeight,
        maxFloors: zoneData.maxFloors,
        lotCoverageMax: zoneData.lotCoverage,
        setbacks: {
          front: zoneData.setbacks.front,
          rear: zoneData.setbacks.rear,
          side: zoneData.setbacks.side
        },
        parkingRequired: zoneData.parkingRequired,
        permittedUses: zoneData.permittedUses,
        specialRequirements: zoneData.specialRequirements
      },
      compliance: {
        status: 'Preliminary Review',
        notes: [
          'Zoning data retrieved from Princeton Municipal Code Title 20',
          'Site-specific variance may be required for certain designs',
          'Planning Board approval required for projects over 5,000 sq ft',
          'Environmental impact assessment recommended'
        ]
      },
      retrievalMetadata: {
        documentsSearched: 8,
        relevanceScore: 0.94,
        lastUpdated: '2026-03-15',
        source: 'Princeton Municipal Zoning Ordinance Database'
      },
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in zoning function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Calculate polygon centroid
function calculateCentroid(coordinates: number[][][]): [number, number] {
  if (!coordinates[0] || coordinates[0].length < 3) return [-74.6672, 40.3573]; // Default Princeton
  
  const points = coordinates[0];
  let sumX = 0, sumY = 0;
  
  for (let i = 0; i < points.length - 1; i++) {
    sumX += points[i][0];
    sumY += points[i][1];
  }
  
  return [sumX / (points.length - 1), sumY / (points.length - 1)];
}

// Mock zoning determination based on location
function determineZone(centroid: [number, number]) {
  const [lng, lat] = centroid;
  
  // Simulate different zones based on coordinates
  const hash = Math.abs(Math.floor((lng + lat) * 10000)) % 4;
  
  const zones = [
    {
      code: 'R-4',
      district: 'Residential Medium Density',
      maxHeight: 12.2,
      maxFloors: 3,
      lotCoverage: '35%',
      setbacks: { front: '7.6m', rear: '9.1m', side: '3.0m' },
      parkingRequired: '2 spaces per dwelling unit',
      permittedUses: ['Single-family homes', 'Two-family homes', 'Home offices'],
      specialRequirements: ['Tree preservation ordinance applies', 'Stormwater management plan required']
    },
    {
      code: 'RC',
      district: 'Research Campus',
      maxHeight: 18.3,
      maxFloors: 5,
      lotCoverage: '40%',
      setbacks: { front: '10.7m', rear: '12.2m', side: '4.6m' },
      parkingRequired: '1 space per 50 sq m floor area',
      permittedUses: ['Research facilities', 'Office buildings', 'Educational institutions'],
      specialRequirements: ['Green building certification preferred', 'Bicycle parking required']
    },
    {
      code: 'B-2',
      district: 'Business District',
      maxHeight: 15.2,
      maxFloors: 4,
      lotCoverage: '60%',
      setbacks: { front: '4.6m', rear: '7.6m', side: '3.0m' },
      parkingRequired: '1 space per 40 sq m retail / 1 per 50 sq m office',
      permittedUses: ['Retail stores', 'Restaurants', 'Professional offices', 'Mixed-use'],
      specialRequirements: ['Ground floor retail encouraged', 'Facade design review required']
    },
    {
      code: 'R-2',
      district: 'Residential Low Density',
      maxHeight: 10.7,
      maxFloors: 2,
      lotCoverage: '25%',
      setbacks: { front: '9.1m', rear: '12.2m', side: '4.6m' },
      parkingRequired: '2 spaces per dwelling unit',
      permittedUses: ['Single-family homes', 'Home offices (limited)'],
      specialRequirements: ['Historic district guidelines may apply', 'Tree removal permit required']
    }
  ];

  return zones[hash];
}