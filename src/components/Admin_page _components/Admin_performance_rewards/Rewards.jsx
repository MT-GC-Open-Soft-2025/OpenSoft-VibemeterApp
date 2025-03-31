// File: src/components/Rewards.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Rewards() {
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

  // Filter for Alice's data
  const alice = employees.find((emp) => emp.name === "Alice");

  // Get max points among all employees for scaling
  const maxPoints = Math.max(...employees.map((emp) => emp.points));

  if (!alice) {
    return null;
  }

  const percentage = (alice.points / maxPoints) * 100;

  return (
    <div className="container mt-4" style={{ width: "25%" }}>
      <h2 className="mb-4">Employee Reward Points</h2>
      <div className="mb-4">
        <div className="d-flex justify-content-between mb-1">
          <strong>{alice.name}</strong>
          <span>{alice.points} pts</span>
          <span>{maxPoints}</span>
        </div>
        <div className="progress" style={{ height: "24px" }}>
          <div
            className="progress-bar bg-info"
            role="progressbar"
            style={{ width: `${percentage.toFixed(1)}%` }}
            aria-valuenow={percentage.toFixed(1)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
