import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./AdminPage.css";
import bot from "../../Assets/bot.png";
import EmotionZoneChart from "./EmotionZone";
import PieChart from "./PieChart";
import Navbar from "../../components/Adminpagenavbar";
import Sidebar from "../../components/Adminpagesidebar";
import Searchbar from "../../components/Adminpagesearchbar";
// import Button from "../../components/samplecomponent";

const AdminPage = () => {
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
        <div className="wrapper fadeInDown">"This is admin page."</div>
        <div className="charts">
          <EmotionZoneChart />
          <PieChart />
        </div>
      </div>
    </>
  );
};

export default AdminPage;
