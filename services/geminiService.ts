
import { GoogleGenAI, Type } from "@google/genai";
import { Message, AIMode } from "../types";

const PRO_MODEL = "gemini-3-pro-preview";

const SYSTEM_PROMPTS: Record<AIMode, string> = {
  study: "You are an expert academic tutor. Break down complex topics into simple analogies. Use markdown headers.",
  coding: "You are a senior software engineer. Provide high-quality, documented code blocks. Be concise.",
  writing: "You are a creative editor. Help users draft prose. Focus on tone, style, and structure.",
  tutor: "You are a Socratic teacher. Guide users with questions instead of giving direct answers.",
  research: "You are a technical analyst. Provide dense, data-driven explanations with structured evidence."
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

// --- UNIFIED LAB PROCESSING ---
export const processUnifiedLabContent = async (
  source: { file?: { base64: string; mimeType: string }; url?: string }
): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const instruction = `You are a world-class educational content creator. 
  Perform a deep analysis of the provided material to generate a "Mastery Learning Package".

  STRICT LOGIC ORDER:
  1. ANALYZE: Watch the YouTube video (or read the file) and understand all key points.
  2. SUMMARY: Create an exhaustive markdown summary. Include H1, H2, bolding, and bullet points.
  3. QUIZ & SLIDES: Using ONLY the summary you just created as your source of truth, generate:
     - 10 Multiple Choice Questions (Quiz).
     - 12 Presentation Slides.
  
  This ensures that every question and every slide is 100% consistent with the summary provided to the student. 
  Do not include external information or details from the video that are not reflected in your generated summary.

  IF THIS IS A YOUTUBE LINK: You must utilize search grounding to find the most accurate transcript and video details.

  OUTPUT MUST BE A SINGLE JSON OBJECT.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summary: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "Markdown formatted summary" }
        },
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
    parts.push({ text: `Analyze this YouTube/Web resource: ${source.url}` });
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
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Analysis pass failed", response.text);
    throw new Error("AI synthesis pass failed. The content might be too complex for a single pass.");
  }
};
