import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import "./PerformanceGraph.css";
import { getEmployeeDetail } from "../../../api/admin";

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
        const response = await getEmployeeDetail(employeeId);
        setPerformanceData(response);
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
    return (
      <div className="empty-graph d-flex align-items-center justify-content-center p-4">
        <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
        Loading performance data...
      </div>
    );
  }

  const rec = performanceData.user_record;
  const leaves = rec.types_of_leaves || {};

  const chartData = [
    { name: "Work Hours", value: rec.total_work_hours || 0 },
    { name: "Sick Leave", value: leaves["Sick Leave"] || 0 },
    { name: "Casual Leave", value: leaves["Casual Leave"] || 0 },
    { name: "Unpaid Leave", value: leaves["Unpaid Leave"] || 0 },
    { name: "Annual Leave", value: leaves["Annual Leave"] || 0 },
    { name: "Onboarding", value: rec.feedback || 0 },
    { name: "Performance", value: rec.weighted_performance > 0 ? rec.weighted_performance : 0 },
  ];

  return (
    <div className="chart-container">
      <h5 className="fw-bold mb-3 text-dark">Performance Graph</h5>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#50aad7" radius={[5, 5, 0, 0]} name="Score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceGraph;
