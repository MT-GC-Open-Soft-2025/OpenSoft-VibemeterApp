import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "bootstrap/dist/css/bootstrap.min.css"; 
import "./AdminPage.css";
import bot from "../../Assets/bot.png";
import Rewards from "../../components/Rewards";
import Performance from "../../components/Performance";
import Badges from "../../components/Badges";



import ButtonComponent from "../../components/ButtonComponent";
import EmotionZoneChart from "./EmotionZone";
import PieChart from "./PieChart";
import Navbar from "../../components/Adminpagenavbar";
import Sidebar from "../../components/Adminpagesidebar";
import Searchbar from "../../components/Adminpagesearchbar";
// import Button from "../../components/samplecomponent";

const AdminPage = () => {
  const navigate = useNavigate(); // Get the navigate function

  // Handle feedback button click
  const handleFeedback = () => {
    navigate("/feedback"); // Navigate to the feedback page
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <div style={{ 
        marginLeft: '200px', 
        marginTop: '64px',
        backgroundColor: 'white',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <Searchbar />

        <div className="wrapper fadeInDown">
      <h2>This is the admin page.</h2>
      <ButtonComponent label="Get Feedback" onClick={handleFeedback} />
      <div className="charts">
        <EmotionZoneChart />
        <PieChart />
      </div>

      <Rewards />
      <Performance />
      <Badges />
      </div>
    
      </div>
   
   
     </>
  );
};

export default AdminPage;