import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [employeeId, setEmployeeId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleToggle = () => {
    setIsAdmin((prev) => !prev);
  };

  const isValidEmpId = (id) => {
    const regex = /^EMP(\d{4})$/;
    const match = id.match(regex);
    if (!match) return false;
    const num = parseInt(match[1], 10);
    return num >= 1 && num <= 500;
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!isValidEmpId(employeeId)) {
      setErrorMessage("Invalid ID");
      return;
    }

    setErrorMessage("");
    navigate(isAdmin ? "/admin" : "/user");
  };

  return (
    <div>
      {/* Header */}
      <header className="glass-header">
        <div className="logo">
          <img src={logo} alt="Company Logo" />
          <h5>MyCompany</h5>
        </div>
        <button className="contact-button" onClick={() =>navigate("/contact")}>
        
          Contact Us
        </button>
      </header>

      <div className="wrapper fadeInDown">
        <div id="formContent">
          <div className="fadeIn first">
            <img src={landscape} id="icon" alt="User Icon" />
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              className="fadeIn second"
              name="username"
              placeholder="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
            />

            <input
              type="password"
              className="fadeIn second"
              name="password"
              placeholder="password"
            />

            <input
              type="submit"
              className="fadeIn fourth"
              value={isAdmin ? "LOGIN AS ADMIN" : "LOGIN AS USER"}
            />

            {errorMessage && (
              <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
            )}
          </form>

          {/* Toggle Button */}
          <div
            className={`toggle-container ${isAdmin ? "admin" : "user"}`}
            onClick={handleToggle}
          >
            <div className="toggle-switch">
              {isAdmin ? (
                <FaUserShield size={20} color="#fff" />
              ) : (
                <FaUser size={20} color="#fff" />
              )}
            </div>
            <div className="icon user-icon">
              <FaUser size={20} />
            </div>
            <div className="icon admin-icon">
              <FaUserShield size={20} />
            </div>
          </div>
        </div>

        <div className="animation-container">
          <Lottie animationData={animationData} loop={true} />
        </div>
      </div>

      <footer className="glass-footer">
        <p>© 2025 MyCompany. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;