import React from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaGithub } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="glass-footer">
      {/* Centered Copyright Text */}
      <div className="text-center">
        <p className="text-white text-sm">© 2025 wellbee. All rights reserved.</p>
      </div>

      {/* Social Media Icons */}
      <div className="social_media_icons">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebook className="text-white hover:text-blue-500" size={32} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="text-white hover:text-pink-500" size={32} />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FaTwitter className="text-white hover:text-blue-400" size={32} />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <FaGithub className="text-white hover:text-gray-400" size={32} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;