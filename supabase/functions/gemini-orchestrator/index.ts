// Gemini Orchestrator - Terra-Zone AI

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { systemPrompt, userPrompt, context } = await req.json();

    const prompt = `
${systemPrompt}

${userPrompt}

Context Data:
${JSON.stringify(context || {}, null, 2)}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
            responseMimeType: "application/json"
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini error:", errorText);
      throw new Error(`Gemini API error ${response.status}`);
    }

    const data = await response.json();

    const reasoning =
      data.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text)
      .join("") || "";
    
    if (!reasoning) {
      console.error(
        "Empty Gemini response:",
        JSON.stringify(data)
      );
      throw new Error("Gemini returned empty response");
    }

    return new Response(
      JSON.stringify({
        reasoning,
        model: "gemini-2.0-flash",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("gemini-orchestrator error:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
