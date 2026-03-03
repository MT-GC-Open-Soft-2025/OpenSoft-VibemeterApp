import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EmojiMeter.css";
import { getUserDetails } from "../../../api/user";

export default function EmojiMeter({ employeeId }) {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!employeeId) return;

        const fetchEmojiMeter = async () => {
            try {
                const response = await getUserDetails();
                setUser(response);
                setError("");
            } catch (err) {
                console.error("Error fetching emoji meter:", err.message);
                setError(err.message);
                setUser(null);
            }
        };

        fetchEmojiMeter();
    }, [employeeId]);

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
        <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100">
            <div className="vibe-meter p-0 m-0">
                <div className={`vibe-circle ${mood.color} mx-auto m-0`}>
                    <svg
                        className="vibe-progress"
                        width="180"
                        height="180"
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
                                    {Math.round((truncatedVibeScore * 100) / 5)}%
                                </div>
                                <div className="vibe-label">{mood.text}</div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {truncatedVibeScore == -1 && (
                <p className="text-muted mt-2 text-center">No information available yet.</p>
            )}
        </div>
    );
}
