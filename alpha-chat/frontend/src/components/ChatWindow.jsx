// src/components/ChatWindow.jsx
import React, { useEffect, useState } from "react";
import socket from "../socket";
import axios from "axios";
import Message from "./Message";

const ChatWindow = ({ currentUser, selectedUser }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    console.log("Fetching messages for conversation:", { currentUser: currentUser._id, selectedUser: selectedUser._id });

    // Fetch chat history for this specific conversation
    axios.get(`http://localhost:5000/api/users/messages/${selectedUser._id}?currentUserId=${currentUser._id}`)
      .then(res => {
        console.log("Fetched messages:", res.data);
        const sortedMessages = (res.data || []).sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
      })
      .catch(err => {
        console.log("Error fetching messages:", err);
        setMessages([]);
      });

    // Listen for new messages specific to this conversation
    const handleReceiveMessage = (msg) => {
      console.log("Received message:", msg);
      
      // Get IDs as strings for comparison
      const currentId = currentUser._id?.toString?.() || currentUser._id;
      const selectedId = selectedUser._id?.toString?.() || selectedUser._id;
      const senderId = msg.sender?.toString?.() || msg.sender?._id?.toString?.() || msg.sender?._id || msg.sender;
      const receiverId = msg.receiver?.toString?.() || msg.receiver?._id?.toString?.() || msg.receiver?._id || msg.receiver;

      // Check if message is part of this conversation
      const isPartOfConversation = 
        (senderId === currentId && receiverId === selectedId) ||
        (senderId === selectedId && receiverId === currentId);

      console.log("Is part of conversation:", isPartOfConversation, { senderId, receiverId, currentId, selectedId });

      if (isPartOfConversation) {
        setMessages(prev => {
          // Avoid duplicates by checking if message already exists
          const exists = prev.some(m => {
            const existingId = m._id?.toString?.() || m._id;
            const newId = msg._id?.toString?.() || msg._id;
            return existingId === newId;
          });
          
          if (!exists) {
            console.log("Adding new message to state");
            return [...prev, msg];
          }
          return prev;
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [selectedUser, currentUser]);

  const sendMessage = async () => {
    if ((!message.trim() && !file) || !selectedUser) {
      console.log("Message or file empty, or no selected user");
      return;
    }

    try {
      let mediaData = null;

      // Convert file to base64 if present
      if (file) {
        console.log("Converting file to base64:", file.name);
        const reader = new FileReader();
        mediaData = await new Promise((resolve, reject) => {
          reader.onload = () => {
            resolve({
              data: reader.result,
              name: file.name,
              type: file.type,
              size: file.size
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const msgData = {
        sender: currentUser?._id,
        receiver: selectedUser._id,
        text: message,
        media: mediaData,
        createdAt: new Date().toISOString()
      };
      
      console.log("Emitting sendMessage:", msgData);
      socket.emit("sendMessage", msgData);
      
      setMessages(prev => [...prev, msgData]);
      setMessage("");
      setFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="text-center">
          <p className="text-7xl mb-4 animate-bounce">💬</p>
          <p className="text-gray-200 text-2xl font-bold">Select a user to start chatting</p>
          <p className="text-gray-400 text-sm mt-3">Choose a contact from the left panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-3/4 flex flex-col h-screen bg-gradient-to-br from-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 border-b border-purple-700 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {selectedUser.name}
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
            </h2>
            <p className="text-blue-100 text-sm">📧 {selectedUser.email}</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-6xl mb-3 animate-wave">👋</p>
              <p className="text-gray-300 text-lg font-semibold">No messages yet</p>
              <p className="text-gray-400 text-sm mt-2">Send a message to begin chatting</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <Message key={index} msg={msg} currentUserId={currentUser?._id} />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 p-5 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="💭 Type a message..."
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-white placeholder-gray-400 transition backdrop-blur-sm"
            onKeyPress={e => e.key === "Enter" && !file && sendMessage()}
          />
          <label className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-400/20 transition flex items-center gap-2 font-semibold text-gray-200 backdrop-blur-sm">
            <span>📎</span>
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
          </label>
          <button
            onClick={sendMessage}
            disabled={!message.trim() && !file}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg"
          >
            ✈️
          </button>
        </div>
        {file && (
          <div className="bg-purple-500/20 border-l-4 border-purple-400 p-3 rounded text-sm text-purple-200 backdrop-blur-sm">
            📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
