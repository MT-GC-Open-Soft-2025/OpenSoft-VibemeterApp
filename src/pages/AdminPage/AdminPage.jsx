import React, { useState, useEffect } from "react";
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
import Feedbacknavbar from '../../components/Feedback_navbar/Feedbacknavbar';
import user from "../../Assets/user.png";
import EmojiMeter from "./EmojiMeter";

const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/admin/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handleSearch = (employeeId) => {
    if (employees.includes(employeeId)) {
      setSelectedEmployee(employeeId);
    } else {
      setSelectedEmployee(""); // Prevents rendering if invalid ID is entered
      alert("Employee not found.");
    }
  };

  return (
    <>
      <Feedbacknavbar title="Admin Page"/>
      <Sidebar />
      <div style={{
        marginLeft: '200px',
        marginTop: '64px',
        backgroundImage: 'linear-gradient(135deg,rgb(255, 255, 255),rgb(168 241 255))',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <Navbar onSearch={handleSearch} clearSearch={selectedEmployee !== ""} />
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
              <ButtonComponent label="Get Feedback" onClick={() => navigate("/feedback")} />
                <EmojiMeter/>
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
