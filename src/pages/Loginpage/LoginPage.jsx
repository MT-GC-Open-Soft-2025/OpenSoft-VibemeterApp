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
  // console.log("Hi")
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [empId, setEmpId] = useState("");

  // const handleToggle = () => {
  //   setIsAdmin((prev) => !prev);
  // };



  // const isValidEmpId = (id) => {
  //   const regex = /^EMP(\d{4})$/;
  //   const match = id.match(regex);
  //   if (!match) return false;
  //   const num = parseInt(match[1], 10);
  //   return num >= 1 && num <= 500;
  // };

  const chkadmin = (value) => {
    if (value === "admin") {
      setIsAdmin(true);
      console.log("admin login");
    }
    else{
      setIsAdmin(false);
    }
  };
  
  const handleChange = (e) => {
    const value = e.target.value;
    setEmpId(value);
    chkadmin(value);  // Pass the new value directly to chkadmin
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
    <Element name="login" className="signin-section d-flex align-items-center">
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

          {/* Right: Sign-In Card */}
          <div className="col-md-6" data-aos="fade-left">
            <div className="signin-card ms-md-4 mt-4 mt-md-0">
              <h2 className="text-primary fw-bold mb-3">Welcome Back 🌱</h2>
              <p className="text-muted mb-4">Let’s continue your journey to mental wellness.</p>

              <form onSubmit={handleLogin} className="w-100">
                <input
                  type="text"
                  className="form-control mb-3"
                  name="empId"
                  placeholder="Enter your employee ID"
                  onChange={handleChange}
                />
                <button type="submit" className="btn btn-primary w-100">
                  {isAdmin ? "ADMIN LOGIN" : "USER LOGIN"}
                </button>
              </form>

              {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
              {/* <p className="text-muted mt-3 small">
                Don’t have an account? <a href="#" className="text-primary">Create one</a>
              </p> */}

              {/* Toggle Button */}
              {/* <div
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
                </div> */}
              {/* </div> */}
            </div>
          </div>
        </div>
      </div>
    </Element>
  );
};
console.log("FAQPage Loaded!");


export default LoginPage;
