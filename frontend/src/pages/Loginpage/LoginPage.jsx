import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link, Element } from "react-scroll";
/* Bootstrap imported once in App.js */
import "./LoginPage.css";
import Swal from "sweetalert2";
import { signin } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

function getRoleFromToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).role;
  } catch {
    return null;
  }
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!empId) {
      setErrorMessage("Please enter your employee ID.");
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your employee ID.",
      });
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your password.",
      });
      return;
    }

    try {
      const data = await signin(empId, password);
      login(data.access_token, empId);

      const role = getRoleFromToken(data.access_token);
      if (role === "admin") {
        Swal.fire({ icon: "success", title: "Admin login successful!" });
        navigate("/admin");
      } else {
        Swal.fire({ icon: "success", title: "Login successful!" });
        navigate("/user");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: error.response?.data?.detail || "Login failed. Please try again.",
      });
    }
  };

  return (
    <Element name="signin" className="section bg-white d-flex align-items-center">
      <div className="container py-5">
        <div className="row align-items-center">
          <div
            className="col-md-6 d-flex flex-column align-items-center justify-content-center text-center"
            data-aos="fade-right"
          >
            <img
              src="https://img.freepik.com/free-vector/mental-health-concept-illustration_114360-2031.jpg"
              alt="Mental health illustration"
              className="img-fluid mb-4"
              style={{ maxHeight: "500px" }}
            />
            <h4 className="space text-primary">
              Taking care of your mind is a superpower
            </h4>
          </div>

          <div className="col-md-6" data-aos="fade-left">
            <div className="signin-card">
              <h2
                className="text-primary fw-bold mb-5 spaceh"
                style={{ fontFamily: "Comfortaa" }}
              >
                Welcome Back
              </h2>
              <p className="lead1 text-muted mb-3">
                Let's continue your journey to mental wellness.
              </p>

              <form onSubmit={handleLogin} className="w-100">
                <div className="mb-4">
                  <select
                    className="form-select w-100"
                    name="company"
                    required
                    defaultValue=""
                    aria-label="Select company"
                  >
                    <option value="" disabled>
                      Select Company
                    </option>
                    <option value="Deloitte">Deloitte</option>
                  </select>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    className="form-control w-100 input-left-align"
                    placeholder="Employee ID"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    aria-label="Employee ID"
                    autoComplete="username"
                  />
                </div>

                <div className="mb-4">
                  <input
                    type="password"
                    className="form-control w-100 input-left-align"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-label="Password"
                    autoComplete="current-password"
                  />
                </div>

                <div className="mb-4">
                  <button type="submit" className="btn btn-primary w-100">
                    Sign In
                  </button>
                </div>
              </form>

              {errorMessage && (
                <p className="text-danger mt-3 small mb-4" role="alert">
                  {errorMessage}
                </p>
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
