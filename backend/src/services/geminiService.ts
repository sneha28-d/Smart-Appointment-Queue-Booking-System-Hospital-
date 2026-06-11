import { GoogleGenAI } from '@google/genai';
import type { AnalyticsResult } from './analyticsService';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn('WARNING: GEMINI_API_KEY is not defined in the environment variables.');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Sends the user prompt and analytical context to the Gemini API to get a human-like reply.
 */
export const generateResponse = async (userMessage: string, analytics: AnalyticsResult): Promise<string> => {
    try {
        const contextStr = JSON.stringify(analytics, null, 2);
        
        const systemInstruction = `You are "QueueSync AI", a polite, professional, and empathetic virtual medical assistant for our Smart Appointment & Queue Booking Clinic.
Your goal is to answer patients' questions about wait times, peak hours, crowd levels, and low-rush visit slots using the real-time and historical analytics provided.

Guidelines:
1. Always be conversational, warm, and helpful.
2. Use the provided structured JSON analytics data to answer the query. Format time slots (e.g. "09:00", "14:30") to human-friendly times (e.g. "9:00 AM", "2:30 PM").
3. Support multilingual conversation: Respond in the same language the patient used to ask their question (e.g. English, Spanish, French, Hindi, Bengali, Arabic, etc.).
4. Use polite formatting with markdown. Keep the answer clear and concise (1-3 sentences is usually best, unless more detail is requested).
5. If the patient asks for medical diagnoses, treatments, or prescriptions, politely explain that you can only assist with appointments, queue status, and visit timing, and advise them to consult their doctor directly.

Here is the current analytics context for the request:
${contextStr}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: {
                systemInstruction,
                temperature: 0.2, // Keep it highly focused on the analytics data
            }
        });

        if (!response.text) {
            throw new Error('No content returned from Gemini API');
        }

        return response.text.trim();
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        throw new Error(`AI generation failed: ${error.message}`);
    }
};
