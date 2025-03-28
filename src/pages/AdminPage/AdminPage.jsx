import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminPage.css";

import PerformanceGraph from "../../components/PerformanceGraph";
import Rewards from "../../components/Rewards";
import Performance from "../../components/Performance";
import Badges from "../../components/Badges";
import ButtonComponent from "../../components/ButtonComponent";
import EmotionZoneChart from "./EmotionZone";
import PieChart from "./PieChart";
import Sidebar from "../../components/Adminpagesidebar";
import Navbar from "../../components/SearchBar";
import Goback from "../../components/Admingoback";

const employees = ["EMP1234", "EMP5678", "EMP9101", "EMP2345", "EMP2789"];

const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const handleSearch = (employeeId) => {
    if (employees.includes(employeeId)) {
      setSelectedEmployee(employeeId);
    } else {
      setSelectedEmployee(""); // Prevents rendering if invalid ID is entered
    }
  };

  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: "200px", marginTop: "64px", backgroundColor: "white", minHeight: "100vh", padding: "20px" }}>
        <Navbar onSearch={handleSearch} clearSearch={selectedEmployee !== ""} />

        {selectedEmployee && (
          <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 20px" }}>
            <Goback onClick={() => setSelectedEmployee("")} />
          </div>
        )}

        <p>Selected Employee: {selectedEmployee || "None"}</p>

        {selectedEmployee ? (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <ButtonComponent label="Get Feedback" onClick={() => navigate("/feedback")} />
            </div>
            <PerformanceGraph employeeId={selectedEmployee} />
            <Rewards />
            {/* <Performance /> */}
            <Badges />
          </>
        ) : (
          <>
            <div className="charts">
              <EmotionZoneChart />
              <PieChart />
            </div>
            
          </>
        )}
      </div>
    </>
  );
};

export default AdminPage;

