// File: src/components/Performance.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Performance.css";

export default function Performance() {
  // Full employee data
  const employees = [
    { name: "Alice", points: 205 },
    { name: "Bob", points: 494 },
    { name: "Charlie", points: 271 },
    { name: "David", points: 360 },
    { name: "Eve", points: 157 },
    { name: "Frank", points: 439 },
    { name: "Grace", points: 393 },
    { name: "Hannah", points: 138 },
    { name: "Ivan", points: 417 },
    { name: "Judy", points: 287 },
  ];

  // Extract Alice's data
  const alice = employees.find((emp) => emp.name === "Alice");

  // Use full dataset to get max points for proper scaling
  const maxPoints = Math.max(...employees.map((emp) => emp.points));
  const boxHeight = 200; // Vertical box height (px)

  if (!alice) {
    return null;
  }

  const performanceRating = alice.points / maxPoints; // normalized 0-1
  const fillHeight = performanceRating * boxHeight;

  return (
    <div className="container mt-4">
      <h2>Employee Performance (0 - 1 Scale)</h2>
      <div className="employee-card">
        <h5>{alice.name}</h5>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          {/* Scale displayed on the left */}
          <div className="scale">
            <small>1.0</small>
            <small>0.5</small>
            <small>0</small>
          </div>
          {/* Performance box */}
          <div className="performance-box">
            <div
              className="performance-fill"
              title={`Performance Rating: ${performanceRating.toFixed(2)}`}
              style={{ height: `${fillHeight}px` }}
            />
          </div>
        </div>
        <p className="mt-2">
          Performance Rating: {performanceRating.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
