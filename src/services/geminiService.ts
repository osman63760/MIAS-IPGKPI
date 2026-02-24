import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function processImamImage(base64Image: string, mimeType: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: 'Please edit this photo to look like a professional, high-quality passport photo for a religious official (Imam/Bilal). 1. Add a traditional black Malay songkok on the head, ensuring it is positioned neatly and perfectly. 2. Change the clothing to a neat, professional dark blazer over a clean white shirt. 3. Ensure the overall appearance is tidy, sharp, and aesthetically pleasing. 4. Use a solid, professional light background. 5. Crop to a standard passport headshot ratio (35mm x 45mm). Return only the edited image.',
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error processing image with Gemini:", error);
    return null;
  }
}
