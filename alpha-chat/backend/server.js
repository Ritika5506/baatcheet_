const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
require("dotenv").config();

const connectDB = require("./config/db");
const Message = require("./models/Message");

console.log("Starting server...");
connectDB().then(() => {
  console.log("✅ MongoDB connected");
}).catch(err => {
  console.error("❌ MongoDB connection failed:", err);
});

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" }
});

// Map to store user socket connections
const userSockets = new Map();

// Socket.io
io.on("connection", (socket) => {
  console.log("🔗 New client connected:", socket.id);

  // Register user socket
  socket.on("userConnected", (userId) => {
    console.log("✅ User connected:", userId, "with socket:", socket.id);
    userSockets.set(userId, socket.id);
    console.log("📊 Active users:", userSockets.size);
  });

  // Listen for messages
  socket.on("sendMessage", async (data) => {
    console.log("📨 Received sendMessage event");
    console.log("📨 Message data:", {
      sender: data.sender,
      receiver: data.receiver,
      text: data.text?.substring(0, 50),
      hasMedia: !!data.media
    });
    
    try {
      // Only save text and basic info to database
      const messageData = {
        sender: data.sender,
        receiver: data.receiver,
        text: data.text || "",
        media: data.media ? {
          name: data.media.name,
          type: data.media.type,
          size: data.media.size,
          data: data.media.data
        } : null
      };

      console.log("💾 Saving message to database...");
      const newMessage = new Message(messageData);
      const savedMessage = await newMessage.save();
      
      console.log("✅ Message saved:", savedMessage._id);

      // Populate sender and receiver data
      const populatedMessage = await Message.findById(savedMessage._id)
        .populate("sender receiver", "-password");

      console.log("📤 Populated message ready to send");

      // Get receiver's socket ID and emit to them
      const receiverSocketId = userSockets.get(data.receiver);
      console.log("🔍 Looking for receiver:", data.receiver, "->", receiverSocketId);
      
      if (receiverSocketId) {
        console.log("📤 Sending message to receiver:", data.receiver);
        io.to(receiverSocketId).emit("receiveMessage", populatedMessage);
      } else {
        console.log("⚠️  Receiver not connected");
      }

      // Also emit back to sender for confirmation
      console.log("📤 Sending confirmation to sender");
      socket.emit("receiveMessage", populatedMessage);
    } catch (error) {
      console.error("❌ Error saving message:", error);
      socket.emit("messageError", { message: "Failed to send message", error: error.message });
    }
  });

  socket.on("disconnect", () => {
    // Remove user from map
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log("❌ User", userId, "disconnected");
        break;
      }
    }
    console.log("📊 Active users:", userSockets.size);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// Start server
const PORT = 5000;
server.listen(PORT, "127.0.0.1", () => {
  console.log(`✅ Backend running on http://127.0.0.1:${PORT}`);
});
