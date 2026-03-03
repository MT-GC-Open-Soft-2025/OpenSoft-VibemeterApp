import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getEmployeeDetail } from "../../../api/admin";

export default function Rewards({ employeeId }) {
  const [rewardPoints, setRewardPoints] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employeeId) return;

    const fetchRewards = async () => {
      try {
        const response = await getEmployeeDetail(employeeId);
        setRewardPoints(response.user_record.reward_points || 0);
        setError("");
      } catch (err) {
        console.error("Error fetching reward points:", err.message);
        setError(err.message);
        setRewardPoints(0);
      }
    };

    fetchRewards();
  }, [employeeId]);

  if (!employeeId) return <div className="no-rewards">No reward data available</div>;

  const maxPoints = 1500;
  const percentage = ((rewardPoints / maxPoints) * 100).toFixed(1);

  return (
    <div className="container mt-4" style={{ width: "30%" }}>
      <h2 className="mb-3 text-center">Employee Rewards</h2>

      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <div className="d-flex justify-content-between mb-7">
            <strong>Reward</strong>
            <span>{rewardPoints} pts</span>
            <span>Max: {maxPoints} pts</span>
          </div>

          <div className="progress" style={{ height: "24px", marginBottom: "80px" }}>
            <div
              className="progress-bar bg-info"
              role="progressbar"
              style={{ width: `${percentage}%`, minWidth: "10px" }} // Ensures visibility
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={maxPoints}
            >
              {percentage}%
            </div>
          </div>
        </>
      )}
    </div>
  );
}
