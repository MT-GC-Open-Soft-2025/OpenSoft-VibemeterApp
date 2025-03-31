import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserPage.css";
import user from "../../Assets/user.png";
import Chat from "../../components/chat_popup/chat.jsx";
import Feedbacknavbar from "../../components/Feedbacknavbar.jsx";

const UserPage = () => {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);

  const openChat = () => setShowChat(true);
  const closeChat = () => setShowChat(false);

  const handleFeedback = () => {
    // This navigates to the new SurveyForm on /feedback
    navigate("/feedback");
  };

  return (
    <div className="feedback-wrapper">
      <Feedbacknavbar title="User Page" />
      {showChat ? (
        <Chat onClose={closeChat} />
      ) : (
        <div className="content-container">
          <div className="profile-container">
            <img src={user} alt="User Icon" className="profile-icon" />
            <span className="profile-user">Employee ID: 12345</span>
          </div>
          <div className="button-group">
            <button className="chat-button" onClick={openChat}>
              Let's Chat!
            </button>
            <button className="feedback-button" onClick={handleFeedback}>
              Fill Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
