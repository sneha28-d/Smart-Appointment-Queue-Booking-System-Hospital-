import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware';
import { getDoctorAnalytics, getClinicAnalytics } from '../services/analyticsService';
import { generateResponse } from '../services/geminiService';

/**
 * Handle POST /api/ai/chat
 * Analyzes patient request, extracts doctor/clinic crowd stats, prompts Gemini, and returns conversational response.
 */
export const handleAIChat = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { message, doctorId } = req.body;

        if (!message || typeof message !== 'string' || message.trim() === '') {
            res.status(400).json({ msg: 'A non-empty message is required', success: false });
            return;
        }

        let analyticsData;
        if (doctorId && typeof doctorId === 'string' && doctorId.trim() !== '') {
            try {
                analyticsData = await getDoctorAnalytics(doctorId);
            } catch (err: any) {
                console.warn(`Failed to get doctor analytics for ID: ${doctorId}. Falling back to clinic-wide. Error:`, err.message);
                analyticsData = await getClinicAnalytics();
            }
        } else {
            // General query about the clinic/hospital
            analyticsData = await getClinicAnalytics();
        }

        // Generate response using Gemini API with analytics context
        const reply = await generateResponse(message, analyticsData);

        res.status(200).json({
            msg: 'Successful',
            success: true,
            data: {
                reply,
                analytics: {
                    doctorName: analyticsData.doctorName,
                    speciality: analyticsData.speciality,
                    avgWaitTime: analyticsData.avgWaitTime,
                    peakHours: analyticsData.peakHours,
                    lowRushHours: analyticsData.lowRushHours,
                    busyDays: analyticsData.busyDays,
                    lessBusyDays: analyticsData.lessBusyDays,
                    todayWaitingPatientsCount: analyticsData.todayWaitingPatientsCount
                }
            }
        });
    } catch (error: any) {
        console.error('AI Chat Controller Error:', error);
        res.status(500).json({
            msg: 'Failed to process AI request',
            success: false,
            error: error.message
        });
    }
};
