import React from 'react';
import './navbar.css';

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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
