
// import React from "react";
// import { Bar } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from "chart.js";
// import "./PerformanceGraph.css";
// ChartJS.register(
//     CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend
// );

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const PerformanceGraph = () => {
//     const data = {
//         labels: ["Work Hours", "Leaves", "Onboarding"],
//         datasets: [
//             {
//                 label: "Work Hours",
//                 data: [7, 0, 0],
//                 backgroundColor: "#50aad7",
//                 borderRadius: 10,
//                 barThickness:-60,
//             },
//             {
//                 label: "Sick Leave",
//                 data: [0, 3, 0],
//                 backgroundColor: "#92badd",
//                 stack: "leave",
//                 barThickness:60,
//             },
//             {
//                 label: "Casual Leave",
//                 data: [0, 2, 0],
//                 backgroundColor: "#08ddcb",
//                 stack: "leave",
//                 barThickness:60,
//             },
//             {
//                 label: "Unpaid Leave",
//                 data: [0, 2, 0],
//                 backgroundColor: "#c1dcf3",
//                 stack: "leave",
//                 barThickness:60,
//             },
//             {
//                 label: "Annual Leave",
//                 data: [0, 2, 0],
//                 backgroundColor: "#1E90FF",
//                 stack: "leave",
//                 borderRadius: 10,
//                 barThickness:60,
//             },
//             {
//                 label: "Onboarding Performance",
//                 data: [0, 0, 6],
//                 backgroundColor: "#7fd7d0",
//                 borderRadius: 10,
//                 barThickness:-60,
//             },
//         ],
//     };

//     const options = {
//         responsive: true,
//         plugins: {
//             legend: {
//                 display: true,
//                 position: "bottom",
//                 labels: {
//                     usePointStyle: true,
//                     padding: 20,
//                 },
//             },
//             title: { display: true },
//         },
//         layout: {
//             padding: { left: 0, right: 0 },
//         },
//         scales: {
//             x: {
//                 grid: { display: false },
//                 ticks: {
//                     font: { size: 14, weight: "bold" ,},
//                     padding: 10,
//                 },
//             },
//             y: {
//                 beginAtZero: true,
//                 ticks: { stepSize: 1 },
//             },
//         },
        
//     };

//     return (
//         <div className="chart-container">
//             <h3 className="chart-title">Performance Graph</h3>
//             <div className="chart-wrapper">
//                 <Bar data={data} options={options} />
//             </div>
//         </div>
//     );
// };

// export default PerformanceGraph;
import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./PerformanceGraph.css";

const PerformanceGraph = () => {
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
