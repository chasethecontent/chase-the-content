
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API client strictly according to guidelines using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface PulseResult {
  text: string;
  links: Array<{ title: string; uri: string }>;
}

/**
 * Fetches the latest "pulse" on a streamer using Gemini 3 Flash with Google Search grounding.
 * Extracts grounding chunks to comply with source listing requirements.
 */
export const getStreamerPulse = async (streamerName: string): Promise<PulseResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `What is the current status, location, and latest viral moment for the streamer "${streamerName}"? Use web search for accuracy.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a professional streamer industry analyst. Provide a 3-sentence high-energy brief. Include current rumors and verified locations if available."
      }
    });

    // Extracting ground chunks for required URL citations in search-grounded results
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks
      .map((chunk: any) => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri
      }))
      .filter((link: any) => link.uri);

    return {
      text: response.text || "No pulse report available.",
      links: links as Array<{ title: string; uri: string }>
    };
  } catch (error) {
    console.error("Gemini Pulse Error:", error);
    return { 
      text: "Pulse check unavailable for this streamer at the moment.", 
      links: [] 
    };
  }
};

/**
 * Analyzes streamer trends based on community query.
 */
export const analyzeStreamerTrends = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the current state of the ${query} streaming category or community.`,
      config: {
        systemInstruction: "Keep it under 200 characters. Sound like a savvy community moderator."
      }
    });
    // Correctly accessing .text property as defined in GenerateContentResponse
    return response.text || "Unable to fetch AI insights.";
  } catch (error) {
    console.error("Gemini Trend Error:", error);
    return "Unable to fetch AI insights.";
  }
};
