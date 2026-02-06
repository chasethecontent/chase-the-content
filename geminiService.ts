
import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  try {
    // In Vite/Vercel, we use import.meta.env. For API_KEY specifically, 
    // it might be injected as process.env.API_KEY by some platforms.
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || 
           (import.meta as any).env?.VITE_API_KEY ||
           (window as any).process?.env?.API_KEY || 
           "";
  } catch {
    return "";
  }
};

// Only initialize if we have a key to avoid crashes
const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getStreamerPulse = async (streamerName: string) => {
  if (!ai) return "Pulse check unavailable: AI configuration missing.";
  
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
  if (!ai) return "Unable to fetch AI insights: AI configuration missing.";
  
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
    return "Unable to fetch AI insights.";
  }
};
