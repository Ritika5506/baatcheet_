import React from "react";

const Message = ({ msg, currentUserId }) => {
  const isOwn = msg.sender === currentUserId || msg.sender?._id === currentUserId;

  const formatTime = (timestamp) => {
    if (!timestamp) return "just now";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return formatTime(timestamp);
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }
  };

  const renderMedia = () => {
    if (!msg.media) return null;

    const isBase64 = typeof msg.media === 'string' && msg.media.startsWith('data:');
    const mediaUrl = isBase64 ? msg.media : msg.media?.data || msg.media;
    const mediaType = msg.media?.type;
    const fileName = msg.media?.name || "File";

    if (!mediaUrl) return null;

    // Check if it's an image
    if (mediaType?.startsWith('image/') || mediaUrl.startsWith('data:image/')) {
      return (
        <img 
          src={mediaUrl} 
          alt="Attachment" 
          className="mt-2 max-w-xs rounded-lg cursor-pointer hover:opacity-80 shadow-md transition"
          onClick={() => window.open(mediaUrl)}
        />
      );
    }

    // Check if it's a video
    if (mediaType?.startsWith('video/') || mediaUrl.startsWith('data:video/')) {
      return (
        <video 
          src={mediaUrl} 
          controls 
          className="mt-2 max-w-xs rounded-lg shadow-md"
        />
      );
    }

    // For other files (documents, etc.)
    return (
      <a 
        href={mediaUrl} 
        download={fileName}
        className="mt-2 inline-block text-xs bg-opacity-30 bg-white px-3 py-2 rounded-lg hover:bg-opacity-50 break-all font-semibold transition"
      >
        📎 {fileName}
      </a>
    );
  };

  return (
    <div className={`my-3 flex ${isOwn ? "justify-end" : "justify-start"} message-enter animate-fadeIn`}>
      <div
        className={`px-4 py-3 rounded-2xl max-w-xs shadow-lg backdrop-blur-sm transition transform hover:scale-105 ${
          isOwn 
            ? "bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-br-none" 
            : "bg-white/10 text-gray-100 border border-white/20 rounded-bl-none backdrop-blur-sm"
        }`}
      >
        <p className={`text-xs font-bold opacity-80 ${isOwn ? "text-purple-100" : "text-gray-300"}`}>
          {isOwn ? "🤖 You" : "👤 " + msg.sender?.name}
        </p>
        {msg.text && <p className="break-words text-sm mt-1 font-medium">{msg.text}</p>}
        {renderMedia()}
        <p className={`text-xs mt-2 opacity-70 font-semibold ${isOwn ? "text-purple-100" : "text-gray-400"}`}>
          ⏱️ {formatDate(msg.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default Message;
