const express = require('express');
const { Register, Login, GetProfile, UpdateProfile } = require('../controllers/authController');
const { Protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', Register);
router.post('/login', Login);
router.get('/profile', Protect, GetProfile);
router.put('/profile', Protect, UpdateProfile);

module.exports = router;
