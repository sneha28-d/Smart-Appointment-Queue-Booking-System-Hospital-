import type { Request, Response } from 'express';
const Service = require('../models/Service');
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const AdminNotification = require('../models/AdminNotification');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// ─── Services ─────────────────────────────────────────────────────────────────
const AddService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, duration, fees, isActive } = req.body;
        const service = await Service.create({ name, description, duration: Number(duration), fees: Number(fees), isActive: isActive ?? true });
        res.status(201).json({ msg: 'Sucessfull', sucess: true, data: service });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const GetServices = async (req: Request, res: Response): Promise<void> => {
    try {
        const services = await Service.find({});
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: services });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const UpdateService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ msg: 'Service not found', sucess: false });
            return;
        }
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: updated });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const DeleteService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await Service.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ msg: 'Service not found', sucess: false });
            return;
        }
        res.status(200).json({ msg: 'Service deleted', sucess: true });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

// ─── Schedule ─────────────────────────────────────────────────────────────────
const CreateOrUpdateSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { doctorId, workingHours, slotDuration } = req.body;
        const docId = doctorId || 'default';
        let schedule = await Schedule.findOne({ doctorId: docId });
        if (schedule) {
            schedule.workingHours = workingHours;
            schedule.slotDuration = Number(slotDuration);
            await schedule.save();
        } else {
            schedule = await Schedule.create({ doctorId: docId, workingHours, slotDuration: Number(slotDuration) });
        }
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: schedule });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const GetSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
        const schedules = await Schedule.find({});
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: schedules });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const GetScheduleByDoctorId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { doctorId } = req.params;
        const schedule = await Schedule.findOne({ doctorId });
        if (!schedule) {
            res.status(404).json({ msg: 'Schedule not found', sucess: false });
            return;
        }
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: schedule });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const GetAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalAppointments = await Appointment.countDocuments();
        const bookedAppointments = await Appointment.countDocuments({ status: { $in: ['booked', 'confirmed'] } });
        const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
        const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
        const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });

        const completedWithFees = await Appointment.find({ status: 'completed' }).populate('doctorId');
        const revenue = completedWithFees.reduce((sum: number, app: any) => sum + (app.doctorId?.fees || 0), 0);

        // ─── Booking Trends (Last 7 Days) ───────────────────────────────────────────
        const trends = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const endD = new Date(d);
            endD.setHours(23, 59, 59, 999);
            const count = await Appointment.countDocuments({ date: { $gte: d, $lte: endD } });
            trends.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), count });
        }

        // ─── Status Distribution ────────────────────────────────────────────────────
        const statusDistribution = [
            { status: 'Confirmed', count: bookedAppointments },
            { status: 'Completed', count: completedAppointments },
            { status: 'Pending', count: pendingAppointments },
            { status: 'Cancelled', count: cancelledAppointments }
        ];

        // ─── Peak Hours ─────────────────────────────────────────────────────────────
        const peakHoursMap: { [key: string]: number } = {};
        const all = await Appointment.find({}).select('startTime');
        all.forEach((a: any) => {
            const hour = a.startTime.split(':')[0];
            const display = parseInt(hour) >= 12 ? (parseInt(hour) === 12 ? '12PM' : `${parseInt(hour)-12}PM`) : `${parseInt(hour)}AM`;
            peakHoursMap[display] = (peakHoursMap[display] || 0) + 1;
        });
        const peakHours = Object.keys(peakHoursMap).map(hour => ({ hour, count: peakHoursMap[hour] }));

        res.status(200).json({
            msg: 'Sucessfull',
            sucess: true,
            data: {
                totalAppointments,
                bookedAppointments,
                completedAppointments,
                cancelledAppointments,
                revenue,
                bookingTrends: trends,
                statusDistribution,
                peakHours
            }
        });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

// ─── Appointments ─────────────────────────────────────────────────────────────
const GetAllAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const appointments = await Appointment.find({}).populate('doctorId').populate('userId').sort({ createdAt: -1 });
        const data = appointments.map((app: any) => ({
            _id: app._id,
            user: app.userId?._id || '',
            patientName: app.userId ? `${app.userId.firstName || ''} ${app.userId.lastName || ''}`.trim() || 'Unknown Patient' : 'Unknown Patient',
            doctorId: app.doctorId?._id || '',
            doctorName: app.doctorId?.name || 'Unknown Doctor',
            doctorImage: app.doctorId?.image || '',
            doctorSpeciality: app.doctorId?.speciality || 'General',
            date: app.date,
            time: app.startTime,
            status: app.status === 'booked' ? 'confirmed' : app.status,
            fees: app.doctorId?.fees || 0,
            tokenNumber: app.tokenNumber || '',
            qrCode: app.qrCode,
            createdAt: app.createdAt
        }));
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data });
    } catch (error: any) {
        console.error('GetAllAppointments error:', error);
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

// ─── Admin Notifications ──────────────────────────────────────────────────────
const GetNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const notifications = await AdminNotification.find({}).sort({ createdAt: -1 }).limit(100);
        res.status(200).json({ msg: 'Sucessfull', sucess: true, data: notifications });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const MarkNotificationRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await AdminNotification.findByIdAndUpdate(id, { isRead: true });
        res.status(200).json({ msg: 'Marked as read', sucess: true });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const MarkAllNotificationsRead = async (_req: Request, res: Response): Promise<void> => {
    try {
        await AdminNotification.updateMany({ isRead: false }, { isRead: true });
        res.status(200).json({ msg: 'All marked as read', sucess: true });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

module.exports = { AddService, GetServices, UpdateService, DeleteService, CreateOrUpdateSchedule, GetSchedules, GetScheduleByDoctorId, GetAnalytics, GetAllAppointments, GetNotifications, MarkNotificationRead, MarkAllNotificationsRead };
