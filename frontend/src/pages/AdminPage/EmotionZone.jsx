import React, { useState, useEffect } from "react";
import "./AdminPage.css";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import axios from "axios";
import baseUrl from "../../Config";
const EmotionZoneChart = () => {
  const [emotionData, setEmotionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Custom labels for feedback categories
  const labels = [
    "Current Project",
    "Mentor Interaction",
    "Leaves System",
    "Vibemeter App",
    "Work Area Setup",
  ];

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found. Please log in.");

        // ✅ Fetching feedback data
        const response = await axios.get(`${baseUrl}/admin/get_aggregate_feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Feedback API Response:", response.data);

        // ✅ Extract the correct list
        const scoreList = response.data["Average score list"];
        if (!scoreList || !Array.isArray(scoreList)) {
          throw new Error("Invalid API response format");
        }

        // ✅ Display exactly what the API returns
        const formattedData = scoreList.map((value, index) => ({
          name: labels[index] || `Category ${index + 1}`,
          count: value,
        }));

        console.log("Formatted Data:", formattedData);
        setEmotionData(formattedData);
        setLoading(false);
        setError("");
      } catch (err) {
        console.error("Error fetching feedback data:", err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) return <div>Loading feedback data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="charts">
      <h2 style={{fontFamily:"'Noto Sans', sans-serif"}}>Some employees need a boost. Check their status!</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={emotionData} margin={{ top: 20, right: 20, left: 0, bottom: 50 }}>
          <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 12 }} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#0d709e" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionZoneChart;
