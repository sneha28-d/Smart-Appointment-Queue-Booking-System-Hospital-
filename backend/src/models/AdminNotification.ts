const mongoose = require('mongoose');
import type { Document } from 'mongoose';

export type AdminNotificationType = 'booking' | 'cancellation' | 'queue' | 'system';

export interface IAdminNotification extends Document {
    title: string;
    message: string;
    type: AdminNotificationType;
    isRead: boolean;
    meta?: {
        patientName?: string;
        patientEmail?: string;
        patientPhone?: string;
        doctorName?: string;
        date?: string;
        time?: string;
        tokenNumber?: string;
        appointmentId?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const AdminNotificationSchema = new mongoose.Schema(
    {
        title:   { type: String, required: true },
        message: { type: String, required: true },
        type:    { type: String, enum: ['booking', 'cancellation', 'queue', 'system'], default: 'system' },
        isRead:  { type: Boolean, default: false },
        meta:    { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

module.exports = mongoose.model('AdminNotification', AdminNotificationSchema);
