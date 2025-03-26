import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./AdminPage.css";
import bot from "../../Assets/bot.png";
import EmotionZoneChart from "./EmotionZone";
import PieChart from "./PieChart";
import Sidebar from "../../components/sidebar";
// import Button from "../../components/samplecomponent";

const AdminPage = () => {
  return (
    <>
      <Sidebar />
      <div className="chartContainingdiv">
        <div className="Hello"> Hello Admin!</div>
        <input type="text" className="search-bar" placeholder="Search with employee id" />
        <div className="charts">
          <EmotionZoneChart />
          <PieChart />
        </div>
      </div>
    </>
  );
};

export default AdminPage;
