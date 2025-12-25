
import { GoogleGenAI, Type } from "@google/genai";
import { Message, AIMode, LabTool } from "../types";

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

// --- STRUCTURED LAB TOOLS ---
export const generateLabContent = async (
  fileData: { base64: string; mimeType: string },
  tool: LabTool
): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  let responseSchema: any = { type: Type.OBJECT };

  if (tool === 'summary') {
    prompt = "Analyze this file and create a deep markdown summary. Use H1 for title, H2 for sections, and bullet points for details. Bold key terms.";
    responseSchema = {
      type: Type.OBJECT,
      properties: { title: { type: Type.STRING }, summary: { type: Type.STRING } },
      required: ["title", "summary"]
    };
  } else if (tool === 'quiz') {
    prompt = "Generate a 5-question multiple choice quiz based on this content. Include correct answers and explanations.";
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
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
        }
      },
      required: ["title", "quiz"]
    };
  } else if (tool === 'slides') {
    prompt = "Create content for a professional slide presentation (10 slides). Each slide needs a title, bullet points, and speaker notes.";
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        slides: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              slideTitle: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              speakerNotes: { type: Type.STRING }
            },
            required: ["slideTitle", "bullets", "speakerNotes"]
          }
        }
      },
      required: ["title", "slides"]
    };
  }

  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: {
      parts: [
        { inlineData: { data: fileData.base64, mimeType: fileData.mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema,
      thinkingConfig: { thinkingBudget: 15000 },
      maxOutputTokens: 30000
    }
  });

  return JSON.parse(response.text || "{}");
};
