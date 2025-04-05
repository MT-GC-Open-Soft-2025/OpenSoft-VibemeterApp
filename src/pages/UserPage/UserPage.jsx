import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserPage.css";
import { useNavigate } from "react-router-dom";
import userImg from "../../Assets/user.png";
import Chat from "../../components/chat_popup/chat.jsx";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar.jsx";
import Sidebar from "../../components/Admin_page _components/Admin_sidebar/Adminpagesidebar";
import Badges from "../../components/Badges/Badges";
// import EmojiMeter from "../AdminPage/EmojiMeter.jsx";
import Image from "../../Assets/image.png";
import Swal from "sweetalert2";
import animationData from "../../Assets/Newanimation.json"; // Bot animation
import Lottie from "lottie-react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer/Footer.jsx";
import EmojiMeter from "../../components/Admin_page _components/Admin_performance_rewards/Emojimeter_user.jsx";
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
  //  const [selectedEmployee, setSelectedEmployee] = useState(""); 
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
    const pdfUrl =
      "https://apps.who.int/iris/bitstream/handle/10665/42823/9241562579.pdf";
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "Brochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return <div className="p-4">Loading...</div>;
  console.log("user",user)
  console.log(user.emp_id)

  const vibeEmoji =
    user.vibe_score >= 4.5 ? "😎" : user.vibe_score >= 3 ? "🙂" : "😕";
  const vibeMessage =
    user.vibe_score >= 4.5
      ? "You're doing great!"
      : user.vibe_score >= 3
      ? "Keep going, you're doing well!"
      : "It's okay to take breaks. You're not alone.";
  const performanceMessage =
    user.weighted_performance >= 4.5
      ? "You're such a dedicated worker! Keep Shining."
      : "You're doing Good! Keep Improving";
  const performanceImage =
    user.weighted_performance >= 4.5
      ? "https://img.freepik.com/free-vector/successful-businessman-concept-illustration_114360-7387.jpg"
      : "https://img.freepik.com/free-vector/personal-goal-setting-concept-illustration_114360-3873.jpg";

  return (
    <div className="feedback-wrapper">
      <Feedbacknavbar title="User Page" className="navbar1"/>
      <Sidebar />
      <div
        className="feedback-wrapper"
        style={{
          marginLeft: "170px",
          marginTop: "0px",
          backgroundImage:
            "linear-gradient(135deg, rgb(255, 255, 255), rgb(168, 241, 255))",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <div className="spaceh welcome">
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
            <EmojiMeter employeeId={user.emp_id}/>
            </div>

            <div className="description">
              <div id="rew" className="meet">
                {vibeMessage}
              </div>
            </div>
            
          </div>
          {/* <EmojiMeter employeeId={user.emp_id}/> */}
          <div
            id="fitness"
            className="row align-items-center my-5 animate__animated animate__fadeInLeft"
          >
            <div className="ancestor2" id="descrip">
              <div id="rew" className="meet">
                You've earned <strong>{user.reward_points}</strong> points.
                You're Amazing!
                <Badges />
              </div>
            </div>
            <div className="card">
              {user.reward_points > 0 ? (
                <>
                  <div id="desc">
                    <h4>Your Rewards</h4>
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
                  <div id="desc">
                  <h4>Your Rewards</h4>
                  </div>
                  <div className="image-wrapper">
                    <img
                      src="https://img.freepik.com/free-vector/achievements-concept-illustration_114360-4465.jpg"
                      alt="Start"
                      className="responsive-image"
                    />
                  </div>
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

          {user.leave_days !== undefined && (
            <div
              id="fitness"
              className="row align-items-center my-5 animate__animated animate__fadeInLeft"
            >
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
                        style={{fontSize:"22px", width:"13rem",paddingLeft:"25px"}}
                      >
                        Submit Survey
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="ancestor2" id="descrip">
                    <div id="rew" className="meet">
                      Please Take a moment to fill out this Short Survey - your
                      Feedback matters!
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

          {/*  MODIFIED CHAT BUBBLE SECTION START */}
          <div
            className="bot-container"
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          >
            <div
              className={`chat-bubble ${
                user.vibe_score >= 4.5
                  ? "high-vibe"
                  : user.vibe_score >= 3
                  ? "medium-vibe"
                  : "low-vibe"
              }`}
            >
              {user.vibe_score >= 4.5
                ? "You seem in a good mood today.Let's catchup."
                : user.vibe_score >= 3
                ? "Hey! Just checking in. Up for a quick chat?"
                : "Hey, you seem off. Want to talk?"}
            </div>

            <Lottie
              animationData={animationData}
              loop={true}
              className="bot-animation"
              style={{ cursor: "pointer" }}
            />
          </div>
          {/*  MODIFIED CHAT BUBBLE SECTION END */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserPage;

