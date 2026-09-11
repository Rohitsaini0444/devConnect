const {SQSClient, SendMessageCommand} = require('@aws-sdk/client-sqs');
const logger = require('../config/logger');
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
        logger.info({ recipient: emailData.recipient }, 'Email message sent to queue');
        return response;
    } catch (error) {
        logger.error({ err: error, recipient: emailData?.recipient }, 'Failed to send email message to queue');
        throw error;
    }
};

module.exports = { sendEmailMessageToQueue };
