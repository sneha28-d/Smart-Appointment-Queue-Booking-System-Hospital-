const mongoose = require('mongoose');
import type { Document } from 'mongoose';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phoneNumber?: string;
    role: 'admin' | 'customer';
}

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phoneNumber: { type: String },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
