import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./UserPage.css";
import user from "../../Assets/user.png";
import Chat from "../../components/chat_popup/chat.jsx"; // Adjust the relative path as necessary

const UserPage = () => {
  const [showChat, setShowChat] = useState(false);

  const openChat = () => setShowChat(true);
  const closeChat = () => setShowChat(false);

  return (
    <>
      {showChat ? (
        <Chat onClose={closeChat} />
      ) : (
        <div className="wrapper fadeInDown">
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
  );
};

export default UserPage;
