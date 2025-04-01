import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap
import "./UserPage.css";
import user from "../../Assets/user.png";
import Chat from "../../components/chat_popup/chat.jsx";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar.jsx";
import animationData from "../../Assets/Newanimation.json"; // Bot animation

const UserPage = () => {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);

  const openChat = () => setShowChat(true);
  const closeChat = () => setShowChat(false);

  return (
    <div className="feedback-wrapper">
      <Feedbacknavbar title="User Page" />

      {showChat ? (
        <Chat onClose={closeChat} />
      ) : (
        <div>
          {/* Profile container */}
          <div className="profile-container">
            <img src={user} alt="User Icon" className="profile-icon" />
            <span className="profile-user">Employee ID: 12345</span>
          </div>

          {/* "Let's Chat!" button */}
          <button className="chat-button" onClick={openChat}>
            Let's Chat!
          </button>

          {/* Bot with Chat Bubble */}
          <div className="bot-container">
            <div className="chat-bubble">Hi! How can I assist you?</div>
            <Lottie animationData={animationData} loop={true} className="bot-animation" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;





