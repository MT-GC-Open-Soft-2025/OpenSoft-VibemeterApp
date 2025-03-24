
import React, { useState } from "react";
import Navbar from "./SearchBar";
import PerformanceGraph from "./PerformanceGraph";

const Dashboard = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [, forceUpdate] = useState(); // Force re-render workaround

  const handleSearch = (employeeId) => {
    console.log("Before Update: ", selectedEmployee);
    setSelectedEmployee(employeeId);
    forceUpdate({}); // 🚀 Force component re-render
    console.log("After Update: ", employeeId);
  };

  return (
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
  );
};

export default Dashboard;
