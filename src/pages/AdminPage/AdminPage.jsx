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

const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const handleSearch = (employeeId) => {
    setSelectedEmployee(employeeId);
  };

  return (
    <>
      <Sidebar />
      <div
        style={{
          marginLeft: "200px",
          marginTop: "64px",
          backgroundColor: "white",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        {/* Search Bar */}
        <Navbar onSearch={handleSearch} clearSearch={selectedEmployee !== ""} />
        {/*Goback*/}
        {selectedEmployee && (
          <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 20px" }}>
            <Goback onClick={() => setSelectedEmployee("")} />
          </div>
        )}

        <p>Selected Employee: {selectedEmployee}</p>

        {selectedEmployee && selectedEmployee.trim() !== "" ? (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <ButtonComponent label="Get Feedback" onClick={() => navigate("/feedback")} />
            </div>
            <PerformanceGraph employeeId={selectedEmployee} />
          </>
        ) : (
          <>
            <div className="charts">
              <EmotionZoneChart />
              <PieChart />
            </div>
            <Rewards />
            <Performance />
            <Badges />
          </>
        )}
      </div>
    </>
  );
};

export default AdminPage;
