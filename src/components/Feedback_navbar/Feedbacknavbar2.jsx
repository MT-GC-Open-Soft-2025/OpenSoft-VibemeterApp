import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Feedbacknavbar.css';

const Feedbacknavbar = ({ title }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar1">
      <div className="nav-content">
        {title ? `${title} ` : "Chat Feedback"}
      </div>
    </nav>
  );
};

export default Feedbacknavbar;