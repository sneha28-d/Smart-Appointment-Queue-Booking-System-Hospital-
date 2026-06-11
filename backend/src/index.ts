// Load environment variables FIRST before anything else
const dotenv = require('dotenv');
dotenv.config();

import type { Request, Response } from 'express';
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { ConnectDB } = require('./config/db');
import { rateLimit } from 'express-rate-limit'
import {GoogleGenAI} from '@google/genai';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const queueRoutes = require('./routes/queueRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { NotFound, ErrorHandler } = require('./middlewares/errorMiddleware');
const { StartCronJobs } = require('./jobs/cronJobs');
const { initSocket } = require('./config/socket');

// Connect to DB
ConnectDB();

const app = express();
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})

// const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

// async function main() {
//   const response = await ai.models.generateContent({
//     model: 'gemini-2.5-flash',
//     contents: 'Write a haiku about the beauty of nature.',
//   });
//   console.log(response.text);
// }

// main();
// Apply the rate limiting middleware to all requests.
app.use(limiter)
const server = http.createServer(app);

// Setup Socket.io
const io = initSocket(server);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req: Request, res: Response) => {
    res.send('Smart Appointment API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling Middlewares
app.use(NotFound);
app.use(ErrorHandler);

// Start Cron Jobs
StartCronJobs();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
