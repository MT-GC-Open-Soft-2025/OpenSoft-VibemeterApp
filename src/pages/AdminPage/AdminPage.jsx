import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./AdminPage.css";
import bot from "../../Assets/bot.png";
import ButtonComponent from "../../components/ButtonComponent";
import EmotionZoneChart from "./EmotionZone";
import PieChart from "./PieChart";

const AdminPage = () => {
  const navigate = useNavigate(); // Get the navigate function

  // Handle feedback button click
  const handleFeedback = () => {
    navigate("/feedback"); // Navigate to the feedback page
  };

  // Handle redirect button click
  
  return (
    <div className="wrapper fadeInDown">
      <h2>This is the admin page.</h2>
      <ButtonComponent label="Get Feedback" onClick={handleFeedback} />
      
      <div className="charts">
        <EmotionZoneChart />
        <PieChart />
      </div>
    </div>
  );
};

export default AdminPage;

