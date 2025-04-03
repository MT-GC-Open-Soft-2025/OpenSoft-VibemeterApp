import React, { useState, useEffect } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./PerformanceGraph.css";

const PerformanceGraph = ({ employeeId }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employeeId) {
      setPerformanceData(null);
      return;
    }

    const fetchPerformanceData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const response = await axios.get(
          `http://127.0.0.1:8000/admin/get_detail/${employeeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Performance Data Response:", response.data);
        
        setPerformanceData(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching performance data:", err.message);
        setError(err.message);
        setPerformanceData(null);
      }
    };

    fetchPerformanceData();
  }, [employeeId]);

  if (!performanceData) {
    return <div className="empty-graph">Loading performance data...</div>;
  }

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
      categories: ["Work Hours", "Leaves", "Onboarding", "Performance"],
      labels: {
        style: { fontSize: "14px", fontWeight: "bold" },
        y: 25,
      },
    },
    yAxis: {
      title: { text: "Count" },
      allowDecimals: false,
      min: 0,
    },
    tooltip: {
      shared: false,
      formatter: function () {
        return `<b>${this.series.name}</b><br/>${this.y}`;
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
        pointWidth: 50,
        groupPadding: 0.5,
        stacking: "normal",
      },
    },
    series: [
      {
        name: "Work Hours",
        data: [performanceData.user_record.total_work_hours || 0, 0, 0, 0],
        color: "#50aad7",
        stack: "work",
      },
      {
        name: "Sick Leave",
        data: [0, performanceData.user_record.types_of_leaves?.["Sick Leave"] || 0, 0, 0],
        color: "#92badd",
        stack: "leave",
      },
      {
        name: "Casual Leave",
        data: [0, performanceData.user_record.types_of_leaves?.["Casual Leave"] || 0, 0, 0],
        color: "#08ddcb",
        stack: "leave",
      },
      {
        name: "Unpaid Leave",
        data: [0, performanceData.user_record.types_of_leaves?.["Unpaid Leave"] || 0, 0, 0],
        color: "#c1dcf3",
        stack: "leave",
      },
      {
        name: "Annual Leave",
        data: [0, performanceData.user_record.types_of_leaves?.["Annual Leave"] || 0, 0, 0],
        color: "#1E90FF",
        stack: "leave",
      },
      {
        name: "Onboarding Performance",
        data: [0, 0, performanceData.user_record.feedback || 0, 0],
        color: "#7fd7d0",
        stack: "onboarding",
      },
      {
        name: "Performance Rating",
        data: [
          0,
          0,
          0,
          performanceData.user_record.weighted_performance > 0
            ? performanceData.user_record.weighted_performance
            : 0,
        ],
        color: "#7fe5ff",
        stack: "performance",
      },
    ],
  };

  return (
    <div className="chart-container">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default PerformanceGraph;
