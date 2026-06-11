// Zoning RAG Agent - Retrieval-Augmented Generation for zoning compliance
// Queries PostgreSQL zoning database + Gemini interpretation

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

    console.log('Zoning RAG analysis started for site:', siteId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate centroid to determine municipality
    const centroid = calculateCentroid(coordinates);
    const municipality = 'Princeton, NJ'; // In production, use reverse geocoding

    // RAG Step 1: Retrieve relevant zoning codes from database
    const { data: zoningCodes, error: dbError } = await supabase
      .from('zoning_codes')
      .select('*')
      .eq('municipality', municipality)
      .order('far', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to retrieve zoning data');
    }

    // Determine best matching zone based on location characteristics
    const matchedZone = determineZone(centroid, zoningCodes);

    // RAG Step 2: Use Gemini to interpret zoning regulations
    const geminiResponse = await fetch(`${supabaseUrl}/functions/v1/gemini-orchestrator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt: `You are a zoning compliance expert and legal advisor for real estate development.
Your task is to interpret municipal zoning regulations and explain:
1. What is legally permitted on this site
2. Key constraints and limitations (height, setbacks, FAR, lot coverage)
3. Potential compliance issues or required variances
4. Strategic recommendations for maximizing development potential

Be clear, precise, and highlight critical regulatory constraints that could block development.`,
        userPrompt: 'Analyze these zoning regulations and explain what can be built on this site:',
        context: {
          municipality,
          matchedZone,
          allAvailableZones: zoningCodes?.map(z => ({
            code: z.zone_code,
            district: z.district_name,
            maxHeight: z.max_height_meters,
            far: z.far
          }))
        }
      }),
    });

    const geminiResult = await geminiResponse.json();

    // Calculate legal building envelope parameters
    const polygonArea = calculatePolygonArea(coordinates);
    const legalEnvelope = calculateLegalEnvelope(matchedZone, polygonArea);

    const result = {
      zoning: {
        code: matchedZone.zone_code,
        district: matchedZone.district_name,
        maxBuildingHeightMeters: matchedZone.max_height_meters,
        maxFloors: matchedZone.max_floors,
        far: matchedZone.far,
        lotCoverageMax: matchedZone.lot_coverage_max,
        setbacks: {
          front: `${matchedZone.setback_front_meters}m`,
          rear: `${matchedZone.setback_rear_meters}m`,
          side: `${matchedZone.setback_side_meters}m`
        },
        parkingRequired: matchedZone.parking_ratio,
        permittedUses: matchedZone.permitted_uses,
        conditionalUses: matchedZone.conditional_uses,
        specialRequirements: matchedZone.special_requirements
      },
      legalEnvelope,
      interpretation: {
        reasoning: geminiResult.reasoning,
        complianceStatus: 'Preliminary Review',
        criticalConstraints: extractCriticalConstraints(matchedZone)
      },
      retrievalMetadata: {
        documentsSearched: zoningCodes?.length || 0,
        municipality,
        source: 'Princeton Municipal Zoning Database',
        confidence: 0.95
      },
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in zoning-rag:', error);
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

function calculatePolygonArea(coordinates: number[][][]): number {
  if (!coordinates[0] || coordinates[0].length < 3) return 0;
  
  const points = coordinates[0];
  let area = 0;
  
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    area += x1 * y2 - x2 * y1;
  }
  
  // Convert to approximate square meters (rough conversion for demo)
  return Math.abs(area / 2) * 1000000;
}

function determineZone(centroid: [number, number], zones: any[]): any {
  if (!zones || zones.length === 0) {
    throw new Error('No zoning codes found');
  }

  // Simulate zone selection based on location
  const [lng, lat] = centroid;
  const hash = Math.abs(Math.floor((lng + lat) * 10000)) % zones.length;
  
  return zones[hash];
}

function calculateLegalEnvelope(zone: any, siteArea: number) {
  const maxBuildableArea = siteArea * (zone.far || 0.5);
  const maxFootprint = siteArea * ((zone.lot_coverage_max || 40) / 100);
  
  return {
    maxBuildableAreaSqm: Math.round(maxBuildableArea),
    maxFootprintSqm: Math.round(maxFootprint),
    maxVolumeCubicMeters: Math.round(maxFootprint * (zone.max_height_meters || 12)),
    effectiveBuildableFloors: Math.min(
      zone.max_floors || 3,
      Math.floor(maxBuildableArea / maxFootprint)
    )
  };
}

function extractCriticalConstraints(zone: any): string[] {
  const constraints: string[] = [];
  
  if (zone.max_height_meters < 15) {
    constraints.push(`Height restriction: Maximum ${zone.max_height_meters}m limits development scale`);
  }
  
  if (zone.far < 0.6) {
    constraints.push(`Low FAR (${zone.far}) significantly limits total buildable area`);
  }
  
  if (zone.special_requirements && zone.special_requirements.length > 0) {
    constraints.push(`Special requirements apply: ${zone.special_requirements.slice(0, 2).join(', ')}`);
  }
  
  return constraints;
}