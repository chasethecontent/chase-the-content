
import { GoogleGenAI } from "@google/genai";

// Safe API Key retrieval
const getApiKey = () => {
  try {
    return process.env.API_KEY || (window as any).process?.env?.API_KEY || '';
  } catch {
    return '';
  }
};

const apiKey = getApiKey();
// We only initialize if apiKey exists to avoid immediate crash, though system rules assume it's there.
const ai = new GoogleGenAI({ apiKey: apiKey || 'temporary-placeholder' });

export const getStreamerPulse = async (streamerName: string) => {
  if (!apiKey) return "AI services are currently offline. Please check API_KEY configuration.";
  
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
  if (!apiKey) return "AI insight restricted.";

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
