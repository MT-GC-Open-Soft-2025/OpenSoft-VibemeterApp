

// import React,{ useState } from "react";
// import PerformanceGraph from "../../components/PerformanceGraph"; 
// import { useNavigate } from "react-router-dom"; 
// import "bootstrap/dist/css/bootstrap.min.css"; 
// import "./AdminPage.css";
// import bot from "../../Assets/bot.png";
// import ButtonComponent from "../../components/ButtonComponent";
// import EmotionZoneChart from "./EmotionZone";
// import PieChart from "./PieChart";
// import Navbar from "../../components/SearchBar";
// import Sidebar from "../../components/Adminpagesidebar";
// import Searchbar from "../../components/Adminpagesearchbar";
// const AdminPage = () => {
//   const navigate = useNavigate(); 
//   const handleFeedback = () => {
//     navigate("/feedback");
//   };
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//     const [, forceUpdate] = useState(); 
  
//     const handleSearch = (employeeId) => {
//       console.log("Before Update: ", selectedEmployee);
//       setSelectedEmployee(employeeId);
//       forceUpdate({});
//       console.log("After Update: ", employeeId);
//     };
// return (
//   <>
//     <Sidebar />
//     <div style={{ 
//       marginLeft: '200px', 
//       marginTop: '64px',
//       backgroundColor: 'white',
//       minHeight: '100vh',
//       padding: '20px'
//     }}>
//       <div>
//         <Navbar onSearch={handleSearch} />
//         <p>Selected Employee: {selectedEmployee}</p> 

//         {selectedEmployee && selectedEmployee.trim() !== "" ? (
//           <>
//             <PerformanceGraph employeeId={selectedEmployee} />
//             <div><ButtonComponent label="Get Feedback" onClick={handleFeedback} /></div>
//           </>
//         ) : (
//           <>
//             <div className="charts">
//               <EmotionZoneChart />
//               <PieChart />
//             </div>
//             {/* <div className="no-data">No Data Available</div> */}
//           </>
//         )}
//       </div>
//     </div>
//   </>
// );

// };

// export default AdminPage;
import React, { useState } from "react";
import PerformanceGraph from "../../components/PerformanceGraph";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminPage.css";
import ButtonComponent from "../../components/ButtonComponent";
import EmotionZoneChart from "./EmotionZone";
import PieChart from "./PieChart";
import Sidebar from "../../components/Adminpagesidebar";
import Navbar from "../../components/SearchBar";

const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const handleSearch = (employeeId) => {
    setSelectedEmployee(employeeId);
  };

  return (
    <>
      <Sidebar />
      <div style={{
        marginLeft: '200px',
        marginTop: '64px',
        backgroundColor: 'white',
        minHeight: '100vh',
        padding: '20px'
      }}>
        {/* Search Bar */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px",marginLeft:"20px" }}>
        <Navbar onSearch={handleSearch} clearSearch={selectedEmployee !== ""} />
        </div>
       
        
        

        {/* Show PerformanceGraph when employee is selected, else show other charts */}
        {selectedEmployee ? (
          <> <p>Selected Employee: {selectedEmployee}</p>
             <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      <ButtonComponent label="Get Feedback" onClick={() => navigate("/feedback")} />
    </div>
            {/* <div><ButtonComponent label="Get Feedback" onClick={() => navigate("/feedback")} /></div> */}
            <PerformanceGraph employeeId={selectedEmployee} />
            
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

