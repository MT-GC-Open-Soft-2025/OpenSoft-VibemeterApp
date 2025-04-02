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

    // if (!isValidEmpId(empId)) {
    //   alert("Invalid Employee ID. Please enter a valid ID in the format EMPXXXX.");
    //   return;
    // }

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

        // alert("Admin login successful!");
        Swal.fire({
          icon: 'success',
          title: 'Admin login successful!',
        });
        navigate("/admin");
      } else {
        response = await axios.post("http://127.0.0.1:8000/auth/signin", {
          username: empId,
        });

        localStorage.setItem("token", response.data.access_token);

        //alert("Login successful!");
        Swal.fire({
          icon: 'success',
          title: 'Login successful!',
        });


        navigate("/user");
      }
    } catch (error) {
      // alert(error.response?.data?.detail || "Login failed. Please try again.");
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
            <h4 className="text-primary mt-3">
              Taking care of your mind is a superpower 💙
            </h4>
          </div>

          {/* Right: Sign-In Card */}
          <div className="col-md-6" data-aos="fade-left">
            <div className="signin-card ms-md-4 mt-4 mt-md-0">
              <h2 className="text-primary fw-bold mb-3">Welcome Back 🌱</h2>
              <p className="text-muted mb-4">
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
                  className="form-control mb-3"
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
