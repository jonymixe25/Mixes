import { GoogleGenAI } from "@google/genai";

export async function moderateContent(text: string, context: "chat" | "news"): Promise<{ isAppropriate: boolean; reason?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // If no API key is provided, allow the content by default to prevent blocking
      return { isAppropriate: true };
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      You are a content moderator for a community platform.
      Review the following ${context} content and determine if it is appropriate.
      Content should be blocked if it contains hate speech, harassment, explicit content, or spam.
      
      Content to review:
      "${text}"
      
      Respond with a JSON object containing two fields:
      - isAppropriate (boolean): true if the content is safe, false otherwise.
      - reason (string): If isAppropriate is false, provide a brief, polite reason in Spanish. If true, this can be omitted.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      isAppropriate: result.isAppropriate ?? true,
      reason: result.reason
    };
  } catch (error) {
    console.error("Moderation error:", error);
    // In case of error, allow the content to pass so we don't block users unnecessarily
    return { isAppropriate: true };
  }
}
