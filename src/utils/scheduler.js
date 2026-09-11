const cron = require('node-cron');
const logger = require('../config/logger');

// Schedule a cron job to run every week at 12:00 AM on Monday
const runCronJob = (fn) => {
    try {
        cron.schedule(process.env.CRON_FREQUENCY_FOR_ADMIN_EMAIL, async () => {
            logger.info('Scheduled job started');
            await fn();
            logger.info('Scheduled job completed');
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to schedule job');
    }
};

module.exports = { runCronJob };