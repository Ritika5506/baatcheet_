import { io } from "socket.io-client";

console.log("🔌 Initializing socket connection");

// Get API URL from environment variable or use localhost
const API_URL = process.env.REACT_APP_API_URL || "https://baatcheet-2-xd3b.onrender.com/";

const socket = io(API_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

socket.on("connect", () => {
  console.log("✅ Socket connected");
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

socket.on("error", (error) => {
  console.error("❌ Socket error:", error);
});

// Function to register user
export const registerUser = (userId) => {
  console.log("📨 Registering user:", userId);
  if (socket.connected) {
    socket.emit("userConnected", userId);
  } else {
    // If socket not connected yet, wait for it
    socket.once("connect", () => {
      console.log("📨 Socket connected, now registering user:", userId);
      socket.emit("userConnected", userId);
    });
  }
};

export default socket;
