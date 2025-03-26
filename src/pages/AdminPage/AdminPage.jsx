import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
// import "./AdminnPage.css";
import EmojiMeter from "../../components/EmojiMeter";
import bot from "../../Assets/bot.png";
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
      </div>
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
    <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>
    <div className="w-full max-w-4xl">
      <EmojiMeter />
      
      <div className="mt-8 text-center text-gray-600">
        <p>Welcome to your admin dashboard. The emoji above represents your current happiness level.</p>
      </div>
      </div></div>
     
   
     </>
  );
};

export default AdminPage;