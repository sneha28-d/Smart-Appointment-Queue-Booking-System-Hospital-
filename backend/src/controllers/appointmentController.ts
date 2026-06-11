import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware';
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const Schedule = require('../models/Schedule');
const AdminNotification = require('../models/AdminNotification');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { GenerateQRCodeModel } = require('../services/qrService');
const { SendAppointmentConfirmationEmail, SendAppointmentCancellationEmail, SendAdminBookingNotification } = require('../services/notificationService');
const { getIO } = require('../config/socket');

const BookAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { doctorId, date, time } = req.body;
        const userId = req.user?._id;
        if (!doctorId || !date || !time) {
            res.status(400).json({ msg: 'doctorId, date and time are required', sucess: false });
            return;
        }
        const parsedDate = new Date(date);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const existingAppointment = await Appointment.findOne({
            doctorId,
            date: { $gte: startOfDay, $lte: endOfDay },
            startTime: time,
            status: { $in: ['booked', 'confirmed'] }
        });
        if (existingAppointment) {
            res.status(400).json({ msg: 'This slot is already booked. Please choose another time.', sucess: false });
            return;
        }
        const todayCount = await Appointment.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay } });
        const tokenNumber = `TKN-${todayCount + 1}`;
        const appointment = await Appointment.create({
            userId,
            doctorId,
            date: parsedDate,
            startTime: time,
            status: 'confirmed',
            tokenNumber
        });
        try {
            const qrCode = await GenerateQRCodeModel(`APP-${appointment._id}-${tokenNumber}`);
            appointment.qrCode = qrCode;
            await appointment.save();
        } catch (qrErr) {
            console.warn('QR generation failed (non-critical):', qrErr);
        }
        try {
            await Queue.create({ appointmentId: appointment._id, tokenNumber, status: 'waiting' });
        } catch (queueErr) {
            console.warn('Queue entry failed (non-critical):', queueErr);
        }
        getIO().emit('queue-update', { msg: 'New appointment added to queue' });
        const populated = await Appointment.findById(appointment._id).populate('doctorId');
        const doc = (populated?.doctorId as any);
        const patientName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || 'Patient';
        const patientPhone = req.user?.phoneNumber || '';
        const formattedDate = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (req.user?.email) {
            SendAppointmentConfirmationEmail(req.user.email, req.user.firstName || 'Patient', doc?.name || 'Your Doctor', formattedDate, time, tokenNumber)
                .catch((err: any) => console.warn('Confirmation email failed (non-critical):', err));
        }
        SendAdminBookingNotification({
            patientName,
            patientEmail: req.user?.email || '',
            patientPhone,
            doctorName: doc?.name || 'Unknown Doctor',
            date: formattedDate,
            time,
            tokenNumber,
        }).catch((err: any) => console.warn('Admin notification email failed (non-critical):', err));
        AdminNotification.create({
            title: 'New Appointment Booked',
            message: `${patientName} booked an appointment with ${doc?.name || 'a doctor'} on ${formattedDate} at ${time}.`,
            type: 'booking',
            meta: {
                patientName,
                patientEmail: req.user?.email || '',
                patientPhone,
                doctorName: doc?.name || 'Unknown Doctor',
                date: formattedDate,
                time,
                tokenNumber,
                appointmentId: String(appointment._id),
            },
        }).then((notif: any) => { getIO().emit('admin-notification', notif); })
          .catch((err: any) => console.warn('Admin DB notification failed (non-critical):', err));
        res.status(201).json({
            msg: 'Sucessfull',
            sucess: true,
            data: {
                _id: appointment._id,
                userId: appointment.userId,
                doctorId: doc?._id || doctorId,
                doctorName: doc?.name || 'Doctor',
                doctorImage: doc?.image || '',
                doctorSpeciality: doc?.speciality || '',
                date: appointment.date,
                time: appointment.startTime,
                status: appointment.status,
                fees: doc?.fees || 0,
                tokenNumber: appointment.tokenNumber,
                qrCode: appointment.qrCode,
                createdAt: (appointment as any).createdAt,
            }
        });
    } catch (error: any) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ msg: 'Failed to book appointment', sucess: false, error: error.message });
    }
};

const GetUserAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const appointments = await Appointment.find({ userId: req.user?._id }).populate('doctorId').sort({ date: -1 });
        const data = appointments.map((app: any) => ({
            _id: app._id,
            user: app.userId,
            doctorId: app.doctorId?._id || '',
            doctorName: app.doctorId?.name || 'Unknown Doctor',
            doctorImage: app.doctorId?.image || '',
            doctorSpeciality: app.doctorId?.speciality || 'General',
            date: app.date,
            time: app.startTime,
            status: app.status === 'booked' ? 'confirmed' : app.status,
            fees: app.doctorId?.fees || 0,
            qrCode: app.qrCode,
            createdAt: app.createdAt
        }));
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data });
    } catch (error: any) {
        console.error('GetUserAppointments error:', error);
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const GetAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const appointment = await Appointment.findById(req.params['id']).populate('doctorId');
        if (!appointment) {
            res.status(404).json({ msg: 'Appointment not found', sucess: false });
            return;
        }
        const data = {
            _id: appointment._id,
            user: appointment.userId,
            doctorId: (appointment.doctorId as any)?._id || '',
            doctorName: (appointment.doctorId as any)?.name || 'Unknown Doctor',
            doctorImage: (appointment.doctorId as any)?.image || '',
            doctorSpeciality: (appointment.doctorId as any)?.speciality || 'General',
            date: appointment.date,
            time: appointment.startTime,
            status: appointment.status === 'booked' ? 'confirmed' : appointment.status,
            fees: (appointment.doctorId as any)?.fees || 0,
            qrCode: appointment.qrCode,
            createdAt: (appointment as any).createdAt
        };
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data });
    } catch (error: any) {
        console.error('GetAppointmentById error:', error);
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const UpdateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { date, time, status } = req.body;
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ msg: 'Appointment not found', sucess: false });
            return;
        }
        if (appointment.userId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
            res.status(401).json({ msg: 'Not authorized', sucess: false });
            return;
        }
        appointment.date = date || appointment.date;
        appointment.startTime = time || appointment.startTime;
        if (status) appointment.status = status;
        const updated = await appointment.save();
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: updated });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const DeleteAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ msg: 'Appointment not found', sucess: false });
            return;
        }
        if (appointment.userId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
            res.status(401).json({ msg: 'Not authorized', sucess: false });
            return;
        }
        appointment.status = 'cancelled';
        await appointment.save();
        await Queue.findOneAndUpdate({ appointmentId: appointment._id }, { status: 'skipped' });
        getIO().emit('queue-update', { msg: 'Queue updated due to cancellation' });
        const populated = await Appointment.findById(appointment._id).populate('doctorId');
        const doc = (populated?.doctorId as any);
        const user = await User.findById(appointment.userId);
        const patientName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'A patient' : 'A patient';
        const cancelDate = new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        if (user && user.email) {
            SendAppointmentCancellationEmail(
                user.email,
                user.firstName || 'Patient',
                doc?.name || 'Your Doctor',
                cancelDate,
                appointment.startTime
            ).catch((err: any) => console.warn('Cancellation email failed (non-critical):', err));
        }

        AdminNotification.create({
            title: 'Appointment Cancelled',
            message: `${patientName} cancelled their appointment with ${doc?.name || 'a doctor'} on ${cancelDate} at ${appointment.startTime}.`,
            type: 'cancellation',
            meta: {
                patientName,
                patientEmail: user?.email || '',
                patientPhone: user?.phoneNumber || '',
                doctorName: doc?.name || 'Unknown Doctor',
                date: cancelDate,
                time: appointment.startTime,
                appointmentId: String(appointment._id),
            },
        }).then((notif: any) => { getIO().emit('admin-notification', notif); })
          .catch((err: any) => console.warn('Admin DB cancellation notification failed (non-critical):', err));
        res.status(200).json({ msg: 'Appointment cancelled', sucess: true });
    } catch (error: any) {
        console.error('DeleteAppointment error:', error);
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const GetAvailableSlots = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date, doctorId } = req.query;
        if (!date) {
            res.status(400).json({ msg: 'Date query parameter is required', sucess: false });
            return;
        }
        const queryDate = new Date(date as string);
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][queryDate.getDay()];
        const docId = (doctorId as string) || 'default';
        const schedule = await Schedule.findOne({ doctorId: docId });
        if (!schedule) {
            const fallbackSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
            const booked = await Appointment.find({ date: queryDate, status: { $in: ['booked', 'confirmed'] } }).select('startTime');
            const bookedTimes = booked.map((b: any) => b.startTime);
            res.status(200).json({ msg: 'Sucessfull', sucess: true, data: fallbackSlots.filter((s: string) => !bookedTimes.includes(s)) });
            return;
        }
        const dayConfig = schedule.workingHours.find((wh: any) => wh.day === dayName);
        if (!dayConfig || !dayConfig.isWorking) {
            res.status(200).json({ msg: 'Sucessfull', sucess: true, data: [] });
            return;
        }
        const slots: string[] = [];
        let [currentH, currentM] = dayConfig.startTime.split(':').map(Number);
        const [endH, endM] = dayConfig.endTime.split(':').map(Number);
        while (currentH < endH || (currentH === endH && currentM < endM)) {
            slots.push(`${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`);
            currentM += schedule.slotDuration;
            if (currentM >= 60) {
                currentH += Math.floor(currentM / 60);
                currentM = currentM % 60;
            }
        }
        const booked = await Appointment.find({ date: queryDate, status: { $in: ['booked', 'confirmed'] } }).select('startTime');
        const bookedTimes = booked.map((b: any) => b.startTime);
        const availableSlots = slots.filter((slot: string) => !bookedTimes.includes(slot));
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: availableSlots });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

module.exports = { BookAppointment, GetUserAppointments, GetAppointmentById, UpdateAppointment, DeleteAppointment, GetAvailableSlots };
