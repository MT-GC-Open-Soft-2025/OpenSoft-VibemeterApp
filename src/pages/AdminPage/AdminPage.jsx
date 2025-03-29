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
      <div style={{ marginLeft: "200px", marginTop: "64px", backgroundColor: "transparent",minHeight: "100vh", padding: "20px" }}>
        <Navbar onSearch={handleSearch} clearSearch={selectedEmployee !== ""} />

        {selectedEmployee && (
          <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 20px" }}>
            <Goback onClick={() => setSelectedEmployee("")} />
          </div>
        )}

        <p>Selected Employee: {selectedEmployee || "None"}</p>

        {selectedEmployee ? (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <ButtonComponent label="Get Feedback" onClick={() => navigate("/feedback")} />
            </div>
            <PerformanceGraph employeeId={selectedEmployee} />
            <Rewards />
            {/* <Performance /> */}
            <Badges />
          </>
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

