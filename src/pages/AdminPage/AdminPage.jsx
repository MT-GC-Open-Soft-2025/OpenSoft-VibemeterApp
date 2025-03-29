import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminPage.css";

import PerformanceGraph from "../../components/Admin_page _components/Admin_performance_rewards/PerformanceGraph.jsx";
import Rewards from "../../components/Admin_page _components/Admin_performance_rewards/Rewards.jsx";
import Performance from "../../components/Admin_page _components/Admin_performance_rewards/Performance.jsx";
import Badges from "../../components/Badges/Badges.jsx";
import ButtonComponent from "../../components/ButtonComponent";
import EmotionZoneChart from "./EmotionZone";
import PieChart from "./PieChart";
import Sidebar from "../../components/Admin_page _components/Admin_search_bar/Adminpagesearchbar.jsx";
import Navbar from "../../components/Search-bar/SearchBar.jsx";
import Goback from "../../components/Admin_page _components/Admin_goback/Admingoback.jsx";
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
      <Sidebar />
      <div
        style={{
          marginLeft: "200px",
          marginTop: "64px",
          backgroundColor: "white",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        {/* Search Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            marginLeft: "20px",
          }}
        >
          <Navbar onSearch={handleSearch} clearSearch={selectedEmployee !== ""} />
        </div>

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
          <div className="charts">
            <EmotionZoneChart />
            <PieChart />
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPage;
