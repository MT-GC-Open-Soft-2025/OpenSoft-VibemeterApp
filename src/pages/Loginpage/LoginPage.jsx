import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginPage.css";
import landscape from "../../Assets/landscape.webp";
import logo from "../../Assets/bot.png";
import Lottie from "lottie-react";
import animationData from "../../Assets/animation.json";
import bot from "../../Assets/bot.png";

const LoginPage = () => {
  const navigate = useNavigate();

  // State for storing employee ID & error message
  const [employeeId, setEmployeeId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Validate range: EMP001 -> EMP500
  const isValidEmpId = (id) => {
    const regex = /^EMP(\d{4})$/; // Now expects 4 digits: EMP0001
    const match = id.match(regex);
  
    if (!match) return false;
  
    const num = parseInt(match[1], 10);
    return num >= 1 && num <= 500;  // Valid from EMP0001 to EMP0500
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // If invalid employeeId
    if (!isValidEmpId(employeeId)) {
      setErrorMessage("Invalid ID");
      return;
    }

    // If valid, clear error and navigate
    setErrorMessage("");
    navigate("/admin");
  };

  // For user login we won't check employeeId, or do the same check as needed
  const userLogin = (e) => {
    e.preventDefault();
    navigate("/user");
  };

  return (
    <div>
      <header className="glass-header">
        <div className="logo">
          <img src={logo} alt="Company Logo" />
          <h5>MyCompany</h5>
        </div>
        <button className="contact-button">Contact Us</button>
      </header>

      <div className="wrapper fadeInDown">
        <div id="formContent">
          <div className="fadeIn first">
            <img src={landscape} id="icon" alt="User Icon" />
          </div>

          <form onSubmit={handleLogin}>
            {/* Employee ID field */}
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
              value="Log In"
            />

            {/* Show error message in red, if any */}
            {errorMessage && (
              <p style={{ color: "red", marginTop: "10px" }}>
                {errorMessage}
              </p>
            )}
          </form>

          <form onSubmit={userLogin}>
            <input
              type="submit"
              className="fadeIn fourth btn btn-primary"
              value="Log In User"
            />
          </form>

          <div id="formFooter">
            <a className="underlineHover" href="#">
              Forgot Password?
            </a>
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
