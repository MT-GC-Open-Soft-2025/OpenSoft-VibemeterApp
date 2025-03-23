import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./AdminPage.css";
import bot from "../../Assets/bot.png";
import EmotionZoneChart from "./EmotionZone";
import PieChart from "./PieChart";
import ButtonComponent from "../../components/ButtonComponent";

const AdminPage = () => {
  return (
    <>
      <div className="wrapper fadeInDown">"This is admin page."</div>
      <div className="charts">
        <EmotionZoneChart />
        <PieChart />
      </div>
    </>
  );
};

{/* Link to Feedback Page */}
<ButtonComponent label="Give Feedback" />

export default AdminPage;
