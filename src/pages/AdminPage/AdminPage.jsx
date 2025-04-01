import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  console.log("Stored Token:", token);

  const handleSearch = async (employeeId) => {
    if (!employeeId) {
      console.error("No Employee ID provided!");
      return;
    }
  
    //console.log("Searching for Employee ID:", employeeId);
    //console.log("Stored Token:", token);
    
  
    try {
      const response = await axios.get(`http://127.0.0.1:8000/admin/get_detail/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      //console.log("Employee Data Received:", response.data);
      setSelectedEmployee(employeeId);
      setEmployeeDetails(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching employee details:", err.response?.data || err.message);
      
      setError("Employee not found or unauthorized");
      setSelectedEmployee("");
      setEmployeeDetails(null);
    }
  };
  
  return (
    <>
      <Feedbacknavbar title="Admin Page" />
      <Sidebar />
      <Feedbacknavbar title="Admin Page" />
      <div
        style={{
          marginLeft: "200px",
          marginTop: "64px",
          backgroundImage: "linear-gradient(135deg, #74ebd5,#acb6e5)",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <Navbar onSearch={handleSearch} clearSearch={selectedEmployee !== ""} />

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {selectedEmployee && employeeDetails ? (
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
              <Badges employeeData={employeeDetails?.user_record}/>
              <ButtonComponent label="Get Feedback" onClick={() => navigate("/feedback")} />
            </div>

            <PerformanceGraph employeeData={employeeDetails?.user_record} />
            <Rewards employeeData={employeeDetails?.user_record}/>
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
