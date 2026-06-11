const mongoose = require('mongoose');
import type { Document } from 'mongoose';

export interface IService extends Document {
    name: string;
    description?: string;
    duration: number;
    fees: number;
    isActive: boolean;
}

const ServiceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true },
    fees: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);
