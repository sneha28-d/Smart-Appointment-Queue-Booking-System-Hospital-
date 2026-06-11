const mongoose = require('mongoose');
import type { Document, Types } from 'mongoose';

export interface IAppointment extends Document {
    userId: Types.ObjectId;
    doctorId: Types.ObjectId;
    date: Date;
    startTime: string;
    endTime?: string;
    status: 'booked' | 'confirmed' | 'completed' | 'cancelled';
    tokenNumber?: string;
    qrCode?: string;
}

const AppointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String },
    status: { type: String, enum: ['booked', 'confirmed', 'completed', 'cancelled'], default: 'booked' },
    tokenNumber: { type: String },
    qrCode: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
