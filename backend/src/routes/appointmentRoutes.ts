const express = require('express');
const { BookAppointment, GetUserAppointments, GetAvailableSlots, UpdateAppointment, DeleteAppointment, GetAppointmentById } = require('../controllers/appointmentController');
const { Protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/slots', GetAvailableSlots);
router.post('/', Protect, BookAppointment);
router.get('/user', Protect, GetUserAppointments);
router.get('/:id', Protect, GetAppointmentById);
router.put('/:id', Protect, UpdateAppointment);
router.delete('/:id', Protect, DeleteAppointment);

module.exports = router;
