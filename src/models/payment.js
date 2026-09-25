const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created'
    },
    receipt: {
        type: String,
        required: true
    },
    membershipType: {
        type: String,
        enum: ['silver', 'gold'],
        required: true
    },
    notes: {
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String }
    }

}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;