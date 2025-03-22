import React from "react";
import "./chat.css";

const Chat = ({ onClose }) => {
  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-window" onClick={(e) => e.stopPropagation()}>
        <span className="chat-close" onClick={onClose}>
          &times;
        </span>
        <h2>Chat Window</h2>
        <p>This is your full-screen chat window. Start your conversation here.</p>
        {/* Add your chat UI components below */}
      </div>
    </div>
  );
};

export default Chat;
