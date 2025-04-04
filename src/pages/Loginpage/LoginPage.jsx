import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Element, Link } from "react-scroll";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginPage.css";
import { FaUser, FaUserShield } from "react-icons/fa";
import Swal from "sweetalert2";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [empId, setEmpId] = useState("");

  // const handleToggle = () => {
  //   setIsAdmin((prev) => !prev);
  // };

    const handleChange = (e) => {
    setEmpId(e.target.value);
  };

    const handleLogin = async (e) => {
      try{
    e.preventDefault();
    setErrorMessage("");

    if (!empId) {
      setErrorMessage("Please enter your employee ID.");
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Please enter your employee ID.',
      });
      return;
    }
    const response = await axios.post("http://127.0.0.1:8000/auth/signin", {
       username: empId,
  });
     localStorage.setItem("token", response.data.access_token);
     if (empId === "admin") {
      Swal.fire({
        icon: 'success',
        title: 'Admin login successful!',
      });
      navigate("/admin");
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Login successful!',
      });
      navigate("/user");
    }
  }
 catch (error) {
  Swal.fire({
    icon: 'error',
    title: 'Oops!',
    text: error.response?.data?.detail || "Login failed. Please try again.",
  });
}
    };





  return (
    <Element name="signin" className="section bg-white d-flex align-items-center">
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
            <h4 className="space text-primary ">
              Taking care of your mind is a superpower
            </h4>
          </div>

          {/* Right: Sign-In Card */}
          <div className="col-md-6" data-aos="fade-left">
            <div className="signin-card ms-md-4 mt-4 mt-md-0">
              <h2 className="text-primary fw-bold mb-3 spaceh">Welcome Back 🌱</h2>
              <p className="lead1 text-muted mb-4">
                Let’s continue your journey to mental wellness.
              </p>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="w-100">
                <select
                  className="form-select mb-3"
                  name="company"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Company
                  </option>
                  <option value="Deloitte">Deloitte</option>
                </select>

                <input
                  type="text"
                  className="form-control mb-3 text-align-left"
                  placeholder="Employee ID"
                  value={empId}
                  onChange={handleChange}
                />

                <button type="submit" className="btn btn-primary w-100">
                  Sign In
                </button>
              </form>

              {errorMessage && (
                <p className="text-danger mt-3 small">{errorMessage}</p>
              )}

              <p className="text-muted mt-3 small">
                Company not listed?{" "}
                <Link
                  to="book-demo"
                  smooth={true}
                  duration={500}
                  className="text-primary"
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  Book Demo
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Element>
  );
};

export default LoginPage;
