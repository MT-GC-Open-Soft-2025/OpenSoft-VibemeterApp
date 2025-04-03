import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Rewards({ employeeData }) {
  if (!employeeData) {
    return <div className="no-rewards">No reward data available</div>;
  }

  const rewardPoints = employeeData.reward_points || 0;
  const maxPoints = Math.max(rewardPoints, 100); // Assume a baseline max of 100 for scaling
  const percentage = (rewardPoints / maxPoints) * 100;

  return (
    <div className="container mt-4" style={{ width: "25%" }}>
      <h2 className="mb-4">Employee Reward Points</h2>
      <div className="mb-4">
        <div className="d-flex justify-content-between mb-1">
          <strong>{employeeData.emp_id}</strong>
          <span>{rewardPoints} pts</span>
          <span>{maxPoints} pts</span>
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
