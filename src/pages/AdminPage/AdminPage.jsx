

import React,{ useState } from "react";
import PerformanceGraph from "../../components/PerformanceGraph"; // Adjust the path if needed
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./AdminPage.css";
import bot from "../../Assets/bot.png";
import ButtonComponent from "../../components/ButtonComponent";
import EmotionZoneChart from "./EmotionZone";
import PieChart from "./PieChart";
import Navbar from "../../components/SearchBar";
import Sidebar from "../../components/Adminpagesidebar";
import Searchbar from "../../components/Adminpagesearchbar";
// import Button from "../../components/samplecomponent";

const AdminPage = () => {
  const navigate = useNavigate(); // Get the navigate function

  // Handle feedback button click
  const handleFeedback = () => {
    navigate("/feedback"); // Navigate to the feedback page
  };
  const [selectedEmployee, setSelectedEmployee] = useState("");
    const [, forceUpdate] = useState(); // Force re-render workaround
  
    const handleSearch = (employeeId) => {
      console.log("Before Update: ", selectedEmployee);
      setSelectedEmployee(employeeId);
      forceUpdate({}); // 🚀 Force component re-render
      console.log("After Update: ", employeeId);
    };
  return (
    <>
     {/* <div className="admin-container">
            <h2>Performance Overview</h2>
            <PerformanceGraph />
            </div> */}

<div>
      <Navbar onSearch={handleSearch} />
      <p>Selected Employee: {selectedEmployee}</p> {/* Should now update */}
      {/* {selectedEmployee ? (
        <PerformanceGraph employeeId={selectedEmployee} />
      ) : (
        <div className="no-data">No Data Available</div>
      )} */}
      {selectedEmployee && selectedEmployee.trim() !== "" ? (
  <PerformanceGraph employeeId={selectedEmployee} />
) : (
  <div className="no-data">No Data Available</div>
)}

    </div>
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
   
   
     </>
  );
};

export default AdminPage;

