
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client using the environment variable directly
// We assume process.env.API_KEY is pre-configured in the execution environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStreamerPulse = async (streamerName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `What is the current status, location, and latest viral moment for the streamer "${streamerName}"? Use web search for accuracy.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a professional streamer industry analyst. Provide a 3-sentence high-energy brief. Include current rumors and verified locations if available."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Pulse Error:", error);
    return "Pulse check unavailable for this streamer at the moment.";
  }
};

export const analyzeStreamerTrends = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the current state of the ${query} streaming category or community.`,
      config: {
        systemInstruction: "Keep it under 200 characters. Sound like a savvy community moderator."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Trend Error:", error);
    return "Unable to fetch AI insights.";
  }
};
