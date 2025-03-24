import React from 'react';
import './navbar.css';
import searchIcon from './search.png';  

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-content">
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
    </nav>
  );
};

export default Navbar;
