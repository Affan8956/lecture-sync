
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
