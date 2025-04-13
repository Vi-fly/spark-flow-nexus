
/**
 * Groq API Service - Handles interactions with Groq AI through Supabase Edge Functions
 */
import { supabase } from "@/integrations/supabase/client";

// Type definition for the Groq API response
export type GroqApiResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

/**
 * Send a prompt to the Groq API and get a response
 * @param prompt The text prompt to send to Groq
 * @param model Optional model parameter (defaults to llama3-70b-8192)
 */
export const getGroqResponse = async (
  prompt: string,
  model = "llama3-70b-8192"
): Promise<string> => {
  try {
    // Call the Supabase Edge Function for Groq
    const { data, error } = await supabase.functions.invoke("groq-api", {
      body: { prompt, model },
    });

    // Handle errors
    if (error) {
      console.error("Error calling Groq API:", error);
      throw new Error(`Failed to get response from Groq: ${error.message}`);
    }

    // Extract and return the response content
    if (data && data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }

    throw new Error("Invalid response format from Groq API");
  } catch (error) {
    console.error("Unexpected error in Groq service:", error);
    throw error;
  }
};
