const mongoose = require('mongoose');
import type { Document, Types } from 'mongoose';

export interface INotification extends Document {
    userId: Types.ObjectId;
    appointmentId?: Types.ObjectId;
    type: 'email' | 'sms';
    message: string;
}

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    type: { type: String, enum: ['email', 'sms'], required: true },
    message: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
