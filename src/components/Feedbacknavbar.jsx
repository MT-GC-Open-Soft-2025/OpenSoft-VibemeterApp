import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Feedbacknavbar.css';

const Feedbacknavbar = ({ title }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav-content">
        {title ? `${title} - Chat Feedback` : "Chat Feedback"}
      </div>
      <span className="go-back-btn" onClick={() => navigate('/admin')}>
        Go Back
      </span>
    </nav>
  );
};

export default Feedbacknavbar;


