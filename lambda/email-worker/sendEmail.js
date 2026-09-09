const { SendEmailCommand } = require('@aws-sdk/client-ses');
const { sesClient } = require('./sesClient.js');

const createSendEmailCommand = (fromAddress, toAddress, subject, body) => {
    return new SendEmailCommand({
        Destination: {
            CcAddresses: [
            ],
            ToAddresses: [
                toAddress,
            ],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: body
                },
                Text: {
                    Charset: "UTF-8",
                    Data: body,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: fromAddress,
        ReplyToAddresses: [],
    });
};

const run = async (fromAddress, toAddress, subject, body) => {
    const sendEmailCommand = createSendEmailCommand(
        fromAddress,
        toAddress,
        subject,
        body
    );

    try {
        return await sesClient.send(sendEmailCommand);
    } catch (error) {
        if (error instanceof Error && error.name === "MessageRejected") {
            const messageRejectedError = error;
            return messageRejectedError;
        }
        throw error;
    }
};

module.exports = { run };