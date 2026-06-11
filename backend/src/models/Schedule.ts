const mongoose = require('mongoose');
import type { Document } from 'mongoose';

export interface IWorkingHour {
    day: string;
    startTime: string;
    endTime: string;
    isWorking: boolean;
}

export interface ISchedule extends Document {
    doctorId: string;
    workingHours: IWorkingHour[];
    slotDuration: number;
}

const WorkingHourSchema = new mongoose.Schema({
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isWorking: { type: Boolean, default: true },
}, { _id: false });

const ScheduleSchema = new mongoose.Schema({
    doctorId: { type: String, required: true, default: 'default' },
    workingHours: { type: [WorkingHourSchema], required: true },
    slotDuration: { type: Number, required: true, default: 30 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
