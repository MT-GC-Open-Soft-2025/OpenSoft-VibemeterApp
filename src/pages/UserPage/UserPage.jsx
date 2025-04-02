// import React, { useState } from "react";
// import { useNavigate } from 'react-router-dom';
// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
// import "./UserPage.css";
// import user from "../../Assets/user.png";
// import Chat from "../../components/chat_popup/chat.jsx"; // Adjust the relative path as necessary
// import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar.jsx";
// const UserPage = () => {
//   const navigate = useNavigate();
  
//   const [showChat, setShowChat] = useState(false);
//   const handleGoBack = () => {

//     navigate(-1);
//   };
//   const openChat = () => setShowChat(true);
//   const closeChat = () => setShowChat(false);

//   const handleFeedback = () => {
//     // This navigates to the new SurveyForm on /feedback
//     navigate("/surveyform");
//   };

//   return (
//     <div className='feedback-wrapper'>
      
//       <Feedbacknavbar title="User Page" />
   
//       {showChat ? (
//         <Chat onClose={closeChat} />
//       ) : (
//         <div className="content-container">
//           <div className="profile-container">
//             <img src={user} alt="User Icon" className="profile-icon" />
//             <span className="profile-user">Employee ID: 12345</span>
//           </div>
//           <div className="button-group">
//             <button className="chat-button" onClick={openChat}>
//               Let's Chat!
//             </button>
//             <button className="feedback-button" onClick={handleFeedback}>
//               Fill Feedback
//             </button>
//           </div>
//         </div>
//       )}
   
//     </div>
//   );
// };

// export default UserPage;
// UserPage.jsx
// UserPage.jsx
// UserPage.jsx
// UserPage.jsx
// UserPage.jsx
// UserPage.jsx
// UserPage.jsx
// UserPage.jsx
// UserPage.jsx
// UserPage.jsx
// UserPage.jsx
// UserDashboard.jsx
// UserPage.jsx
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserPage.css";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import animationData from "../../Assets/Newanimation.json"; // Bot animation
import Lottie from "lottie-react";
import { Link } from "react-router-dom";
import EmojiMeter from "./EmojiMeter";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const UserPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
      .then((res) => res.ok ? res.json() : Promise.reject("Failed to fetch"))
      .then(setUser)
      .catch(console.error);
  }, []);

  if (!user) return <div className="p-4">Loading...</div>;

  const vibeEmoji = user.vibe_score >= 4.5 ? "😎" : user.vibe_score >= 3 ? "🙂" : "😕";
  const vibeMessage = user.vibe_score >= 4.5 ? "You're doing great!" : user.vibe_score >= 3 ? "Keep going, you're doing well!" : "It's okay to take breaks. You're not alone.";
  const performanceMessage = user.weighted_performance >= 4.5 ? "You're such a dedicated worker! Keep shining!" : "You're doing great. Keep improving!";
  const performanceImage = user.weighted_performance >= 4.5
    ? "https://img.freepik.com/free-vector/successful-businessman-concept-illustration_114360-7387.jpg"
    : "https://img.freepik.com/free-vector/personal-goal-setting-concept-illustration_114360-3873.jpg";

  return (
    <div className="dashboard-container animate__animated animate__fadeIn">
      <aside className="sidebar">
        <div className="user-profile">
          <img src={user.image || "https://i.pravatar.cc/150"} alt="User Avatar" className="user-avatar" />
          <h5 className="animated-id">
            {user.emp_id.split("").map((char, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.04}s` }}>{char}</span>
            ))}
          </h5>
        </div>
        <nav>
          <button className="nav-link">Chat History</button>
          <button className="nav-link">Contact Us</button>
          <button className="nav-link" onClick={handleFeedback}>Submit Survey</button>
          <button className="nav-link logout" onClick={handleGoBack}>Log Out</button>
        </nav>
      </aside>

      <main className="main-content">
        <h1 className="greeting display-3 fw-bold">
          Hello Employee {user.emp_id}
      
        </h1>
        

        <div className="dashboard-sections">
          <div className={`card-section vibe-section ${user.vibe_score < 3 ? 'low-vibe' : ''}`}>
            <h4>Your Vibe Status {vibeEmoji}</h4>
            <p>{vibeMessage}</p>
            <p className="score">Score: {user.vibe_score}</p>
            <img src="https://img.freepik.com/free-vector/emotional-intelligence-concept-illustration_114360-9002.jpg" alt="Vibe" />
          </div>

          <div className="card-section reward-section">
            {user.reward_points > 0 ? (
              <>
                <h4>Your Rewards</h4>
                <p>You've earned <strong>{user.reward_points}</strong> points. You're amazing!</p>
                <img src="https://img.freepik.com/free-vector/achievements-concept-illustration_114360-4465.jpg" alt="Rewards" />
              </>
            ) : (
              <>
                <h4>Don't Worry!</h4>
                <p>You haven't earned points yet, but your journey's just beginning. Keep pushing! 💪</p>
                <img src="https://img.freepik.com/free-vector/startup-launch-concept-illustration_114360-6414.jpg" alt="Start" />
              </>
            )}
          </div>

          {user.award_list && user.award_list.length > 0 ? (
            <div className="card-section awards-section">
              <h4>Your Awards</h4>
              <p>You’ve unlocked these by being awesome ✨</p>
              <div className="badges">
                {user.award_list.map((emoji, idx) => (
                  <div key={idx} className="badge">{emoji}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card-section awards-section">
              <h4>No Awards Yet</h4>
              <p>Keep contributing, and your efforts will be recognized! 🌟</p>
              <img src="https://img.freepik.com/free-vector/talent-search-concept-illustration_114360-4756.jpg" alt="No Awards" />
            </div>
          )}

          {user.leave_days !== undefined && user.leave_days === 0 && (
            <div className="card-section leave-section">
              <h4>Zero Leaves!</h4>
              <p>Wow, you haven’t taken any leaves. You're a rockstar! 🚀</p>
              <img src="https://img.freepik.com/free-vector/rocket-launch-concept-illustration_114360-6413.jpg" alt="Rocket" />
            </div>
          )}

          <div className="card-section metrics-section">
            <h4>Performance Overview</h4>
            <p>{performanceMessage}</p>
            <img src={performanceImage} alt="Performance" />
          </div>
          <div className="vibe-meter-container">
                <EmojiMeter />
              </div>
          <div className="bot-container">
            <div className="chat-bubble">Hi! How can I assist you?</div>
            <Link to="/chat">
              <Lottie 
                animationData={animationData} 
                loop={true} 
                className="bot-animation" 
                style={{ cursor: "pointer" }} // Makes it clear that it's clickable
              />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserPage;
