import React from "react";
import "./Admingoback.css";
import Gobackicon from "./Admingoback.png";

const Goback = ({ onClick }) => {
  return (
    <div onClick={onClick} className="goback" style={{ cursor: "pointer" }}>
      <img src={Gobackicon} alt="<-" className="gobackicon" />
      <p>Go Back</p>
    </div>
  );
};

export default Goback;
