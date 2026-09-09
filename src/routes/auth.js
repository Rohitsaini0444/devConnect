const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { validateUserData } = require('../utils/validator');
const { run } = require('../utils/sendEmail');
const { sendEmailMessageToQueue } = require('../services/emailQueue.service');

// Signup user
router.post('/signup', async (req, res) => {
    try {
        validateUserData(req.body);
        // Hashing password before saving to database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = new User({
            firstName: req.body?.firstName,
            lastName: req.body?.lastName,
            email: req.body?.email,
            password: hashedPassword
        });
        const savedUser = await user.save();
        const token = await savedUser.getAuthenticatedUser();
        res.cookie('token', token, { httpOnly: true, expires: new Date(Date.now() + 3600000) });
        try {
            if (process.env.EMAIL_SERVICE_ENABLED === true || process.env.EMAIL_SERVICE_ENABLED === 'true') {
                 const emailData = {
                    subject: "Welcome to DevConnect",
                    body: "Thank you for signing up! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.",
                    recipient: savedUser.email,
                    sender: process.env.SENDER_EMAIL_ADDRESS
                };
                await sendEmailMessageToQueue(emailData);
                console.log('Email message sent to queue successfully');
            }
        } catch (error) {
            console.error('Error sending welcome email:', error);
        }
        res.status(200).json({
            message: "User created successfully",
            user: savedUser
        })
    } catch (error) {
        res.status(400).json({
            message: error?.message || "Error creating user"
        })
    }
});

//Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email: req.body?.email });
        if (!user) {
            return res.status(404).json({
                message: "User not found. Please check your email or sign up."
            })
        }
        const isMatch = await user.validatePassword(req.body?.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password. Please try again."
            })
        }
        const token = await user.getAuthenticatedUser();
        res.cookie('token', token, { httpOnly: true, expires: new Date(Date.now() + 3600000) });
        res.status(200).json({
            message: "User logged in successfully",
            user
        })
    } catch (error) {
        res.status(400).json({
            message: error?.message || "Error logging in user"
        })
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.send({
        message: "User logged out successfully"
    })
});


module.exports = router;
