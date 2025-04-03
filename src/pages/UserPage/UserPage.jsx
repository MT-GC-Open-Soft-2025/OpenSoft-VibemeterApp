import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserPage.css";
import { useNavigate } from "react-router-dom";
import userImg from "../../Assets/user.png";
import Chat from "../../components/chat_popup/chat.jsx";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar.jsx";
import Sidebar from "../../components/Admin_page _components/Admin_sidebar/Adminpagesidebar";
import Badges from "../../components/Badges/Badges";
import EmojiMeter from "../AdminPage/EmojiMeter.jsx";
import Image from "../../Assets/image.png";
import Swal from "sweetalert2";
import animationData from "../../Assets/Newanimation.json"; // Bot animation
import Lottie from "lottie-react";
import { Link } from "react-router-dom";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const UserPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleClick = () => {
    navigate("/chat");
  };

  const handleGoBack = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "No, stay",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        navigate(-1);
      }
    });
  };

  const handleFeedback = () => {
    navigate("/surveyform");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8000/user/getUserDetails", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch")))
      .then(setUser)
      .catch(console.error);
  }, []);

  const handleDownload = () => {
    // Replace with your PDF file URL
    const pdfUrl =
      "https://apps.who.int/iris/bitstream/handle/10665/42823/9241562579.pdf";

    // Create an invisible anchor element
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "Brochure.pdf"; // Specify the filename

    // Append to the DOM, trigger click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const truncatedVibeScore = user ? user.vibe_score.toFixed(2) : 0;

  if (!user) return <div className="p-4">Loading...</div>;
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
  // const dashOffset = circumference - (user.vibe_score / 5) * circumference;
  const dashOffset =
  truncatedVibeScore === -1
    ? circumference
    : circumference - (truncatedVibeScore / 5) * circumference;


  // {user.vibe_score === -1 ? ( dashOffset = 0) : (dashOffset = circumference - (user.vibe_score / 5) * circumference;)}
  // const mood = getMood();
  const mood = getMood();
  const vibeEmoji =
  truncatedVibeScore >= 4.5 ? "😎" : truncatedVibeScore >= 3 ? "🙂" : "😕";
  const vibeMessage =
  truncatedVibeScore >= 4.5
      ? "You're doing great!"
      : truncatedVibeScore >= 3
      ? "Keep going, you're doing well!"
      : "It's okay to take breaks. You're not alone.";
  const performanceMessage =
    user.weighted_performance >= 4.5
      ? "YOU'RE SUCH A DEDICATED WORKER! KEEP SHINING."
      : "YOU'RE DOING GREAT! KEEP IMPROVING";
  const performanceImage =
    user.weighted_performance >= 4.5
      ? "https://img.freepik.com/free-vector/successful-businessman-concept-illustration_114360-7387.jpg"
      : "https://img.freepik.com/free-vector/personal-goal-setting-concept-illustration_114360-3873.jpg";

  return (
    <div className="feedback-wrapper">
      <Feedbacknavbar title="User Page" />
      <Sidebar />
      <div
        className="feedback-wrapper"
        style={{
          width: "88.8%",
          marginLeft: "170px",
          marginTop: "0px",
          backgroundImage:
            "linear-gradient(135deg, rgb(255, 255, 255), rgb(168, 241, 255))",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <div className="welcome">
          <h1>Hello Employee!</h1>
          <p className="para">
            Empowering you at work — support, growth, and motivation for every
            challenge.
          </p>
          <button
            className="nav-link1"
            onClick={handleDownload}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Download Brochure
          </button>
        </div>

        <div className="info">
          <div className="row align-items-center my-5 animate__animated animate__fadeInLeft">
            <div className="ancestor">
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
                      {truncatedVibeScore === -1 ? (
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
                <p className="score">Score: {truncatedVibeScore}</p>
                {truncatedVibeScore === -1 ? (
                  <p> No information available yet </p>
                ) : (
                  <p> </p>
                )}
              </div>
            </div>

            <div className="description">
              <div id="rew" className="meet">
                {vibeMessage}
              </div>
            </div>
          </div>

          {/* "Let's Chat!" button */}
          {/* <button className="chat-button" onClick={openChat}>
                Let's Chat!
              </button> */}
          {/* <button className="feedback-button" onClick={handleFeedback}>
                Fill Feedback
              </button> */}
          <div
            id="fitness"
            className="row align-items-center my-5 animate__animated animate__fadeInLeft"
          >
            <div className="ancestor2" id="descrip">
              <div id="rew" className="meet">
                You've earned <strong>{user.reward_points}</strong> points.
                You're amazing!
                <Badges />
              </div>
            </div>
            <div className="card">
              {user.reward_points > 0 ? (
                <>
                  <div id="desc">
                    <h4>Your Rewards</h4>
                    {/* <Badges/> */}
                    {/* <p>
                            You've earned <strong>{user.reward_points}</strong>{" "}
                            points. You're amazing!
                          </p> */}
                  </div>
                  <div className="image-wrapper">
                    <img
                      src="https://img.freepik.com/free-vector/achievements-concept-illustration_114360-4465.jpg"
                      alt="Responsive"
                      className="responsive-image"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h4>Don't Worry!</h4>
                  <p>
                    You haven't earned points yet, but your journey's just
                    beginning. Keep pushing! 💪
                  </p>
                  <img
                    src="https://img.freepik.com/free-vector/startup-launch-concept-illustration_114360-6414.jpg"
                    alt="Start"
                  />
                </>
              )}
            </div>
          </div>
          <div
            id="fitness"
            className="row align-items-center my-5 animate__animated animate__fadeInLeft"
          >
            <div className="card">
              <div id="desc">
                <h4>Performance Overview</h4>
              </div>
              <div className="image-wrapper">
                <img
                  src={performanceImage}
                  alt="Performance"
                  className="responsive-image"
                />
              </div>
            </div>
            <div className="ancestor2" id="descrip">
              <div id="rew" className="meet">
                {performanceMessage}
              </div>
            </div>
          </div>

          {user.leave_days !== undefined && user.leave_days === 0 && (
            <div
              id="fitness"
              className="row align-items-center my-5 animate__animated animate__fadeInLeft"
            >
              <div className="ancestor2" id="descrip">
                <div id="rew" className="meet">
                  Wow, you haven’t taken any leaves. You're a rockstar! 🚀
                </div>
              </div>
              <div className="card">
                <div id="desc">
                  <h4>Zero Leaves!</h4>
                </div>
                <div className="image-wrapper">
                  <img
                    src="https://img.freepik.com/free-vector/rocket-launch-concept-illustration_114360-6413.jpg"
                    alt="Performance"
                    className="responsive-image"
                  />
                </div>
              </div>
            </div>
          )}
          {/* {user.leave_days !== undefined && user.leave_days === 0 && (
                <div
                  id="fitness"
                  className="row align-items-center my-5 animate__animated animate__fadeInLeft"
                >
                  <div className="ancestor2" id="descrip">
                    <div id="rew" className="meet">
                      Wow, you haven’t taken any leaves. You're a rockstar! 🚀
                    </div>
                  </div>
                  <div className="card">
                    <div id="desc">
                      <h4>Zero Leaves!</h4>
                    </div>
                    <div className="image-wrapper">
                      <img
                        src="https://img.freepik.com/free-vector/rocket-launch-concept-illustration_114360-6413.jpg"
                        alt="Performance"
                        className="responsive-image"
                      />
                    </div>
                  </div>
                  
                </div>
              )} */}
          {user.leave_days !== undefined && (
            <div
              id="fitness"
              className="row align-items-center my-5 animate__animated animate__fadeInLeft"
            >
              {/* If user has taken 0 leaves, place ancestor2 first, otherwise place card first */}
              {user.leave_days === 0 ? (
                <>
                  <div className="card">
                    <div id="desc">
                      <h4>Survey Form</h4>
                    </div>
                    <div className="image-wrapper">
                      <img
                        src="https://media.istockphoto.com/id/1019835506/vector/positive-business-woman-with-a-giant-pencil-on-his-shoulder-nearby-marked-checklist-on-a.jpg?s=612x612&w=0&k=20&c=vIJwRJQh7qTRQ7fGCEbJFebvplS7S7zTZAeVqVDtZ8k="
                        alt="Performance"
                        className="responsive-image"
                      />
                    </div>
                  </div>
                  <div className="ancestor2" id="descrip">
                    <div id="rew1" className="meet">
                      Please take a moment to fill out this short survey - Your
                      feedback matters !
                      <button
                        className="nav-link1"
                        id="button2"
                        onClick={handleFeedback}
                      >
                        Submit Survey
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="ancestor2" id="descrip">
                    <div id="rew1" className="meet">
                      Please take a moment to fill out this short survey - Your
                      feedback matters !
                      <button className="nav-link1" onClick={handleFeedback}>
                        Submit Survey
                      </button>
                    </div>
                  </div>
                  <div className="card">
                    <div id="desc">
                      <h4>Survey Form</h4>
                    </div>
                    <div className="image-wrapper">
                      <img
                        src="https://media.istockphoto.com/id/1019835506/vector/positive-business-woman-with-a-giant-pencil-on-his-shoulder-nearby-marked-checklist-on-a.jpg?s=612x612&w=0&k=20&c=vIJwRJQh7qTRQ7fGCEbJFebvplS7S7zTZAeVqVDtZ8k="
                        alt="Performance"
                        className="responsive-image"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <div
            className="bot-container"
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          >
            <div className="chat-bubble">Hi! How can I assist you?</div>
            <Lottie
              animationData={animationData}
              loop={true}
              className="bot-animation"
              style={{ cursor: "pointer" }} // Makes it clear that it's clickable
            />
          </div>

          {/* </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
