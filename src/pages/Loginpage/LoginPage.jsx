import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginPage.css";
import landscape from "../../Assets/landscape.webp";
import logo from "../../Assets/bot.png";
import Lottie from "lottie-react";
import animationData from "../../Assets/animation.json";
import { FaUser, FaUserShield } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [empId, setEmpId] = useState("");
  // const [password, setPassword] = useState("");

  // Fix for handleToggle error
  const handleToggle = () => {
    setIsAdmin((prev) => !prev);
  };

  const handleChange = (e) => {
    setEmpId(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!empId) {
      alert("Please enter your employee ID.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/signin", {
        username: empId,
      });

      alert("Login successful!");
      localStorage.setItem("token", response.data.access_token);
      navigate(isAdmin ? "/admin" : "/user");
    } catch (error) {
      alert(error.response?.data?.detail || "Login failed. Please try again.");
    }
  };

  return (
    <div>
      {/* Glass Effect Header */}
      <header className="glass-header">
        <div className="logo">
          <img src={logo} alt="Company Logo" />
          <h5>MyCompany</h5>
        </div>
        <button className="contact-button">Contact Us</button>
      </header>

      {/* Main Wrapper */}
      <div className="wrapper fadeInDown">
        {/* Form Content */}
        <div id="formContent">
          <div className="fadeIn first">
            <img src={landscape} id="icon" alt="User Icon" />
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              className="fadeIn second"
              name="empId"
              placeholder="Enter your employeeId"
              onChange={handleChange}
            />
            <input
              type="submit"
              className="fadeIn fourth"
              value={isAdmin ? "LOGIN AS ADMIN" : "LOGIN AS USER"}
            />
          </form>

          {/* Toggle Button */}
          <div className={`toggle-container ${isAdmin ? 'admin' : 'user'}`} onClick={handleToggle}>
            <div className="toggle-switch">
              {isAdmin ? <FaUserShield size={20} color="#fff" /> : <FaUser size={20} color="#fff" />}
            </div>
            <div className="icon user-icon"><FaUser size={20} /></div>
            <div className="icon admin-icon"><FaUserShield size={20} /></div>
          </div>
        </div>

        {/* Animation Container */}
        <div className="animation-container">
          <Lottie animationData={animationData} loop={true} />
        </div>
      </div>

      {/* Glass Effect Footer */}
      <footer className="glass-footer">
        <p>© 2025 MyCompany. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
