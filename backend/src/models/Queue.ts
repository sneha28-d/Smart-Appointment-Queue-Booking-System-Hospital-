const mongoose = require('mongoose');
import type { Document, Types } from 'mongoose';

export interface IQueue extends Document {
    appointmentId: Types.ObjectId;
    tokenNumber: string;
    status: 'waiting' | 'in_progress' | 'completed' | 'skipped';
}

const QueueSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    tokenNumber: { type: String, required: true },
    status: { type: String, enum: ['waiting', 'in_progress', 'completed', 'skipped'], default: 'waiting' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Queue', QueueSchema);
