import React, { useEffect } from 'react';
import { Element, scroller, Link } from 'react-scroll';
import { Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';


const LandingPage = () => {
  const navigate = useNavigate();

 
  const scrollToLogin = () => {
    scroller.scrollTo("loginSection", {
      duration: 800,
      delay: 0,
      smooth: "easeInOutQuart",
      offset: -50,
    });
  };

  return (
    
      <Element name="landing" className="section bg-white text-center">
          <div className="container py-5">
      
            {/* Hero Section */}
            <div className="mb-5 animate__animated animate__fadeInDown">
              <h1 className="display-4 fw-bold text-primary">Welcome to WellBee</h1>
              <p className="lead text-muted">
                Your mental well-being companion — guided support, self-care, and motivation.
              </p>
              <a href="#fitness" className="btn btn-outline-primary mt-3">Explore Mental Fitness</a>
            </div>
      
            {/* Chatbot Section */}
            <div className="row align-items-center my-5 animate__animated animate__fadeInLeft">
              <div className="col-md-6">
                <img
                  src="https://img.freepik.com/free-vector/chatbot-concept-illustration_114360-5522.jpg"
                  alt="Chatbot"
                  className="img-fluid rounded shadow"
                />
              </div>
              <div className="col-md-6 text-start">
                <h2 className="fw-semibold text-primary">Meet Vibey 🤖</h2>
                <p className="text-muted">
                  Your friendly mental wellness chatbot, always here to talk, check in,
                  and help guide you through daily ups and downs.
                </p>
                <Link to="chat" smooth duration={500} className="btn btn-outline-primary mt-3">
        Start Chatting
      </Link>
      
              </div>
            </div>
      
            {/* Mental Fitness Section */}
            <div id="fitness" className="row align-items-center my-5 animate__animated animate__fadeInRight">
              <div className="col-md-6 order-md-2">
                <img
                  src="https://img.freepik.com/free-vector/cartoon-business-people-meditating-illustration_23-2148910628.jpg?semt=ais_hybrid"
                  alt="Mental Fitness"
                  className="img-fluid rounded shadow"
                />
              </div>
              <div className="col-md-6 order-md-1 text-start">
                <h2 className="fw-semibold text-info">Mental Fitness Routines 💙</h2>
                <p className="text-muted">
                  Short guided routines to boost emotional resilience, calm anxiety, and improve sleep —
                  tailored just for you.
                </p>
                <button className="btn btn-info text-white mt-2">Try a Session</button>
              </div>
            </div>
      
          </div>
        </Element>
      

      
  );
};

export default LandingPage;
