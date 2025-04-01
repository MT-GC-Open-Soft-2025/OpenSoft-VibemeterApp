import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./UserPage.css";
import user from "../../Assets/user.png";
import Chat from "../../components/chat_popup/chat.jsx"; // Adjust the relative path as necessary
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar.jsx";
import Sidebar from "../../components/Admin_page _components/Admin_sidebar/Adminpagesidebar";
import Badges from "../../components/Badges/Badges";

const UserPage = () => {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const handleGoBack = () => {
    navigate(-1);
  };
  const openChat = () => setShowChat(true);
  const closeChat = () => setShowChat(false);

  return (
    <>
      <div className="parent">
        <Feedbacknavbar title="User Page" />
        <Sidebar />
        <div
          className="feedback-wrapper"
          style={{
            marginLeft: "200px",
            marginTop: "64px",
            backgroundImage: "linear-gradient(135deg, #74ebd5,#acb6e5)",
            minHeight: "100vh",
            padding: "20px",
          }}
        >
          {/* <div className="mb-5 animate__animated animate__fadeInDown">
        <h1 className="display-4 fw-bold text-primary">Welcome to MindWell</h1>
        <p className="lead text-muted">
          Your mental well-being companion — guided support, self-care, and motivation.
        </p>
        <a href="#fitness" className="btn btn-outline-primary mt-3">Explore Mental Fitness</a>
      </div> */}
          <div className="welcome">
            <h1>Hello Employee!</h1>
            <p className="para">
              Empowering you at work — support, growth, and motivation for every
              challenge.
            </p>
            <a href="#fitness" className="btn btn-outline-primary mt-3">
              Download Brochure
            </a>
          </div>
          {showChat ? (
            <Chat onClose={closeChat} />
          ) : (
            <div className="info">
              {/* Profile container with icon and employee id */}
              {/* <div className="profile-container">
                <img src={user} alt="User Icon" className="profile-icon" />
                <span className="profile-user">Employee ID: 12345</span>
              </div> */}
              <Badges />
              <div className="row align-items-center my-5 animate__animated animate__fadeInLeft">
                <div className="col-md-6">
                  <img
                    src="https://img.freepik.com/free-vector/chatbot-concept-illustration_114360-5522.jpg"
                    alt="Chatbot"
                    className="img-fluid rounded shadow"
                  />
                </div>
                <div className="col-md-6 text-start">
                  <h2 className="fw-semibold text-primary">Meet MindBot 🤖</h2>
                  <p className="text-muted">
                    Your friendly mental wellness chatbot, always here to talk,
                    check in, and help guide you through daily ups and downs.
                  </p>
                  {/* <Link
                    to="chat"
                    smooth
                    duration={500}
                    className="btn btn-outline-primary mt-3"
                  >
                    Start Chatting
                  </Link> */}
                </div>
              </div>
              {/* "Let's Chat!" button */}
              {/* <button className="chat-button" onClick={openChat}>
                Let's Chat!
              </button> */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserPage;
