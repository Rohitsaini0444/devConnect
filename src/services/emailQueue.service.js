const {SQSClient, SendMessageCommand} = require('@aws-sdk/client-sqs');
const sqsClient = new SQSClient({region: process.env.AWS_REGION});

const QUEUE_URL = process.env.AWS_SQS_EMAIL_QUEUE_URL;

const sendEmailMessageToQueue = async (emailData) => {
    try {
        const params = {
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(emailData),
        };
        const command = new SendMessageCommand(params);
        const response = await sqsClient.send(command);
        return response;
    } catch (error) {
        console.error('Error sending email to queue:', error);
        throw error;
    }
};

module.exports = { sendEmailMessageToQueue };
