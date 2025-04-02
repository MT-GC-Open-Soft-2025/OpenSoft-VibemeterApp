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
import Feedbacknavbar from '../../components/Feedback_navbar/Feedbacknavbar';
import user from "../../Assets/user.png";
import EmojiMeter from "./EmojiMeter";  // ✅ Importing EmojiMeter

const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState(""); // ✅ Employee ID State

  return (
    <>
      <Feedbacknavbar title="Admin Page" />
      <Sidebar />
      <div style={{
        marginLeft: '200px',
        marginTop: '64px',
        backgroundImage: 'linear-gradient(135deg,rgb(255, 255, 255),rgb(168 241 255))',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <Navbar setSelectedEmployee={setSelectedEmployee} /> 
        <div className="text-container">
          <h3><b>Hello ADMIN !</b></h3>
        </div>

        {selectedEmployee ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
            <div className="description">
              <div className="profile-container">
                <img src={user} alt="User Icon" className="profile-icon" />
                <span className="profile-user">Employee ID: {selectedEmployee}</span>
              </div>
              <Badges />
              <ButtonComponent label="Get Feedback" onClick={() => {
                  localStorage.setItem("employeeId", selectedEmployee);
                  navigate(`/feedback`);
              }} />


              
              {/* ✅ Pass selectedEmployee as a prop */}
              <EmojiMeter employeeId={selectedEmployee} />
            </div>
            
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
