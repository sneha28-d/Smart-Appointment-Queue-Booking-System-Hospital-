import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware';
const mongoose = require('mongoose');
const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const { getIO } = require('../config/socket');
const { SendEmail } = require('../services/notificationService');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const GetQueue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { appointmentId } = req.query;
        const statusMap: Record<string, 'Waiting' | 'Next' | 'Completed' | 'Skipped'> = {
            waiting: 'Waiting',
            in_progress: 'Next',
            completed: 'Completed',
            skipped: 'Skipped'
        };
        const mapItem = (item: any, position: number, estimatedWait: number) => {
            const appt = item.appointmentId;
            const user = appt?.userId;
            const doctor = appt?.doctorId;
            const patientName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Patient' : 'Patient';
            const doctorName = doctor?.name || 'Doctor';
            const tokenNum = typeof item.tokenNumber === 'string' ? item.tokenNumber.replace('TKN-', '') : String(item.tokenNumber ?? '');
            const appointmentRef = appt?._id?.toString()?.slice(-8)?.toUpperCase() ?? '—';
            return {
                _id: item._id,
                appointmentId: appt?._id?.toString() ?? item.appointmentId?.toString() ?? '',
                appointmentRef,
                userId: user?._id?.toString() ?? '',
                patientName,
                doctorName,
                time: appt?.startTime ?? '',
                date: appt?.date ?? null,
                tokenNumber: tokenNum,
                position: position >= 0 ? position : 0,
                status: statusMap[item.status] ?? 'Waiting',
                estimatedWait
            };
        };
        if (appointmentId && appointmentId !== 'all') {
            const appointmentIdStr = typeof appointmentId === 'string' ? appointmentId : undefined;
            if (!appointmentIdStr || !mongoose.Types.ObjectId.isValid(appointmentIdStr)) {
                res.status(400).json({ msg: 'Invalid appointmentId', sucess: false });
                return;
            }
            const queueItem = await Queue.findOne({ appointmentId: appointmentIdStr }).populate({
                path: 'appointmentId',
                populate: [
                    { path: 'userId', model: 'User' },
                    { path: 'doctorId', model: 'Doctor' }
                ]
            });
            if (!queueItem) {
                res.status(404).json({ msg: 'Queue item not found', sucess: false });
                return;
            }

            const appt = queueItem.appointmentId;
            const docId = appt?.doctorId?._id || appt?.doctorId;
            const apptDate = appt?.date ? new Date(appt.date) : new Date();

            const startOfDay = new Date(apptDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(apptDate);
            endOfDay.setHours(23, 59, 59, 999);

            const todaysAppointments = await Appointment.find({
                doctorId: docId,
                date: { $gte: startOfDay, $lte: endOfDay }
            }).select('_id');
            const todaysAppointmentIds = todaysAppointments.map((a: any) => a._id);

            const activeQueue = await Queue.find({
                appointmentId: { $in: todaysAppointmentIds },
                status: { $in: ['waiting', 'in_progress'] }
            }).sort({ createdAt: 1 });

            const position = activeQueue.findIndex((i: any) => i._id.toString() === queueItem._id.toString());
            const finalPosition = position >= 0 ? position : 0;
            const estimatedWait = finalPosition > 0 ? finalPosition * 10 : 0;

            res.status(200).json({ msg: 'Sucessfull', sucess: true, data: mapItem(queueItem, finalPosition, estimatedWait) });
            return;
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch all appointments for today
        const todaysAppointments = await Appointment.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).select('_id doctorId');

        // Fetch all queue items created today (or associated with today's appointments)
        const todaysApptIds = todaysAppointments.map((a: any) => a._id);
        const allQueue = await Queue.find({
            $or: [
                { createdAt: { $gte: startOfDay } },
                { appointmentId: { $in: todaysApptIds } }
            ]
        }).populate({
            path: 'appointmentId',
            populate: [
                { path: 'userId', model: 'User' },
                { path: 'doctorId', model: 'Doctor' }
            ]
        }).sort({ createdAt: 1 });

        // Group active queue items by doctorId
        const activeQueueByDoctor: Record<string, any[]> = {};
        allQueue.forEach((item: any) => {
            if (item.status === 'waiting' || item.status === 'in_progress') {
                const docId = item.appointmentId?.doctorId?._id?.toString() || item.appointmentId?.doctorId?.toString() || 'unknown';
                if (!activeQueueByDoctor[docId]) {
                    activeQueueByDoctor[docId] = [];
                }
                activeQueueByDoctor[docId].push(item);
            }
        });

        const mappedQueue = allQueue.map((item: any) => {
            let position = 0;
            let estimatedWait = 0;
            if (item.status === 'waiting' || item.status === 'in_progress') {
                const docId = item.appointmentId?.doctorId?._id?.toString() || item.appointmentId?.doctorId?.toString() || 'unknown';
                const docActiveQueue = activeQueueByDoctor[docId] || [];
                const idx = docActiveQueue.findIndex((q: any) => q._id.toString() === item._id.toString());
                position = idx >= 0 ? idx : 0;
                estimatedWait = position > 0 ? position * 10 : 0;
            } else {
                position = -1;
            }
            return mapItem(item, position, estimatedWait);
        });
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: mappedQueue });
    } catch (error: any) {
        console.error('GetQueue error:', error);
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const CheckIn = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { appointmentId } = req.body;
        const queueItem = await Queue.findOne({ appointmentId });
        if (!queueItem) {
            res.status(404).json({ msg: 'Queue item not found', sucess: false });
            return;
        }
        queueItem.status = 'in_progress';
        await queueItem.save();
        try {
            const appointment = await Appointment.findById(appointmentId).populate('userId');
            const user = (appointment?.userId as any);
            if (user && user.email) {
                SendEmail(
                    user.email,
                    'Its Your Turn! - QueueSync',
                    `Hi ${user.firstName}, your turn has arrived! Please proceed to the doctor chamber.`,
                    `<h1>It's Your Turn!</h1><p>Hi ${user.firstName},</p><p>Your turn has arrived for your appointment (Token: ${queueItem.tokenNumber}). Please proceed to the doctor's chamber immediately.</p>`
                ).catch((err: any) => console.error('Error sending turn email:', err));
            }
        } catch (emailErr) {
            console.warn('Turn email notification failed (non-critical):', emailErr);
        }
        getIO().emit('queue-update', { msg: 'Queue status updated to in_progress', queueItem });
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: queueItem });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const CompleteQueueItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { appointmentId } = req.body;
        console.log('Completing item for appointmentId:', appointmentId);
        const queueItem = await Queue.findOne({ appointmentId });
        if (!queueItem) {
            console.log('Queue item not found for:', appointmentId);
            res.status(404).json({ msg: 'Queue item not found', sucess: false });
            return;
        }
        queueItem.status = 'completed';
        await queueItem.save();
        const appointment = await Appointment.findById(appointmentId);
        if (appointment) {
            appointment.status = 'completed';
            await appointment.save();
        } else {
            console.log('Appointment not found for:', appointmentId);
        }
        getIO().emit('queue-update', { msg: 'Queue item completed', appointmentId });
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: queueItem });
    } catch (error: any) {
        console.error('CompleteQueueItem error:', error);
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const CallNext = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const currentNext = await Queue.findOne({ status: 'in_progress' });
        if (currentNext) {
            currentNext.status = 'completed';
            await currentNext.save();
            const appointment = await Appointment.findById(currentNext.appointmentId);
            if (appointment) {
                appointment.status = 'completed';
                await appointment.save();
            }
            getIO().emit('queue-update', { msg: 'Previous item completed', queueItem: currentNext });
        }
        const nextWaiting = await Queue.findOne({ status: 'waiting' }).sort({ createdAt: 1 });
        if (nextWaiting) {
            nextWaiting.status = 'in_progress';
            await nextWaiting.save();
            try {
                const appointment = await Appointment.findById(nextWaiting.appointmentId).populate('userId');
                const user = (appointment?.userId as any);
                if (user && user.email) {
                    SendEmail(
                        user.email,
                        'Its Your Turn! - QueueSync',
                        `Hi ${user.firstName}, your turn has arrived! Please proceed to the doctor chamber.`,
                        `<h1>It's Your Turn!</h1><p>Hi ${user.firstName},</p><p>Your turn has arrived for your appointment (Token: ${nextWaiting.tokenNumber}). Please proceed to the doctor's chamber immediately.</p>`
                    ).catch((err: any) => console.error('Error sending turn email:', err));
                }
            } catch (emailErr) {
                console.warn('Turn email notification failed (non-critical):', emailErr);
            }
            getIO().emit('queue-update', { msg: 'Next patient called', queueItem: nextWaiting });
            res.status(200).json({ msg: 'Sucessfull', sucess: true, data: nextWaiting });
            return;
        } else {
            res.status(404).json({ msg: 'No more patients in waiting list', sucess: false });
            return;
        }
    } catch (error: any) {
        console.error('CallNext error:', error);
        if (!res.headersSent) {
            res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
        }
    }
};

const SkipQueueItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { appointmentId } = req.body;
        const queueItem = await Queue.findOne({ appointmentId });
        if (!queueItem) {
            res.status(404).json({ msg: 'Queue item not found', sucess: false });
            return;
        }
        queueItem.status = 'skipped';
        await queueItem.save();
        getIO().emit('queue-update', { msg: 'Queue item skipped', queueItem });
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: queueItem });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

module.exports = { GetQueue, CheckIn, CompleteQueueItem, CallNext, SkipQueueItem };
