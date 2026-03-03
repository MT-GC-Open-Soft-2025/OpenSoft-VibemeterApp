import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminPage.css";
import Footer from "../../components/Footer/Footer";
import PerformanceGraph from "../../components/Admin_page _components/Admin_performance_rewards/PerformanceGraph";
import Rewards from "../../components/Admin_page _components/Admin_performance_rewards/Rewards";
import Badges from "../../components/Badges/Badges";
import ButtonComponent from "../../components/ButtonComponent";

import EmotionZoneChart from "./EmotionZone";
import EmotionZoneChart2 from "./EmotionZone2";
import Sidebar from "../../components/Admin_page _components/Admin_sidebar/Adminpagesidebar";
import Navbar from "../../components/Search-bar/SearchBar";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar2";
import user1 from "../../Assets/user.png";
import EmojiMeter from "../../components/Admin_page _components/Admin_performance_rewards/EmojiMeter.jsx";

const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState("");


  const handlegetfeedback = () => {
    if (!selectedEmployee) {
      console.error("❌ Error: No employee selected.");
      return;
    }

    localStorage.setItem("selectedEmployee", selectedEmployee);
    console.log("✅ Employee stored:", localStorage.getItem("selectedEmployee"));

    navigate(`/feedback`);
  };

  const handlegetBack = () => {
    window.location.reload();
  };

  // useEffect(() => {
  //     const token = localStorage.getItem("token");
  //     if (!token) return;

  //     fetch("http://localhost:8000/user/getUserDetails", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //       .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch")))
  //       .then(setUser)
  //       .catch(console.error);
  //   }, []);

  //   const truncatedVibeScore =
  // user && typeof user.vibe_score === "number"
  //   ? user.vibe_score.toFixed(2)
  //   : -1;


  return (
    <>
      <Feedbacknavbar title="Admin Page" />
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-main-content p-4 w-100" style={{
          backgroundColor: 'var(--wb-bg-main, #f8f9fa)',
          boxSizing: 'border-box'
        }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Navbar setSelectedEmployee={setSelectedEmployee} />
            {selectedEmployee && (
                  <button className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold" onClick={handlegetBack}>
                           <i className="bi bi-arrow-left me-2"></i>Back
                  </button>
              )}
          </div>


          <div className="text-container text-start mb-4 mt-2">
            <h3 className="fw-bold mb-1" style={{ color: 'var(--wb-text-main, #212529)' }}>Admin Dashboard</h3>
            <p className="text-muted">Overview of employee performance, moods, and feedback.</p>
          </div>

          {selectedEmployee ? (
            <div className="row g-4 mt-2">
              <div className="col-12 col-xl-4 d-flex">
                <div className="card w-100 border-0 shadow-sm p-4 admin-bento-card">
                  <div className="profile-container d-flex flex-column align-items-center mb-4 text-center">
                    <img src={user1} alt="User Icon" className="profile-icon mb-3 shadow-sm" style={{ width: '100px', height: '100px' }} />
                    <h5 className="profile-user mb-1">Employee ID: {selectedEmployee}</h5>
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 mt-2">Active Member</span>
                  </div>
                  <div className="flex-grow-1">
                    <Badges employeeId={selectedEmployee} />
                  </div>
                  <button className="btn btn-primary w-100 mt-4 shadow-sm rounded-pill py-2 fw-semibold" onClick={handlegetfeedback}>
                    <i className="bi bi-chat-left-text me-2"></i> Get Feedback
                  </button>
                </div>
              </div>

              <div className="col-12 col-xl-8 d-flex flex-column gap-4">
                <div className="card border-0 shadow-sm p-4 admin-bento-card">
                  <EmojiMeter employeeId={selectedEmployee}/>
                </div>
                <div className="card border-0 shadow-sm p-4 admin-bento-card flex-grow-1">
                  <PerformanceGraph employeeId={selectedEmployee} />
                </div>
              </div>

              <div className="col-12 mt-4">
                <div className="card border-0 shadow-sm p-4 admin-bento-card">
                  <Rewards employeeId={selectedEmployee}/>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="charts">
                <EmotionZoneChart />
              </div>
              <div className="charts">
                <EmotionZoneChart2 />
              </div>
            </>
          )}
        </div>
      </div>
       <Footer/>
    </>
  );
};

export default AdminPage;
