
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// CORS headers for the response
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if GROQ_API_KEY exists
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set. Please add it to the Supabase project secrets.");
    }

    // Parse request body
    const { messages, dbContext } = await req.json();

    // Base system prompt that includes tasks and capabilities
    let systemPrompt = `You are a helpful AI database assistant.
You can help with the following tasks:
1. Creating new tasks and contacts
2. Searching through existing tasks and contacts
3. Providing information about the database
4. Answering questions about task and contact management

Please format your responses using markdown.
Use proper headings with ## for sections.
Keep your responses concise and helpful.`;

    // Add database context if available
    if (dbContext) {
      systemPrompt += `\n\nHere is information about the current database state:\n${dbContext}`;
    }

    // Create the final messages array with system prompt
    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    console.log("Sending request to Groq API with model: llama-3.3-70b-versatile");

    // Send request to Groq API
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: finalMessages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    // Check if the response from Groq is OK
    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);
      throw new Error(`Groq API returned error: ${groqResponse.status} ${errorText}`);
    }

    // Get the response data
    const data = await groqResponse.json();
    console.log("Successfully received response from Groq API");

    // Return the response with CORS headers
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in Groq API edge function:", error.message);

    // Return error response with CORS headers
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
