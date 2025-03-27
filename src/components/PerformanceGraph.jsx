
import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./PerformanceGraph.css";

const PerformanceGraph = ({ employeeId }) => {
    if (!employeeId) {
            return <div className="empty-graph">Select an employee to see data</div>;
          }
        
          console.log("Rendering Graph for:", employeeId); // ✅ Debugging Log
    const options = {
        chart: {
            type: "column",
            backgroundColor: "#fff",
            borderRadius: 10,
        },
        title: {
            text: "Performance Graph",
            align: "center",
            style: { fontSize: "18px", fontWeight: "bold" },
        },
        xAxis: {
            categories: ["Work Hours", "Leaves", "Onboarding","Performance"],
            labels: {
                style: { fontSize: "14px", fontWeight: "bold" },
                y: 25, // Moves labels downward for better alignment
            },
        },
        yAxis: {
            title: { text: "Count" },
            allowDecimals: false,
            min: 0,
        },
        tooltip: {
            shared: false, // Shows only hovered bar's data
            formatter: function () {
                return `<b>${this.series.name}</b><br/>${this.y}</b>`;
            },
        },
        legend: {
            layout: "horizontal",
            align: "center",
            verticalAlign: "bottom",
        },
        plotOptions: {
            column: {
                borderRadius: 5,
                pointPadding: 0.1,
                pointWidth:50,
                groupPadding: 0.5, // Ensures correct bar spacing
                stacking: "normal", // ✅ **Stacking is back!**
            },
        },
        series: [
            { name: "Work Hours", data: [7, 0, 0,0], color: "#50aad7", stack: "work" },
            { name: "Sick Leave", data: [0, 3, 0,0], color: "#92badd", stack: "leave" },
            { name: "Casual Leave", data: [0, 2, 0,0], color: "#08ddcb", stack: "leave" },
            { name: "Unpaid Leave", data: [0, 2, 0,0], color: "#c1dcf3", stack: "leave" },
            { name: "Annual Leave", data: [0, 2, 0,0], color: "#1E90FF", stack: "leave" },
            { name: "Onboarding Performance", data: [0, 0, 6,0], color: "#7fd7d0", stack: "onboarding" },
            { name: "Performance Rating", data: [0, 0, 0,5], color: "#7fe5ff", stack: "performance" },
        ],
    };

    return (
        <div className="chart-container">
            <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
    );
};

export default PerformanceGraph;
// // import React from "react";
// // import Highcharts from "highcharts";
// // import HighchartsReact from "highcharts-react-official";
// // import "./PerformanceGraph.css";

// // const PerformanceGraph = ({ employeeId }) => {
// //   if (!employeeId) {
// //     return <div className="empty-graph">Select an employee to see data</div>;
// //   }

// //   const options = {
// //     chart: { type: "column", backgroundColor: "#fff", borderRadius: 10 },
// //     title: {
// //       text: `Performance Graph - ${employeeId}`,
// //       align: "center",
// //       style: { fontSize: "18px", fontWeight: "bold" },
// //     },
// //     xAxis: {
// //       categories: ["Work Hours", "Leaves", "Onboarding", "Performance"],
// //       labels: { style: { fontSize: "14px", fontWeight: "bold" }, y: 25 },
// //     },
// //     yAxis: { title: { text: "Count" }, allowDecimals: false, min: 0 },
// //     legend: { layout: "horizontal", align: "center", verticalAlign: "bottom" },
// //     series: [
// //       { name: "Work Hours", data: [7, 0, 0, 0], color: "#50aad7" },
// //       { name: "Sick Leave", data: [0, 3, 0, 0], color: "#92badd" },
// //       { name: "Casual Leave", data: [0, 2, 0, 0], color: "#08ddcb" },
// //       { name: "Unpaid Leave", data: [0, 2, 0, 0], color: "#c1dcf3" },
// //       { name: "Annual Leave", data: [0, 2, 0, 0], color: "#1E90FF" },
// //       { name: "Onboarding Performance", data: [0, 0, 6, 0], color: "#7fd7d0" },
// //       { name: "Performance Rating", data: [0, 0, 0, 5], color: "#7fe5ff" },
// //     ],
// //   };

// //   return (
// //     <div className="chart-container">
// //       <HighchartsReact highcharts={Highcharts} options={options} />
// //     </div>
// //   );
// // };

// // export default PerformanceGraph;
// import React from "react";
// import Highcharts from "highcharts";
// import HighchartsReact from "highcharts-react-official";
// import "./PerformanceGraph.css";

// const PerformanceGraph = ({ employeeId }) => {
//   if (!employeeId) {
//     return <div className="empty-graph">Select an employee to see data</div>;
//   }

//   console.log("Rendering Graph for:", employeeId); // ✅ Debugging Log

//   const options = {
//     chart: { type: "column", backgroundColor: "#fff", borderRadius: 10 },
//     title: {
//       text: `Performance Graph - ${employeeId}`,
//       align: "center",
//       style: { fontSize: "18px", fontWeight: "bold" },
//     },
//     xAxis: {
//       categories: ["Work Hours", "Leaves", "Onboarding", "Performance"],
//       labels: { style: { fontSize: "14px", fontWeight: "bold" }, y: 25 },
//     },
//     yAxis: { title: { text: "Count" }, allowDecimals: false, min: 0 },
//     legend: { layout: "horizontal", align: "center", verticalAlign: "bottom" },
//     series: [
//       { name: "Work Hours", data: [7, 0, 0, 0], color: "#50aad7" },
//       { name: "Sick Leave", data: [0, 3, 0, 0], color: "#92badd" },
//       { name: "Casual Leave", data: [0, 2, 0, 0], color: "#08ddcb" },
//       { name: "Unpaid Leave", data: [0, 2, 0, 0], color: "#c1dcf3" },
//       { name: "Annual Leave", data: [0, 2, 0, 0], color: "#1E90FF" },
//       { name: "Onboarding Performance", data: [0, 0, 6, 0], color: "#7fd7d0" },
//       { name: "Performance Rating", data: [0, 0, 0, 5], color: "#7fe5ff" },
//     ],
//   };

//   return (
//     <div className="chart-container">
//       <HighchartsReact highcharts={Highcharts} options={options} />
//     </div>
//   );
// };

// export default PerformanceGraph;
