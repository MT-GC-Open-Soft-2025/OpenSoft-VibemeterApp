import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const emotionData = [
  { name: "Frustrated Zone", count: 51 },
  { name: "Leaning to Sad Zone", count: 48 },
  { name: "Leaning to Happy Zone", count: 47 },
  { name: "Neutral Zone (OK)", count: 47 },
  { name: "Sad Zone", count: 45 },
  { name: "Happy Zone", count: 39 },
  { name: "Excited Zone", count: 38 },
];

const EmotionZoneChart = () => {
  return (
    <div className="charts" style={{ width: "50%", height: 400 }}>
      <h2 style={{color: "black"}}>Emotion Zone Distribution</h2>
      <ResponsiveContainer className= "barchart" width="100%" height="100%">
        <BarChart data={emotionData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#007bff" barSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionZoneChart;

