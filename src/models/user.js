const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    age: {
        type: Number,
        min: 13
    },
    gender: {
        type: String,
        validate: {
            validator: function (value) {
                if (!['male', 'female', 'other'].includes(value.toLowerCase())) {
                    throw new Error('Invalid gender value');
                }
            }
        }
    },
    photoURL: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        validate: {
            validator: function (value) {
                if (value && !validator.isURL(value)) {
                    throw new Error('Invalid photo URL');
                }
            }
        }
    },
    skills: {
        type: [String]
    },
    about: {
        type: String,
        default: "Hey there! I am using Developer Connect."
    },
    premiumMember: {
        type: Boolean,
        default: false
    },
    membershipExpiry: {
        type: Date,
        default: null
    },
    membershipType: {
        type: String,
        default: null
    }
}, { timestamps: true })

userSchema.methods.getAuthenticatedUser = async function () {
    const user = this;
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10h' });
    return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;
    return await bcrypt.compare(passwordInputByUser, passwordHash);
}

const User = mongoose.model('User', userSchema);

module.exports = User;