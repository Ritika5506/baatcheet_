const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message");

// ✅ GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ✅ GET messages for a specific conversation between two users
router.get("/messages/:userId", async (req, res) => {
  try {
    const currentUserId = req.query.currentUserId;
    const otherUserId = req.params.userId;

    if (!currentUserId) {
      return res.status(400).json({ message: "currentUserId query parameter required" });
    }

    console.log("Fetching messages between:", currentUserId, "and", otherUserId);

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .populate("sender receiver", "-password")
      .sort({ createdAt: 1 })
      .lean();

    console.log("Found messages:", messages.length);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
});

// ✅ GET unread message count for each user
router.get("/unread/:userId", async (req, res) => {
  try {
    const currentUserId = req.params.userId;
    const mongoose = require("mongoose");

    // Get all users who have sent unread messages to current user
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(currentUserId),
          read: false
        }
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object format: { userId: count, userId2: count2 }
    const result = {};
    unreadCounts.forEach(item => {
      result[item._id.toString()] = item.count;
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching unread counts:", error);
    res.status(500).json({ message: "Error fetching unread counts" });
  }
});

// ✅ Mark messages as read
router.put("/mark-read/:userId", async (req, res) => {
  try {
    const currentUserId = req.params.userId;
    const { senderId } = req.body;

    await Message.updateMany(
      {
        sender: senderId,
        receiver: currentUserId,
        read: false
      },
      { read: true }
    );

    res.json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Error marking messages as read" });
  }
});

// ✅ UPDATE user
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
});

// ✅ DELETE user
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

module.exports = router;
