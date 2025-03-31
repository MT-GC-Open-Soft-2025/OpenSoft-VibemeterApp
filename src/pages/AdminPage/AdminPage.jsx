import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminPage.css";

import PerformanceGraph from "../../components/Admin_page _components/Admin_performance_rewards/PerformanceGraph";
import Rewards from "../../components/Admin_page _components/Admin_performance_rewards/Rewards";
import Performance from "../../components/Admin_page _components/Admin_performance_rewards/Performance";
import Badges from "../../components/Badges/Badges";
import ButtonComponent from "../../components/ButtonComponent";
import EmotionZoneChart from "./EmotionZone";
import PieChart from "./PieChart";
import Sidebar from "../../components/Admin_page _components/Admin_sidebar/Adminpagesidebar";
import Navbar from "../../components/Search-bar/SearchBar";
import Goback from "../../components/Admin_page _components/Admin_goback/Admingoback";
import Feedbacknavbar from '../../components/Feedback_navbar/Feedbacknavbar';
import user from "../../Assets/user.png";

const employees = ["EMP1234", "EMP5678", "EMP9101", "EMP2345", "EMP2789"];

const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const handleSearch = (employeeId) => {
    if (employees.includes(employeeId)) {
      setSelectedEmployee(employeeId);
    } else {
      setSelectedEmployee(""); // Prevents rendering if invalid ID is entered
    }
  };

  return (
    <>
      <Feedbacknavbar title="Admin Page"/>
      <Sidebar />
      <div style={{
        marginLeft: '200px',
        marginTop: '64px',
        backgroundImage: 'linear-gradient(135deg, #74ebd5,#acb6e5)',
        minHeight: '100vh',
        padding: '20px'
      }}>
      
        <Navbar onSearch={handleSearch} clearSearch={selectedEmployee !== ""} />
        
        

        {selectedEmployee ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <div className="description">
              <div className="profile-container">
                <img src={user} alt="User Icon" className="profile-icon" />
                <span className="profile-user">Employee ID: {selectedEmployee}</span>
              </div>
              <Badges />
              <ButtonComponent label="Get Feedback" onClick={() => navigate("/feedback")} />
            </div>

            <PerformanceGraph employeeId={selectedEmployee} />
            <Rewards />
          </div>
        ) : (
          <>
            <div className="charts">
              <EmotionZoneChart />
              <PieChart />
            </div>
            
          </>
        )}
      </div>
    </>
  );
};

export default AdminPage;

