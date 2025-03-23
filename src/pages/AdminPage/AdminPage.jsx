// import React from "react";
// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
// import "./AdminPage.css"
// import bot from "../../Assets/bot.png";
// import Graph from "../../components/graph_l_wh_on";
// // const AdminPage = () => {
// //   const maxWorkHours = 9.99;
// //   const workHours = 6.92;
// //   return (
// //     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
// //     <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
// //     <Graph workHours={workHours} maxWorkHours={maxWorkHours} />
// //     </div>
// //   );
// // };
// // export default AdminPage;
// const AdminPage = () => {
//   const maxWorkHours = 9.99;
//   const workHours = 6.92;
//   const onboardingPerformance = "Good"; // Can be "Excellent", "Good", "Average", "Poor"
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
//       <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
//       <Graph workHours={workHours} onboardingPerformance={onboardingPerformance} />
//     </div>
//   );
// };
// export default AdminPage;


// import React from "react";
// import PerformanceGraph from "../../components/PerformanceGraph"; // Adjusted path

// const Admin = () => {
//   return (
//     <div>
//       <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Admin Dashboard</h1>
//       <PerformanceGraph />
//     </div>
//   );
// };

// export default Admin;


import React from "react";
import PerformanceGraph from "../../components/PerformanceGraph"; // Adjust the path if needed

const Admin = () => {
    return (
        <div className="admin-container">
            <h2>Performance Overview</h2>
            <PerformanceGraph />
        </div>
    );
};

export default Admin;

