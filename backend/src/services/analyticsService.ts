const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Queue = require('../models/Queue');
const Schedule = require('../models/Schedule');

export interface AnalyticsResult {
    doctorName: string;
    speciality: string;
    avgWaitTime: string;
    peakHours: string[];
    lowRushHours: string[];
    busyDays: string[];
    lessBusyDays: string[];
    todayWaitingPatientsCount: number;
}

/**
 * Get analytics for a specific doctor based on booking patterns and today's queue size.
 */
export const getDoctorAnalytics = async (doctorId: string): Promise<AnalyticsResult> => {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new Error('Invalid Doctor ID format');
    }
    const docObjectId = new mongoose.Types.ObjectId(doctorId);
    const doctor = await Doctor.findById(docObjectId);
    if (!doctor) {
        throw new Error('Doctor not found');
    }

    // 1. Current Wait Time Today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysAppointments = await Appointment.find({
        doctorId: docObjectId,
        date: { $gte: startOfDay, $lte: endOfDay }
    }).select('_id');
    const todaysAppointmentIds = todaysAppointments.map((a: any) => a._id);

    const activeQueue = await Queue.find({
        appointmentId: { $in: todaysAppointmentIds },
        status: { $in: ['waiting', 'in_progress'] }
    });

    const waitingPatientsCount = activeQueue.filter((q: any) => q.status === 'waiting').length;
    // Standard waiting time is 10 mins per waiting patient
    const avgWaitTimeMinutes = waitingPatientsCount > 0 ? waitingPatientsCount * 10 : 0;

    // 2. Peak Hours (Historical Bookings Grouped by startTime)
    const timeSlotStats = await Appointment.aggregate([
        {
            $match: {
                doctorId: docObjectId,
                status: { $in: ['confirmed', 'completed', 'booked'] }
            }
        },
        {
            $group: {
                _id: "$startTime",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    const peakHours = timeSlotStats.slice(0, 3).map((slot: any) => slot._id);

    // 3. Low Rush Slots
    // Cross-reference with doctor's schedule if available to find unoccupied or low-traffic working slots
    const schedule = await Schedule.findOne({ doctorId });
    let lowRushHours: string[] = [];
    if (schedule) {
        const allWorkingSlots = new Set<string>();
        schedule.workingHours.forEach((wh: any) => {
            if (wh.isWorking) {
                let [currentH, currentM] = wh.startTime.split(':').map(Number);
                const [endH, endM] = wh.endTime.split(':').map(Number);
                while (currentH < endH || (currentH === endH && currentM < endM)) {
                    allWorkingSlots.add(`${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`);
                    currentM += schedule.slotDuration;
                    if (currentM >= 60) {
                        currentH += Math.floor(currentM / 60);
                        currentM = currentM % 60;
                    }
                }
            }
        });

        const bookingMap = new Map<string, number>();
        timeSlotStats.forEach((slot: any) => {
            bookingMap.set(slot._id, slot.count);
        });

        const slotList = Array.from(allWorkingSlots).map(slot => ({
            slot,
            count: bookingMap.get(slot) || 0
        }));

        slotList.sort((a, b) => a.count - b.count);
        lowRushHours = slotList.slice(0, 3).map(item => item.slot);
    } else {
        // Fallback to least booked slots historically
        lowRushHours = [...timeSlotStats].reverse().slice(0, 3).map((slot: any) => slot._id);
    }

    // 4. Busy & Less Busy Days (Day of week patterns)
    const dayOfWeekStats = await Appointment.aggregate([
        {
            $match: {
                doctorId: docObjectId,
                status: { $in: ['confirmed', 'completed', 'booked'] }
            }
        },
        {
            $project: {
                dayOfWeek: { $dayOfWeek: "$date" }
            }
        },
        {
            $group: {
                _id: "$dayOfWeek",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const busyDays = dayOfWeekStats.slice(0, 2).map((item: any) => dayNames[item._id - 1]);
    const lessBusyDays = [...dayOfWeekStats].reverse().slice(0, 2).map((item: any) => dayNames[item._id - 1]);

    // Handle empty data fallbacks
    return {
        doctorName: doctor.name,
        speciality: doctor.speciality,
        avgWaitTime: `${avgWaitTimeMinutes} mins`,
        peakHours: peakHours.length > 0 ? peakHours : ['10:00 AM', '11:00 AM'],
        lowRushHours: lowRushHours.length > 0 ? lowRushHours : ['02:00 PM', '03:00 PM'],
        busyDays: busyDays.length > 0 ? busyDays : ['Monday', 'Tuesday'],
        lessBusyDays: lessBusyDays.length > 0 ? lessBusyDays : ['Wednesday', 'Thursday'],
        todayWaitingPatientsCount: waitingPatientsCount
    };
};

/**
 * Get overall clinic-wide analytics for general queries.
 */
export const getClinicAnalytics = async (): Promise<AnalyticsResult> => {
    // 1. Overall Waiting Patients Today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysAppointments = await Appointment.find({
        date: { $gte: startOfDay, $lte: endOfDay }
    }).select('_id');
    const todaysAppointmentIds = todaysAppointments.map((a: any) => a._id);

    const activeQueue = await Queue.find({
        appointmentId: { $in: todaysAppointmentIds },
        status: { $in: ['waiting', 'in_progress'] }
    });

    const waitingPatientsCount = activeQueue.filter((q: any) => q.status === 'waiting').length;
    // Clinic-wide average wait time estimation
    const avgWaitTimeMinutes = waitingPatientsCount > 0 ? Math.round((waitingPatientsCount * 10) / Math.max(1, todaysAppointmentIds.length / 5)) : 0;

    // 2. Clinic-wide Peak Hours
    const timeSlotStats = await Appointment.aggregate([
        {
            $match: {
                status: { $in: ['confirmed', 'completed', 'booked'] }
            }
        },
        {
            $group: {
                _id: "$startTime",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    const peakHours = timeSlotStats.slice(0, 3).map((slot: any) => slot._id);
    const lowRushHours = [...timeSlotStats].reverse().slice(0, 3).map((slot: any) => slot._id);

    // 3. Clinic-wide Busy Days
    const dayOfWeekStats = await Appointment.aggregate([
        {
            $match: {
                status: { $in: ['confirmed', 'completed', 'booked'] }
            }
        },
        {
            $project: {
                dayOfWeek: { $dayOfWeek: "$date" }
            }
        },
        {
            $group: {
                _id: "$dayOfWeek",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const busyDays = dayOfWeekStats.slice(0, 2).map((item: any) => dayNames[item._id - 1]);
    const lessBusyDays = [...dayOfWeekStats].reverse().slice(0, 2).map((item: any) => dayNames[item._id - 1]);

    return {
        doctorName: 'Clinic-wide Assistant',
        speciality: 'General Clinic Analytics',
        avgWaitTime: `${avgWaitTimeMinutes || 15} mins`,
        peakHours: peakHours.length > 0 ? peakHours : ['10:00 AM', '11:00 AM'],
        lowRushHours: lowRushHours.length > 0 ? lowRushHours : ['02:00 PM', '04:00 PM'],
        busyDays: busyDays.length > 0 ? busyDays : ['Monday', 'Wednesday'],
        lessBusyDays: lessBusyDays.length > 0 ? lessBusyDays : ['Friday', 'Saturday'],
        todayWaitingPatientsCount: waitingPatientsCount
    };
};
