import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Scene, GeneratedScript } from "../types";
import { decodeBase64, decodeAudioData } from "./audioUtils";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- UTILS ---

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retries an async operation with exponential backoff
 */
async function withRetry<T>(operation: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's a safety block (unrecoverable)
      if (error.toString().toLowerCase().includes("safety") || error.toString().toLowerCase().includes("blocked")) {
        throw error;
      }

      console.warn(`Attempt ${i + 1} failed. Retrying in ${baseDelay * Math.pow(2, i)}ms...`, error);
      await wait(baseDelay * Math.pow(2, i));
    }
  }
  
  throw lastError;
}

// --- API CALLS ---

// 1. Generate the Script
export const generateHorrorScript = async (topic: string): Promise<GeneratedScript> => {
  return withRetry(async () => {
    const prompt = `
      Create a viral, fast-paced, high-retention horror short script for YouTube Shorts (approx 25-30 seconds).
      Topic: ${topic}
      
      The script must be broken down into exactly 5 to 7 scenes.
      The pacing should be fast.
      
      Each scene must have:
      1. 'narration': The spoken voiceover text. keep it under 2 sentences. Use hooks, questions, and scary punchlines.
      2. 'visual_prompt': A highly detailed description for an AI image generator to create a terrifying, cinematic 9:16 vertical image. Focus on lighting, shadows, and scary entities.
      
      Output JSON only.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  narration: { type: Type.STRING },
                  visual_prompt: { type: Type.STRING }
                },
                required: ["id", "narration", "visual_prompt"]
              }
            }
          },
          required: ["title", "scenes"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No script generated");
    }

    return JSON.parse(response.text) as GeneratedScript;
  });
};

// 2. Generate Image for a Scene
export const generateSceneImage = async (visualPrompt: string): Promise<string> => {
  return withRetry(async () => {
    // Enhancing the prompt. Removed specific trigger words that might cause safety blocks while keeping horror theme.
    const enhancedPrompt = `vertical 9:16 aspect ratio, hyper-realistic 8k horror movie scene, cinematic lighting, volumetric fog, unreal engine 5 render, dark atmosphere, detailed textures. ${visualPrompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: enhancedPrompt }]
      },
    });

    // Extract image
    let base64Image = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      throw new Error("Failed to generate image");
    }

    return base64Image;
  });
};

// 3. Generate Audio for a Scene
export const generateSceneAudio = async (text: string, audioContext: AudioContext): Promise<AudioBuffer> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // 'Fenrir' is deep and ominous, good for horror
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Failed to generate audio");
    }

    return decodeAudioData(decodeBase64(base64Audio), audioContext);
  });
};