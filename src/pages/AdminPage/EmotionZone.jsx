import React from "react";
import "./AdminPage.css";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const emotionData = [
  { name: "Current Project", count: 2.3 },
  { name: "Mentor interaction", count: 4 },
  { name: "Leaves system", count: 3.5 },
  { name: "Vibemeter app", count: 4.7 },
  { name: "Work area setup", count: 2.1 },
];

const EmotionZoneChart = () => {
  return (
    <div className="charts">
      <h2>Some employees need a boost. Check their status!</h2>
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
