
import { GoogleGenAI, Type } from "@google/genai";
import { LectureData } from "../types";

const LECTURE_MODEL = "gemini-3-pro-preview";

// Correct the return type to Omit because id, timestamp, and fileType are metadata added by the App component
export const processLectureContent = async (
  fileData: { base64: string; mimeType: string },
  fileName: string
): Promise<Omit<LectureData, 'id' | 'timestamp' | 'fileType'>> => {
  // Always create a new instance to ensure the most up-to-date key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: LECTURE_MODEL,
      // Updated contents format to use the recommended { parts: [...] } structure
      contents: {
        parts: [
          {
            inlineData: {
              data: fileData.base64,
              mimeType: fileData.mimeType,
            },
          },
          {
            text: `Act as a world-class academic scribe and tutor. Analyze the provided lecture content and generate a highly organized learning package.

            FOLLOW THESE STRICT FORMATTING RULES FOR THE SUMMARY:
            1. Use a clear H1 title for the main topic.
            2. Use H2 headers for major sections (e.g., Core Concepts, Key Terminology, Detailed Analysis).
            3. WRITE THE SUMMARY POINT-WISE: Use bullet points ( - ) for all details. Never write long paragraphs.
            4. USE SYMBOLS PROPERLY: Use arrows (→) for processes/consequences, bullet points for lists, and mathematical symbols where appropriate.
            5. BOLD (using **bold**) key terms the first time they appear.
            6. Ensure logical flow between points.

            Output your response as a JSON object with this exact structure:
            {
              "title": "Clear Academic Title",
              "summary": "The point-wise markdown summary...",
              "flashcards": [{"front": "Term/Question", "back": "Definition/Explanation"}],
              "quiz": [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0, "explanation": "..."}]
            }`
          },
        ],
      },
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ["front", "back"]
              }
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["title", "summary", "flashcards", "quiz"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI returned an empty response.");
    
    const result = JSON.parse(text);
    
    return {
      title: result.title || fileName.replace(/\.[^/.]+$/, ""),
      summary: result.summary,
      flashcards: (result.flashcards || []).map((f: any, i: number) => ({ ...f, id: `fc-${i}-${Date.now()}` })),
      quiz: (result.quiz || []).map((q: any, i: number) => ({ ...q, id: `q-${i}-${Date.now()}` }))
    };
  } catch (error: any) {
    console.error("Gemini processing failed:", error);
    
    // Check for specific proxy/RPC errors often seen in dev environments
    if (error.message?.includes('500') || error.message?.includes('xhr')) {
      throw new Error("The AI server is currently busy or the file is too complex. Please try again with a slightly smaller file or wait a moment.");
    }
    
    throw new Error(error.message || "Failed to process lecture content. Please ensure the file is readable.");
  }
};
