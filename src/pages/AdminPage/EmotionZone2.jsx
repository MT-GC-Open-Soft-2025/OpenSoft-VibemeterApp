import React from "react";
import "./AdminPage.css";

const EmotionZoneChart2 = () => {

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  return (
    <div className="charts">
      <img 
        src="https://img.freepik.com/premium-vector/team-employees-office-discussing-work-issues-brainstorming-finding-new-ideas-cartoon-vector-illustration_87771-25461.jpg" 
        alt="Employee Emotion Status" 
        className="emotion-image" 
      />
      <div className="Search-button">
        <h2 style={{marginLeft:"0px"}}>Track employees' well-being and emotions with a quick search.</h2>
        {/* ✅ Added the Search for Employee Button */}
        <div style={{ textAlign: "center", marginTop: "30px", marginBottom: "20px", marginLeft: "20px" }}>
            <button 
              onClick={scrollToTop} 
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#56baed",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                transition: "background 0.3s"
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#39ace7")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#56baed")}
            >
              Search for Employee
            </button>
          </div>
        </div>
    </div>
  );
};

export default EmotionZoneChart2;
