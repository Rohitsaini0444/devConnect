const { runCronJob } = require('../utils/scheduler.js');
const User = require('../models/user.js');

const sendWeeklySignupReportToAdmin = async () => {
    try {
        console.log('Running weekly signup report task...');
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
                console.log(`Weekly new user signup report email message sent to queue for admin: ${adminEmail}`);
            }
        }
    } catch (error) {
        console.error('Error occurred while scheduling email:', error);
    }
};

module.exports = {
    startWeeklyReportsScheduler: () => {
        runCronJob(sendWeeklySignupReportToAdmin);
    }
}