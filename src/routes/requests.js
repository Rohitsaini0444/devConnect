const express = require('express');
const router = express.Router();
const Connection = require('../models/connections');

router.post('/send/:status/:userId', async (req, res) => {
    try {
        const { status } = req.params;
        const { userId } = req.params;
        const fromUserId = req.user?._id;
        const allowedStatuses = ['ignored', 'interested'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            })
        }
        if(fromUserId.toString() === userId) {
            return res.status(400).json({
                message: "You cannot send a request to yourself"
            })
        }
        const existingRequest = await Connection.findOne({
            $or: [
                { fromUserId, toUserId: userId },
                { fromUserId: userId, toUserId: fromUserId }
            ]
        });
        if (existingRequest) {
            return res.status(400).json({
                message: "Request already exists"
            });
        }
        const connection = new Connection({
            fromUserId,
            toUserId: userId,
            status
        });
        await connection.save();
        req.log.info({ fromUserId, toUserId: userId, status }, "Connection request sent");
        res.status(200).json({
            message: "Request sent successfully"
        })
    } catch (error) {
        req.log.error({ err: error, fromUserId: req.user?._id, toUserId: req.params?.userId }, "Failed to send connection request");
        res.status(400).json({
            message: "Error sending request",
            error: error?.message
        })
    }
});

router.post('/review/:status/:requestId', async (req, res) => {
    try {
        const { status } = req.params;
        const { requestId } = req.params;
        const allowedStatuses = ['accepted', 'rejected'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            })
        }
        if(req?.user?._id.toString() === requestId) {
            return res.status(400).json({
                message: "You cannot review your own request"
            })
        }
        const existingRequest = await Connection.findOne({ _id: requestId , toUserId: req?.user?._id , status: 'interested' });
        if (!existingRequest) {
            return res.status(404).json({
                message: "Request not found for review"
            });
        }
        existingRequest.status = status;
        await existingRequest.save();
        req.log.info({ userId: req.user?._id, requestId, status }, "Connection request reviewed");
        res.status(200).json({
            message: "Request reviewed successfully",
            connection: existingRequest
        })
    } catch (error) {
        req.log.error({ err: error, userId: req.user?._id, requestId: req.params?.requestId }, "Failed to review connection request");
        res.status(400).json({
            message: "Error reviewing request",
            error: error?.message
        })
    }
});


module.exports = router;