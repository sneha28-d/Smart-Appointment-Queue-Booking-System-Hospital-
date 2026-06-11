const express = require('express');
const { AddService, GetServices, UpdateService, DeleteService, CreateOrUpdateSchedule, GetSchedules, GetScheduleByDoctorId, GetAnalytics, GetAllAppointments, GetNotifications, MarkNotificationRead, MarkAllNotificationsRead } = require('../controllers/adminController');
const { AddDoctor, GetDoctors, UpdateDoctor, DeleteDoctor } = require('../controllers/doctorController');
const { Protect, Admin } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// ─── Services 
router.post('/service', Protect, Admin, AddService);
router.get('/services', Protect, Admin, GetServices);
router.get('/service', Protect, Admin, GetServices);
router.put('/service/:id', Protect, Admin, UpdateService);
router.delete('/service/:id', Protect, Admin, DeleteService);

// ─── Schedule ─────────────────────────────────────────────────────────────────
router.post('/schedule', Protect, Admin, CreateOrUpdateSchedule);
router.get('/schedule', Protect, Admin, GetSchedules);
router.get('/schedule/:doctorId', Protect, Admin, GetScheduleByDoctorId);

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get('/analytics', Protect, Admin, GetAnalytics);

// ─── Appointments ─────────────────────────────────────────────────────────────
router.get('/appointments', Protect, Admin, GetAllAppointments);

// ─── Notifications ────────────────────────────────────────────────────────────
router.get('/notifications', Protect, Admin, GetNotifications);
router.put('/notifications/read-all', Protect, Admin, MarkAllNotificationsRead);
router.put('/notifications/:id/read', Protect, Admin, MarkNotificationRead);

// ─── Doctors ──────────────────────────────────────────────────────────────────
router.post('/doctor', Protect, Admin, upload.single('imageFile'), AddDoctor);
router.get('/doctors', Protect, Admin, GetDoctors);
router.put('/doctor/:id', Protect, Admin, upload.single('imageFile'), UpdateDoctor);
router.delete('/doctor/:id', Protect, Admin, DeleteDoctor);

module.exports = router;
