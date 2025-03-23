import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginPage.css";
import landscape from "../../Assets/landscape.webp";
import logo from "../../Assets/bot.png";
import Lottie from "lottie-react";
import animationData from "../../Assets/animation.json";
import bot from "../../Assets/bot.png";
import ButtonComponent from "../../components/ButtonComponent"; // Adjust path if needed

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/admin");
  };

  return (
    <div>
      <div></div>
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
              name="username"
              placeholder="employeeId"
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
          </form>
          <ButtonComponent label="Give Feedback" />

          <div id="formFooter">
            <a className="underlineHover" href="#">
              Forgot Password?
            </a>
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
