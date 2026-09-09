const {run} = require('./sendEmail.js');



exports.handler = async (event) => {
    try {
        for (const record of event.Records) {
            const emailData = JSON.parse(record.body);
            const { subject, body, recipient, sender } = emailData;
            await run(sender, recipient, subject, body);
        }

    } catch (error) {
        console.error('Error parsing email data:', error);
        throw error;
    }
};