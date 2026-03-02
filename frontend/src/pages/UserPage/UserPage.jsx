import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserPage.css";
import { useNavigate } from "react-router-dom";
import Chat from "../../components/chat_popup/chat.jsx";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar2.jsx";
import Sidebar from "../../components/Admin_page _components/Admin_sidebar/Adminpagesidebar";
import Badges from "../../components/Badges/Badges_user.jsx";
import Image from "../../Assets/image.png";
import Swal from "sweetalert2";
import animationData from "../../Assets/Newanimation.json";
import Lottie from "lottie-react";
import Footer from "../../components/Footer/Footer.jsx";
import EmojiMeter from "../../components/Admin_page _components/Admin_performance_rewards/Emojimeter_user.jsx";
import baseUrl from "../../Config.js";

const UserPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [empId, setEmpId] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem("empId");
    if (storedId) setEmpId(storedId);
  }, []);

  const handleClick = () => {
    setIsChatOpen((prev) => !prev);
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
    if (!token) navigate("/login");

    fetch(`${baseUrl}/user/getUserDetails`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch")))
      .then(setUser)
      .catch(console.error);
  }, [navigate]);

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

  if (!user) return <div className="p-4 text-center">Loading...</div>;

  const vibeMessage =
    user.vibe_score >= 4.5
      ? "You're doing great!"
      : user.vibe_score >= 3
      ? "Keep going, you're doing well!"
      : "It's okay to take breaks. You're not alone.";

  const performanceMessage =
    user.weighted_performance >= 4.5
      ? "You're such a dedicated worker! Keep shining."
      : "You are doing great. Keep improving!";

  const performanceImage =
    user.weighted_performance >= 4.5
      ? "https://img.freepik.com/free-vector/successful-businessman-concept-illustration_114360-7387.jpg"
      : "https://img.freepik.com/free-vector/personal-goal-setting-concept-illustration_114360-3873.jpg";

  return (
    <div className="feedback-wrapper">
      <Feedbacknavbar title="User Page" className="navbar1" />
      <div className="user-layout">
        <Sidebar />
        <div
          className="user-main-content w-100"
          style={{
            backgroundColor: "var(--wb-bg-main, #f4f7fc)",
            minHeight: "100vh",
            padding: "2rem",
            boxSizing: "border-box",
          }}
        >
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
            <div>
              <h1 className="fw-bold mb-2 text-dark">Hello there, {empId}</h1>
              <p className="text-muted fs-5 mb-0">
                Empowering you at work — support, growth, and motivation for every challenge.
              </p>
            </div>
            <button
              className="btn btn-primary rounded-pill px-4 py-2 mt-3 mt-md-0 shadow-sm"
              onClick={handleDownload}
              style={{ fontWeight: "600" }}
            >
              Download Brochure
            </button>
          </div>

          <div className="container-fluid p-0">
            <div className="row g-4">
              {/* TOP ROW */}
              <div className="col-md-6 col-lg-4 d-flex">
                <div className="card bg-white shadow-sm border-0 rounded-4 p-4 w-100 d-flex flex-column align-items-center justify-content-center">
                  <EmojiMeter employeeId={user.emp_id} />
                  <p className="text-center mt-3 text-muted fw-semibold fs-5">{vibeMessage}</p>
                </div>
              </div>

              <div className="col-md-6 col-lg-4 d-flex">
                <div className="card bg-white shadow-sm border-0 rounded-4 p-4 w-100 d-flex flex-column align-items-center justify-content-center text-center">
                  <h4 className="fw-bold mb-3 text-dark">Leave Balance</h4>
                  {user.leave_days === 0 ? (
                    <>
                      <img
                        src="https://img.freepik.com/free-vector/rocket-launch-concept-illustration_114360-6413.jpg"
                        alt="Zero Leaves"
                        className="img-fluid rounded-4 mb-3"
                        style={{ maxHeight: "180px", objectFit: "cover" }}
                      />
                      <p className="text-success fw-bold fs-5 mb-0">
                        Zero Leaves! You're a rockstar! 🚀
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="display-1 text-primary fw-bold mb-2">{user.leave_days || 0}</h1>
                      <p className="text-muted fs-5 mb-0">Days taken this year</p>
                    </>
                  )}
                </div>
              </div>

              <div className="col-md-12 col-lg-4 d-flex">
                <div className="card bg-white shadow-sm border-0 rounded-4 p-4 w-100 d-flex flex-column align-items-center justify-content-center text-center">
                  <h4 className="fw-bold mb-3 text-dark">Survey Form</h4>
                  <img
                    src="https://media.istockphoto.com/id/1019835506/vector/positive-business-woman-with-a-giant-pencil-on-his-shoulder-nearby-marked-checklist-on-a.jpg?s=612x612&w=0&k=20&c=vIJwRJQh7qTRQ7fGCEbJFebvplS7S7zTZAeVqVDtZ8k="
                    alt="Survey"
                    className="img-fluid rounded-4 mb-3"
                    style={{ maxHeight: "150px", objectFit: "cover" }}
                  />
                  <p className="text-muted mb-4 px-2">
                    Please take a moment to fill out this short survey - Your feedback matters!
                  </p>
                  <button
                    className="btn btn-outline-primary rounded-pill px-4 fw-bold"
                    onClick={handleFeedback}
                  >
                    Submit Survey
                  </button>
                </div>
              </div>

              {/* BOTTOM ROW */}
              <div className="col-lg-8 d-flex">
                <div className="card bg-white shadow-sm border-0 rounded-4 p-4 w-100">
                  <h4 className="fw-bold mb-4 text-dark">Performance Overview</h4>
                  <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-4 h-100">
                    <img
                      src={performanceImage}
                      alt="Performance"
                      className="img-fluid rounded-4"
                      style={{ maxHeight: "250px", objectFit: "cover" }}
                    />
                    <div className="text-center text-md-start">
                      <p className="fs-4 text-dark fw-semibold mb-2">{performanceMessage}</p>
                      <p className="text-muted">Keep tracking your milestones to earn more rewards and higher scores.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 d-flex">
                <div className="card bg-white shadow-sm border-0 rounded-4 p-4 w-100 d-flex flex-column align-items-center justify-content-center text-center">
                  <h4 className="fw-bold mb-3 text-dark">Your Rewards</h4>
                  <img
                    src="https://img.freepik.com/free-vector/achievements-concept-illustration_114360-4465.jpg"
                    alt="Rewards"
                    className="img-fluid rounded-4 mb-3"
                    style={{ maxHeight: "150px", objectFit: "cover" }}
                  />
                  <h2 className="text-warning fw-bold mb-2 display-5">{user.reward_points || 0} pts</h2>
                  <p className="text-muted mb-3">
                    {user.reward_points <= 200
                      ? "On the track, let's go for more."
                      : "YOU'RE AMAZING!"}
                  </p>
                  <div className="mt-2">
                    <Badges employeeId={empId} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHAT BUBBLE SECTION */}
          {!isChatOpen && (
            <div
              className="bot-container position-fixed"
              onClick={handleClick}
              style={{ cursor: "pointer", bottom: "2rem", right: "2rem", zIndex: 1000 }}
            >
              <div
                className={`chat-bubble mb-2 p-3 rounded-4 shadow-sm text-center position-relative ${
                  user.vibe_score >= 4.5
                    ? "bg-success text-white"
                    : user.vibe_score >= 3
                    ? "bg-light text-dark border"
                    : "bg-danger text-white"
                }`}
                style={{ width: "220px", fontSize: "14px", fontWeight: "500", animation: "bounce 2s infinite", right: "20px" }}
              >
                {user.vibe_score >= 4.5
                  ? "You seem in a good mood today. Let's catchup!"
                  : user.vibe_score >= 3
                  ? "Hey! Just checking in. Up for a quick chat?"
                  : "Hey, you seem off. Want to talk?"}
                <div className="bubble-arrow" style={{
                  position: "absolute",
                  bottom: "-10px",
                  right: "60px",
                  width: 0,
                  height: 0,
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: `10px solid ${user.vibe_score >= 4.5 ? '#198754' : user.vibe_score >= 3 ? '#f8f9fa' : '#dc3545'}`
                }}></div>
              </div>

              <Lottie
                animationData={animationData}
                loop={true}
                style={{ width: "160px", height: "160px", cursor: "pointer", marginLeft: "auto" }}
              />
            </div>
          )}

          {isChatOpen && (
            <Chat onClose={() => setIsChatOpen(false)} />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserPage;
