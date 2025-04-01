import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Element } from "react-scroll";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginPage.css";
import landscape from "../../Assets/landscape.jpg";
import logo from "../../Assets/bot.png";
import Lottie from "lottie-react";
import animationData from "../../Assets/animation.json";
import { FaUser, FaUserShield } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [empId, setEmpId] = useState("");

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

  const handleChange = (e) => {
    setEmpId(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!empId) {
      alert("Please enter your employee ID.");
      return;
    }

    try {
      let response;
      if (isAdmin) {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found. Please log in as a user first.");
          return;
        }

        if (empId !== "admin") {
          alert("Access denied! Only admins can log in.");
          return;
        }

        response = await axios.get("http://127.0.0.1:8000/admin/test", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Admin login successful!");
        navigate("/admin");
      } else {
        response = await axios.post("http://127.0.0.1:8000/auth/signin", {
          username: empId,
        });

        localStorage.setItem("token", response.data.access_token);

        alert("Login successful!");
        navigate("/user");
      }
    } catch (error) {
      alert(error.response?.data?.detail || "Login failed. Please try again.");
    }
  };

  return (
    <Element name="signin" className="signin-section d-flex align-items-center">
      <div className="container py-5">
        <div className="row align-items-center">
          {/* Left: Mental Wellness Illustration */}
          <div className="col-md-6 text-center" data-aos="fade-right">
            <img
              src="https://img.freepik.com/free-vector/mental-health-concept-illustration_114360-2031.jpg"
              alt="Mental health"
              className="img-fluid mb-4 mb-md-0"
              style={{ maxHeight: "400px" }}
            />
            <h4 className="text-primary mt-3">Taking care of your mind is a superpower 💙</h4>
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
              value={isAdmin ? "LOGIN AS ADMIN" : "LOGIN AS USER"}
            />

            {errorMessage && (
              <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
            )}
          </form>

          {/* Toggle Button */}
          <div className={`toggle-container ${isAdmin ? 'admin' : 'user'}`} onClick={handleToggle}>
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
      </div>
    </Element>
  );
};

export default LoginPage;