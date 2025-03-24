import React from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';
import searchIcon from './search.png';

const Navbar = () => {
  const navigate = useNavigate();

  // Function to navigate to the Login Page
  const handleGoBack = () => {
    navigate('/login'); // Redirects to the login page
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        {/* Search Bar */}
        <div className="search-container">
          <input 
            type="text" 
            className="search-bar" 
            placeholder="Search..."
          />
          <button type="button">
            <img 
              src={searchIcon} 
              alt="search" 
              className="search-icon"
            />
          </button>
        </div>
      </div>
      
      {/* Go Back Text Link (Styled as simple text) */}
      <span className="go-back-btn" onClick={handleGoBack}>
        Go Back
      </span>
    </nav>
  );
};

export default Navbar;


