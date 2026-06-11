// Gemini Orchestrator - Central AI reasoning engine for Terra-Zone
// Provides intelligent analysis across geological, zoning, cost, and ROI data

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const AI_API_TOKEN = Deno.env.get('AI_API_TOKEN_c8dba0ffb829');
    if (!AI_API_TOKEN) {
      throw new Error('AI_API_TOKEN is not configured');
    }

    const { systemPrompt, userPrompt, context } = await req.json();

    console.log('Gemini orchestrator called:', { systemPrompt: systemPrompt.substring(0, 100), contextKeys: Object.keys(context || {}) });

    const startTime = Date.now();

    // Call Gemini 3.1 Pro Preview via Enter AI API
    const response = await fetch('https://api.enter.pro/code/api/v1/ai/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-pro-preview',
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${userPrompt}\n\nContext Data:\n${JSON.stringify(context, null, 2)}`
          }
        ],
        stream: false,
        max_tokens: 250, // Enough for 4 clear sentences with recommendations
        temperature: 0.3, // Lower temperature for analytical reasoning
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract text content from response
    const textContent = data.content?.find((block: { type: string }) => block.type === 'text');
    const reasoning = textContent?.text || '';

    const duration = Date.now() - startTime;
    console.log(`✅ Gemini response received (${duration}ms)`);

    return new Response(
      JSON.stringify({ 
        reasoning,
        model: 'google/gemini-3.1-pro-preview',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in gemini-orchestrator:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});