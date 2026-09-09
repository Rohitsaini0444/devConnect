const { SESClient } = require('@aws-sdk/client-ses');
const REGION = process.env.AWS_USER_REGION;
const sesClient = new SESClient({ region: REGION },{
  credentials: {
    accessKeyId: process.env.AWS_USER_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_USER_SECRET_ACCESS_KEY,
  },
});
module.exports = { sesClient };