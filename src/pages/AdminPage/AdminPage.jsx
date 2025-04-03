import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminPage.css";

import PerformanceGraph from "../../components/Admin_page _components/Admin_performance_rewards/PerformanceGraph";
import Rewards from "../../components/Admin_page _components/Admin_performance_rewards/Rewards";
import Badges from "../../components/Badges/Badges";
import ButtonComponent from "../../components/ButtonComponent";

import EmotionZoneChart from "./EmotionZone";
import PieChart from "./PieChart";
import Sidebar from "../../components/Admin_page _components/Admin_sidebar/Adminpagesidebar";
import Navbar from "../../components/Search-bar/SearchBar";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar";
import user from "../../Assets/user.png";
import EmojiMeter from "./EmojiMeter";  

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

  return (
    <>
      <Feedbacknavbar title="Admin Page" />
      <Sidebar />
      <div className="admin-container">
        
        {/* Container for search bar and button */}
        <div className="search-button-container">
          <Navbar setSelectedEmployee={setSelectedEmployee} />
          {selectedEmployee && (
              <button className="styled-button" onClick={handlegetBack}>
                       Back
              </button>
          )}
        </div>

        <div className="text-container">
          <h3><b>Hello ADMIN !</b></h3>
        </div>

        {selectedEmployee ? (
          <div className="profile-section">
            <div className="profile-container">
              <img src={user} alt="User Icon" className="profile-icon" />
              <span className="profile-user">Employee ID: {selectedEmployee}</span>
            </div>
            <Badges />
            <EmojiMeter employeeId={selectedEmployee} />
            <PerformanceGraph employeeId={selectedEmployee} />
            <Rewards />
          </div>
        ) : (
          <div className="charts">
            <EmotionZoneChart />
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPage;


