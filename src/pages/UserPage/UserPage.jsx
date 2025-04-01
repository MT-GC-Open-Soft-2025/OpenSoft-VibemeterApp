import React from "react";
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./UserPage.css";
import user from "../../Assets/user.png";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar.jsx";

const UserPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const openChat = () => {
    navigate("/chat"); // Navigate to the Chat page
  };

  return (
    <div className='feedback-wrapper'>
      <Feedbacknavbar title="User Page" />
      
      <div>
        {/* Profile container with icon and employee ID */}
        <div className="profile-container">
          <img src={user} alt="User Icon" className="profile-icon" />
          <span className="profile-user">Employee ID: 12345</span>
        </div>

        {/* "Let's Chat!" button */}
        <button className="chat-button" onClick={openChat}>
          Let's Chat!
        </button>
      </div>
    </div>
  );
};

export default UserPage;