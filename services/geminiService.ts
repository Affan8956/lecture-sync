
import { GoogleGenAI, Type } from "@google/genai";
import { Message, AIMode } from "../types";

const PRO_MODEL = "gemini-3-pro-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";

const SYSTEM_PROMPTS: Record<AIMode, string> = {
  study: "You are an expert academic tutor. Break down complex topics into simple analogies. Use markdown headers. Always respond in English unless specifically asked otherwise. Provide deep, structured reasoning.",
  coding: "You are a senior software engineer. Provide high-quality, documented code blocks. Be concise. Always respond in English.",
  writing: "You are a creative editor. Help users draft prose. Focus on tone, style, and structure. Always respond in English.",
  tutor: "You are a Socratic teacher. Guide users with questions instead of giving direct answers. Always respond in English.",
  research: "You are a technical analyst. Provide dense, data-driven explanations with structured evidence. Always respond in English."
};

// --- CHAT STREAMING ---
export const streamChatResponse = async (
  history: Message[],
  currentMessage: string,
  mode: AIMode,
  onChunk: (text: string) => void
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  })).concat([{ role: 'user', parts: [{ text: currentMessage }] }]);

  try {
    const stream = await ai.models.generateContentStream({
      model: PRO_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPTS[mode],
        thinkingConfig: { thinkingBudget: 15000 },
        maxOutputTokens: 30000,
        temperature: 0.7
      }
    });

    let fullText = "";
    for await (const chunk of stream) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error: any) {
    throw new Error(error.message || "AI Engine Error");
  }
};

// --- SLIDE IMAGE GENERATION ---
export const generateSlideImage = async (title: string, context: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate a high-quality, professional, and educational 3D illustration or conceptual photograph for a lecture slide. 
  Topic: ${title}
  Content Context: ${context}
  Style: Clean, modern, academic, high-resolution. No text in the image. Vibrant but professional colors.`;

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (err) {
    console.error("Image generation failed:", err);
    return `https://loremflickr.com/1280/720/${encodeURIComponent(title || 'education')}`;
  }
};

// --- UNIFIED LAB PROCESSING ---
export const processUnifiedLabContent = async (
  source: { file?: { base64: string; mimeType: string }; url?: string }
): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const instruction = `You are a world-class educational content creator and expert translator. 

  CORE MISSION: 
  Perform a deep analysis of the provided material to generate an "Elite Mastery Learning Package".

  STRICT CONTENT DEPTH:
  - TITLE: Concise and academic.
  - MASTER SUMMARY: Exhaustive English markdown summary. Detailed H1, H2, H3 structure.
  - QUIZ: 10 challenging Multiple Choice Questions with deep explanations.
  - SLIDES (12 Slides):
    * Each slide must have 5-8 detailed, high-value bullet points.
    * Speaker notes must be a comprehensive script of at least 150 words per slide.
    * imageKeyword must be a highly descriptive scene prompt for an AI image generator.

  MULTILINGUAL PROTOCOL:
  - Translate all concepts accurately into English if the source is non-English.
  - THE ENTIRE OUTPUT MUST BE IN ENGLISH.

  OUTPUT MUST BE A SINGLE VALID JSON OBJECT matching the responseSchema.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summary: {
        type: Type.OBJECT,
        properties: { content: { type: Type.STRING } },
        required: ["content"]
      },
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      },
      slides: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            slideTitle: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            speakerNotes: { type: Type.STRING },
            imageKeyword: { type: Type.STRING }
          },
          required: ["slideTitle", "bullets", "speakerNotes", "imageKeyword"]
        }
      }
    },
    required: ["title", "summary", "quiz", "slides"]
  };

  const parts: any[] = [];
  if (source.file) {
    parts.push({ inlineData: { data: source.file.base64, mimeType: source.file.mimeType } });
  } else if (source.url) {
    parts.push({ text: `Analyze and translate content from: ${source.url}` });
  }
  parts.push({ text: instruction });

  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema,
      tools: source.url ? [{ googleSearch: {} }] : [],
      thinkingConfig: { thinkingBudget: 25000 },
      maxOutputTokens: 30000,
      temperature: 0.1
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    throw new Error("AI synthesis pass failed. The content might be too complex or the transcript was unavailable.");
  }
};
