import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import baseUrl from "../../../Config";

export default function Rewards({ employeeId }) {
  const [rewardPoints, setRewardPoints] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employeeId) return;

    const fetchRewards = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found. Please log in.");

        const response = await axios.get(
          `http://api.wellbee.live/admin/get_detail/${employeeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Rewards API Response:", response.data);
        setRewardPoints(response.data.user_record.reward_points || 0);
        setError("");
      } catch (err) {
        console.error("Error fetching reward points:", err.message);
        setError(err.message);
        setRewardPoints(0); // Set to 0 instead of null to prevent UI breaking
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
