import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./UserPage.css";
import user from "../../Assets/user.png";
import Chat from "../../components/chat_popup/chat.jsx"; // Adjust the relative path as necessary

const UserPage = () => {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const handleGoBack = () => {

    navigate(-1);
  };
  const openChat = () => setShowChat(true);
  const closeChat = () => setShowChat(false);

  return (
    <div className='feedback-wrapper'>
      <nav className='navbar'>
        <div className='nav-content'>User Page</div>
        <button className='go-back-btn' onClick={handleGoBack}>Go Back</button>
      </nav>
    <>
      {showChat ? (
        <Chat onClose={closeChat} />
      ) : (
        <div >
          {/* Header bar on the top left */}
          <div className="header"></div>

          {/* Profile container with icon and employee id */}
          <div className="profile-container">
            <img src={user} alt="User Icon" className="profile-icon" />
            <span className="profile-user">Employee ID: 12345</span>
          </div>

          {/* "Let's Chat!" button */}
          <button className="chat-button" onClick={openChat}>
            Let's Chat!
          </button>
        </div>
      )}
    </>
    </div>
  );
};

export default UserPage;