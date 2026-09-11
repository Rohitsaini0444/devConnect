const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const Connections = require("../models/connections");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoURL age gender about skills";

// Get all the pending connection request for the loggedIn user
userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await Connections.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    // }).populate("fromUserId", ["firstName", "lastName"]);

    req.log.info({ userId: loggedInUser._id, count: connectionRequests.length }, "Received connection requests fetched");
    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    req.log.error({ err, userId: req.user?._id }, "Failed to fetch received connection requests");
    req.statusCode(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await Connections.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    req.log.info({ userId: loggedInUser._id, count: data.length }, "Connections fetched");
    res.json({ data });
  } catch (err) {
    req.log.error({ err, userId: req.user?._id }, "Failed to fetch connections");
    res.status(400).send({ message: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await Connections.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    req.log.info({ userId: loggedInUser._id, page, limit, count: users.length }, "User feed fetched");
    res.json({ data: users });
  } catch (err) {
    req.log.error({ err, userId: req.user?._id }, "Failed to fetch user feed");
    res.status(400).json({ message: err.message });
  }
});
module.exports = userRouter;