const express = require('express');
const { GetQueue, CheckIn, CompleteQueueItem, CallNext, SkipQueueItem } = require('../controllers/queueController');
const { Protect, Admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', GetQueue);
router.post('/checkin', Protect, CheckIn);
router.post('/complete', Protect, Admin, CompleteQueueItem);
router.post('/callnext', Protect, Admin, CallNext);
router.post('/skip', Protect, Admin, SkipQueueItem);

module.exports = router;
