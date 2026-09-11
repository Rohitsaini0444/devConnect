const { runCronJob } = require('../utils/scheduler.js');
const User = require('../models/user.js');
const logger = require('../config/logger');

const sendWeeklySignupReportToAdmin = async () => {
    try {
        logger.info('Weekly signup report task started');
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newUsers = await User.find({ createdAt: { $gte: oneWeekAgo } });
        const userCount = newUsers.length;
        const subject = `Weekly New User Signup Report ${oneWeekAgo.toISOString().slice(0, 10)} - ${new Date().toISOString().slice(0, 10)}`;
        const body = `<h1>Weekly New User Signup Report</h1>
        <p>Number of new users who signed up in the last week: ${userCount}</p>
        <p> List of new users:</p>
        <ul>
        ${newUsers.map(user => `<li>${user.firstName} ${user.lastName} - ${user.email}</li>`).join('')}
        </ul>`;
        const adminEmailAddresses = process.env.ADMIN_EMAIL_ADDRESS.split(',');
        if (process.env.EMAIL_SERVICE_ENABLED === true || process.env.EMAIL_SERVICE_ENABLED === 'true') {
            for (const adminEmail of adminEmailAddresses) {
                await sendEmailMessageToQueue({
                    subject,
                    body,
                    recipient: adminEmail,
                    sender: process.env.SENDER_EMAIL_ADDRESS
                });
                logger.info({ recipient: adminEmail }, 'Weekly signup report email queued');
            }
        }
    } catch (error) {
        logger.error({ err: error }, 'Weekly signup report task failed');
    }
};

module.exports = {
    startWeeklyReportsScheduler: () => {
        runCronJob(sendWeeklySignupReportToAdmin);
    }
}