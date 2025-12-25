
import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, QuizQuestion, LectureData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const LECTURE_MODEL = "gemini-3-flash-preview";

export const processLectureContent = async (
  fileData: { base64: string; mimeType: string },
  fileName: string
): Promise<LectureData> => {
  try {
    const response = await ai.models.generateContent({
      model: LECTURE_MODEL,
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: fileData.base64,
                mimeType: fileData.mimeType,
              },
            },
            {
              text: `Act as an expert academic tutor. Analyze this lecture content and generate:
              1. A comprehensive, structured summary (Markdown format).
              2. 8-10 high-quality flashcards for key concepts.
              3. A 5-10 question multiple-choice quiz.
              
              Output your response as a JSON object with the following structure:
              {
                "title": "A descriptive title for the lecture",
                "summary": "Detailed summary in markdown...",
                "flashcards": [{"front": "Question/Term", "back": "Answer/Definition"}],
                "quiz": [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0, "explanation": "..."}]
              }`
            },
          ],
        },
      ],
      config: {
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

    const result = JSON.parse(response.text || '{}');
    
    // Add IDs for React keys
    return {
      title: result.title || fileName.replace(/\.[^/.]+$/, ""),
      summary: result.summary,
      flashcards: (result.flashcards || []).map((f: any, i: number) => ({ ...f, id: `fc-${i}` })),
      quiz: (result.quiz || []).map((q: any, i: number) => ({ ...q, id: `q-${i}` }))
    };
  } catch (error) {
    console.error("Gemini processing failed:", error);
    throw new Error("Failed to process lecture content. Please ensure the file is readable and try again.");
  }
};
