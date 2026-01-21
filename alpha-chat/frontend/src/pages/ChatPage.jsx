import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { registerUser } from "../socket";
import socket from "../socket";

const ChatPage = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [selectedUser, setSelectedUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Register user with socket server
    console.log("ChatPage: Registering user", currentUser._id);
    registerUser(currentUser._id);

    // Fetch unread message counts on mount
    axios.get(`http://localhost:5000/api/users/unread/${currentUser._id}`)
      .then(res => {
        console.log("Unread counts:", res.data);
        setUnreadMessages(res.data);
      })
      .catch(err => console.log("Error fetching unread counts:", err));
  }, [currentUser, navigate]);

  // Listen for incoming messages to update unread counts
  useEffect(() => {
    if (!currentUser) return;

    const handleReceiveMessage = (msg) => {
      // Get IDs as strings for comparison
      const senderId = msg.sender?.toString?.() || msg.sender?._id?.toString?.() || msg.sender?._id || msg.sender;
      const selectedId = selectedUser?._id?.toString?.() || selectedUser?._id;

      // Only increment unread if message is NOT from currently selected user
      if (senderId !== selectedId) {
        setUnreadMessages(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [currentUser, selectedUser?._id]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // Clear unread count for this user when selected
    setUnreadMessages(prev => ({
      ...prev,
      [user._id]: 0
    }));
    // Mark messages as read on the backend
    axios.put(`https://baatcheet-2-xd3b.onrender.com/api/users/mark-read/${currentUser._id}`, {
      senderId: user._id
    }).catch(err => console.log("Error marking messages as read:", err));
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Sidebar 
        selectUser={handleSelectUser} 
        currentUser={currentUser} 
        unreadMessages={unreadMessages}
      />
      <ChatWindow currentUser={currentUser} selectedUser={selectedUser} />
    </div>
  );
};

export default ChatPage;
