import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./PieChart.css";

const pieDataValues = {
  value1: 20,
  value2: 10,
  value3: 15,
  value4: 15,
  value5: 25,
  value6: 15
};

const pieData = [
  { name: "1", value: pieDataValues.value1 },
  { name: "2", value: pieDataValues.value2 },
  { name: "3", value: pieDataValues.value3 },
  { name: "4", value: pieDataValues.value4 },
  { name: "5", value: pieDataValues.value5 },
  { name: "6", value: pieDataValues.value6 }
];

const COLORS = ['#4B9CD3', '#005A9C', '#008B8B', '#56BAED', '#0077FF', '#2E8B57'];

const PercentagePieChart = () => {
  return (
    <div className="charts" style={{ width: "50%", height: 400 }}>
      <h2 style={{color: "black"}}>Percentage Distribution</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PercentagePieChart;
