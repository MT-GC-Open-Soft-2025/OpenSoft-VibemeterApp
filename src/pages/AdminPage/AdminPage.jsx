import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; 
import "./AdminPage.css"
import bot from "../../Assets/bot.png";
import Rewards from "../../components/Rewards";
import Performance from "../../components/Performance";
import Badges from "../../components/Badges";



const AdminPage = () => {
  return (
    <div className="wrapper fadeInDown">
      "This is admin page."

      <Rewards />
      <Performance />
      <Badges />
    </div>
    
  );
};

export default AdminPage;
