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
import Navbar from "../../components/Search-bar/SearchBar.jsx";
import Goback from "../../components/Admin_page _components/Admin_goback/Admingoback.jsx";
import user from "../../Assets/user.png";
import EmojiMeter from "./EmojiMeter";

import Sidebar from "\../../components/Admin_page _components/Admin_sidebar/Adminpagesidebar.jsx";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar.jsx";
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
        backgroundColor: 'white',
        minHeight: '100vh',
        padding: '20px'
      }}>
        {/* Search Bar */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px",marginLeft:"20px" }}>
        <Navbar onSearch={handleSearch} clearSearch={selectedEmployee !== ""} />
        </div>
       
        
        

        {selectedEmployee ? (
          <> <p>Selected Employee: {selectedEmployee}</p>
             <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      <ButtonComponent label="Get Feedback" onClick={() => navigate("/feedback")} />
    </div>
            {/* <div><ButtonComponent label="Get Feedback" onClick={() => navigate("/feedback")} /></div> */}
            <PerformanceGraph employeeId={selectedEmployee} />
            <Rewards />
            {/* <Performance /> */}
            <Badges />
            <div className="Meters-vibe">
        <EmojiMeter/>
      </div>
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
