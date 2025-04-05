import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EmojiMeter.css";
import axios from "axios";
import baseUrl from "../../../Config";

export default function EmojiMeter({ employeeId }) {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!employeeId) return;

        const fetchEmojiMeter = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No authentication token found. Please log in.");

                
                const response=await axios.get(`http://api.wellbee.live/user/getUserDetails`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log("EmojiMeter API Response:", response.data);
                setUser(response.data);  // ✅ Store full user data
                setError("");
            } catch (err) {
                console.error("Error fetching reward points:", err.message);
                setError(err.message);
                setUser(null);
            }
        };

        fetchEmojiMeter();
    }, [employeeId]);
    console.log("user received:",user)

    if (!user) return <div className="p-4">Loading...</div>;

    const truncatedVibeScore = user?.vibe_score ? user.vibe_score.toFixed(2) : 0;

    const getMood = () => {
        if (truncatedVibeScore >= 4.5)
          return { icon: "bi-emoji-smile-fill", text: "Happy", color: "success" };
        if (truncatedVibeScore >= 3)
          return {
            icon: "bi-emoji-neutral-fill",
            text: "Neutral",
            color: "primary",
          };
    
        if (truncatedVibeScore < 3 && truncatedVibeScore >= 0)
          return {
            icon: "bi-emoji-frown-fill",
            text: "Sad",
            color: "danger",
          };
        return {
          icon: "bi-emoji-neutral-fill",
          text: "Neutral",
          color: "primary",
        };
      };

    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const dashOffset =
        truncatedVibeScore === -1 ? circumference : circumference - (truncatedVibeScore / 5) * circumference;

    const mood = getMood();
    // const performanceMessage =
    //     user?.weighted_performance >= 4.5
    //         ? "YOU'RE SUCH A DEDICATED WORKER! KEEP SHINING."
    //         : "YOU'RE DOING GREAT! KEEP IMPROVING";
    // const performanceImage =
    //     user?.weighted_performance >= 4.5
    //         ? "https://img.freepik.com/free-vector/successful-businessman-concept-illustration_114360-7387.jpg"
    //         : "https://img.freepik.com/free-vector/personal-goal-setting-concept-illustration_114360-3873.jpg";

    return (
        <div className="row align-items-center my-5 animate__animated animate__fadeInLeft">
            <div className="ancestor" id="hey">
              <div
                className={`card text-center shadow-lg p-2 box ${
                  truncatedVibeScore === -1
                    ? "neutral"
                    : truncatedVibeScore < 3
                    ? "low-vibe"
                    : truncatedVibeScore > 4.5
                    ? "happy"
                    : "neutral"
                }`}
                style={{ width: "22rem", marginTop: "2rem" }}
              >
                <div className="vibe-meter">
                  <div className="head">
                    <h4>Emoji Mood Meter</h4>
                  </div>
                  <div className={`vibe-circle ${mood.color}`}>
                    <svg
                      className="vibe-progress"
                      width="200"
                      height="200"
                      viewBox="0 0 200 200"
                    >
                      <circle
                        className="vibe-progress-bg"
                        cx="100"
                        cy="100"
                        r={radius}
                        strokeWidth="10"
                      />
                      <circle
                        className={`vibe-progress-fill vibe-${mood.color}`}
                        cx="100"
                        cy="100"
                        r={radius}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                      />
                    </svg>
                    <div className="vibe-content">
                      <i className={`bi ${mood.icon} vibe-icon`}></i>
                      {truncatedVibeScore == -1 ? (
                        <>
                          <div className="vibe-percentage">0%</div>
                          <div className="vibe-label">{mood.text}</div>
                        </>
                      ) : (
                        <>
                          <div className="vibe-percentage">
                            {(truncatedVibeScore * 100) / 5}%
                          </div>
                          <div className="vibe-label">{mood.text}</div>
                        </>
                      )}
                      {/* <div className="vibe-percentage">
                        {(user.vibe_score * 100) / 5}%
                      </div> */}
                      {/* <div className="vibe-label">{mood.text}</div> */}
                    </div>
                  </div>
                </div>

                {/* <div className="card-body">
                  <span className="display-1 text-warning">{vibeEmoji}</span>
                </div> */}
              
                {truncatedVibeScore == -1 ? (
                  <p> No information available yet. </p>
                ) : (
                    <p className="score">Score: {truncatedVibeScore}</p>
                )}
              </div>
            </div>
            {/* <div className="description">
              <div id="rew" className="meet">
                {vibeMessage}
              </div>
            </div> */}
          </div>
    );
}
