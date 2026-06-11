const mongoose = require('mongoose');
import type { Document } from 'mongoose';

export interface IDoctor extends Document {
    name: string;
    email: string;
    speciality: string;
    degree: string;
    experience: string;
    about: string;
    fees: number;
    image: string;
}

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    fees: { type: Number, required: true },
    image: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', DoctorSchema);
