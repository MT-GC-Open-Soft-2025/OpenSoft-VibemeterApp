import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Rewards() {
  // Dummy employee data
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

  // Find the maximum points among all employees
  const maxPoints = Math.max(...employees.map((emp) => emp.points));

  return (
    <div className="container mt-4" style={{ width: "25%" }}> {/* Reduced width to 1/4th */}
      <h2 className="mb-4">Employee Reward Points</h2>

      {employees.map((emp, i) => {
        const percentage = (emp.points / maxPoints) * 100;

        return (
          <div key={i} className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <strong>{emp.name}</strong>
              <span>{emp.points} pts</span>
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
        );
      })}
    </div>
  );
}