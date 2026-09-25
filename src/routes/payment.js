const paymentRouter = require('express').Router();
const { instance } = require('../utils/razorpay');
const { userAuth } = require('../middlewares/auth');
const Payment = require('../models/payment');
const User = require('../models/user');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const logger = require('../config/logger');

paymentRouter.post('/create', userAuth, async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: amount * 100, // Amount in paise
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
            notes: {
                userId: req.user?._id.toString(),
                email: req.user?.email,
                name: `${req.user?.firstName} ${req.user?.lastName}`,
                membershipType: req.body?.membershipType || 'premium',
            },
        };
        const order = await instance.orders.create(options);
        const payment = new Payment({
            userId: req.user?._id,
            orderId: order?.id,
            amount: order?.amount / 100, // Convert back to rupees
            currency: order?.currency,
            status: order?.status,
            receipt: order?.receipt,
            membershipType: req.body?.membershipType || null,
            notes: {
                firstName: req.user?.firstName,
                lastName: req.user?.lastName,
                email: req.user?.email,
            },
        });
        await payment.save();
        logger.info({ userId: req.user?._id, orderId: order?.id }, 'Payment order created');
        res.status(200).json({ ...order, message: 'Order created successfully', razorpayKey: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        logger.error({ err: error, userId: req.user?._id }, 'Failed to create payment order');
        res.status(500).json({ error: 'Failed to create order' });
    }
});

paymentRouter.post('/webhook', async (req, res) => {
    try {
        const isWebhookSignatureValid = validateWebhookSignature(req.body, req.headers['x-razorpay-signature'], process.env.RAZORPAY_WEBHOOK_SECRET);
        if (!isWebhookSignatureValid) {
            logger.error({ userId: req.user?._id }, 'Invalid webhook signature');
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }
        if (req.body?.event !== 'payment.captured') {
            logger.info({ userId: req.user?._id, event: req.body?.event }, 'Ignoring non-payment.captured webhook event');
            const paymentDetails = req.body?.payload?.payment?.entity;
            const orderId = paymentDetails?.order_id;
            const payment = await Payment.findOne({ orderId, userId: req.user?._id });
            if (!payment) {
                logger.error({ userId: req.user?._id, orderId }, 'Payment record not found for webhook verification');
                return res.status(404).json({ error: 'Payment record not found' });
            }
            // update the payment status in your database accordingly
            payment.status = paymentDetails?.status || 'unknown';
            await payment.save();
            logger.info({ userId: req.user?._id, orderId }, 'Payment status updated to paid');
            // update the user's membership status if the payment is successful
            const user = await User.findById(req.user?._id);
            if (!user) {
                logger.error({ userId: req.user?._id }, 'User not found for membership status update');
                return res.status(404).json({ error: 'User not found' });
            }
            user.premiumMember = true;
            user.membershipType = paymentDetails?.notes?.membershipType || 'premium';
            await user.save();
            logger.info({ userId: req.user?._id }, 'User membership status updated to premium');

            return res.status(200).json({ message: 'Event ignored' });
        }
        if (req.body?.event === 'payment.failed') {
            logger.error({ userId: req.user?._id, event: req.body?.event }, 'Payment failed webhook event received');
            return res.status(200).json({ message: 'Payment failed event received' });

        }

        // send a response back to Razorpay acknowledging the webhook
        res.status(200).json({ message: 'Payment verified and status updated successfully' });

    } catch (error) {
        logger.error({ err: error, userId: req.user?._id, orderId: req.params?.orderId }, 'Failed to verify payment webhook');
        res.status(500).json({ error: 'Failed to verify payment webhook' });
    }
});

paymentRouter.get('/premium/verify', userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user?._id);
        if (!user) {
            logger.error({ userId: req.user?._id }, 'User not found for premium verification');
            return res.status(404).json({ error: 'User not found' });
        } else if (!user.premiumMember) {
            logger.info({ userId: req.user?._id }, 'User is not a premium member');
            return res.status(200).json({ isPremium: false, message: 'User is not a premium member' });
        } else if (user.premiumMember && user.membershipExpiry && user.membershipExpiry < new Date()) {
            logger.info({ userId: req.user?._id }, 'User is a premium member');
            res.status(200).json({ isPremium: true, message: 'User is a premium member' });
        }
    } catch (error) {
        logger.error({ err: error, userId: req.user?._id }, 'Failed to verify premium status');
        res.status(500).json({ error: 'Failed to verify premium status' });
    }
});

module.exports = paymentRouter;