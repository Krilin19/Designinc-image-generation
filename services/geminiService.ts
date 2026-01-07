import { GoogleGenAI } from "@google/genai";
import { GenerationConfig } from "../types";

// The mapping for 'nano banana pro 2' / 'gemini pro image' as per instructions
export const MODEL_NAME = 'gemini-3-pro-image-preview';

interface GenerateImageParams {
  prompt: string;
  referenceImage?: string; // Base64 string if user uploads one
  config: GenerationConfig;
}

interface GenerateResponse {
  text?: string;
  images: string[];
}

export const generateContentWithGemini = async ({
  prompt,
  referenceImage,
  config
}: GenerateImageParams): Promise<GenerateResponse> => {
  // Always create a new instance to pick up the latest injected API key from the environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [];

  // If there is a reference image (for editing or style reference), add it first
  if (referenceImage) {
    // Basic extraction of base64 data if it includes the prefix
    const base64Data = referenceImage.includes('base64,') 
      ? referenceImage.split('base64,')[1] 
      : referenceImage;

    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: 'image/png', // Assuming PNG for simplicity, or detect from header
      },
    });
  }

  // Add the text prompt
  parts.push({ text: prompt });

  // Construct tools configuration
  const tools: any[] = [];
  if (config.googleSearch) {
    tools.push({ googleSearch: {} });
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
          imageSize: config.imageSize,
        },
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    const result: GenerateResponse = {
      images: [],
      text: undefined,
    };

    // Parse response for both text and images
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          // Determine mime type if available, default to png
          const mimeType = part.inlineData.mimeType || 'image/png';
          result.images.push(`data:${mimeType};base64,${base64EncodeString}`);
        } else if (part.text) {
          // Accumulate text if multiple text parts exist (rare but possible)
          result.text = result.text ? result.text + '\n' + part.text : part.text;
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};