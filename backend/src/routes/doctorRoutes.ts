const express = require('express');
const { GetDoctors, GetDoctorById } = require('../controllers/doctorController');

const router = express.Router();

router.get('/', GetDoctors);
router.get('/:id', GetDoctorById);

module.exports = router;
