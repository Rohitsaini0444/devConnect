const express = require('express');
const router = express.Router();
const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData, validatePasswordChange } = require('../utils/validator');
const bcrypt = require('bcrypt');
const { getProfilePhotoUploadUrl } = require('../controller/profilePhotoController');

// Get user profile
router.get('/view', userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      message: "User profile fetched successfully",
      user
    })
  } catch (error) {
    res.status(400).json({
      message: "Error fetching user profile",
      error: error?.message
    })
  }
});

router.post('/edit', userAuth, async (req, res) => {
  try {
    validateEditProfileData(req);
    const updates = req.body;
    const loggedInUser = req.user;
    
    Object.keys(updates).forEach((key) => {
      loggedInUser[key] = updates[key];
    });
    
    await loggedInUser.save();
    res.status(200).json({
      message: "User profile updated successfully",
      user: loggedInUser
    })
  } catch (error) {
    res.status(400).json({
      message: error?.message || "Error updating user profile",
      error: error?.message
    })
  }
});

// update password
router.patch('/password', userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // Validate password change
    validatePasswordChange(oldPassword, newPassword);
    
    const loggedInUser = req.user;
    const isMatch = await loggedInUser.validatePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({     
        message: "Invalid old password"
      })
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    loggedInUser.password = hashedPassword;
    await loggedInUser.save();
    res.status(200).json({
      message: "Password updated successfully"
    })
  } catch (error) {
    res.status(400).json({
      message: error?.message || "Error updating password",
      error: error?.message
    })
  }
});

router.post(
    "/photo/upload-url",
    userAuth,
    getProfilePhotoUploadUrl
);

module.exports = router;