const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { SendEmail } = require('../services/notificationService');

const StartCronJobs = (): void => {
    cron.schedule('0 * * * *', async () => {
        console.log('Cron Job: Checking for upcoming appointments to send reminders...');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const appointments = await Appointment.find({
                date: today,
                status: 'booked'
            }).populate('userId');
            for (const appt of appointments) {
                const user: any = appt.userId;
                if (user && user.email) {
                    await SendEmail(
                        user.email,
                        'Upcoming Appointment Reminder',
                        `Reminder: You have an appointment today at ${appt.startTime}. Token: ${appt.tokenNumber}`
                    );
                }
            }
        } catch (error) {
            console.error('Error running cron job:', error);
        }
    });
};

module.exports = { StartCronJobs };
