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
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar";
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
      <Sidebar />
      <div style={{
        marginLeft: '200px',
        marginTop: '60px',
        backgroundImage: 'linear-gradient(135deg,rgb(255, 255, 255),rgb(168 241 255))',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div className="apple">
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
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
            <div className="description">
              <div className="profile-container">
                <img src={user1} alt="User Icon" className="profile-icon" />
                <span className="profile-user">Employee ID: {selectedEmployee}</span>
              </div>
              <Badges employeeId={selectedEmployee} />
              <button className="btn btn-success fadeIn fourth getfeedback-button" onClick={handlegetfeedback} > Get Feedback</button>
              {/* <EmojiMeter employeeId={selectedEmployee} /> */}
              

            </div>
            <EmojiMeter employeeId={selectedEmployee}/>
            <PerformanceGraph employeeId={selectedEmployee} />
            <Rewards employeeId={selectedEmployee}/>
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
       <Footer/> 
    </>
  );
};

export default AdminPage;

