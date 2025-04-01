import React, { useEffect } from 'react';
import { Element, scroller } from 'react-scroll';
import { Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LandingPage.css';
import LoginPage from './LoginPage';
import { useNavigate } from 'react-router-dom';

// ✅ Initialize animations on mount
const LandingPage = () => {
  const navigate = useNavigate();

  // Smooth scroll to login section
  const scrollToLogin = () => {
    scroller.scrollTo("loginSection", {
      duration: 800,
      delay: 0,
      smooth: "easeInOutQuart",
      offset: -50, // Adjust if needed
    });
  };

  return (
    <div>
      {/* 🌟 Landing Section */}
      <Element name="landing" className="section bg-white text-center">
        <div className="container py-5">
          {/* 🎉 Hero Section */}
          <div className="mb-5 fade show">
            <h1 className="display-4 fw-bold text-primary">Welcome to MindWell</h1>
            <p className="lead text-muted">
              Your mental well-being companion — guided support, self-care, and motivation.
            </p>
            <a href="#fitness" className="btn btn-outline-primary mt-3">Explore Mental Fitness</a>
          </div>

          {/* 🤖 Chatbot Section */}
          <div className="row align-items-center my-5 fade show">
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
                Your friendly mental wellness chatbot, always here to talk, check in,
                and help guide you through daily ups and downs.
              </p>
              <button className="btn btn-primary mt-2" onClick={scrollToLogin}>
                Start Chatting
              </button>
            </div>
          </div>

          {/* 💙 Mental Fitness Section */}
          <div id="fitness" className="row align-items-center my-5 fade show">
            <div className="col-md-6 order-md-2">
              <img
                src="https://img.freepik.com/free-vector/mindfulness-concept-illustration_114360-8101.jpg"
                alt="Mental Fitness"
                className="img-fluid rounded shadow"
              />
            </div>
            <div className="col-md-6 order-md-1 text-start">
              <h2 className="fw-semibold text-info">Mental Fitness Routines 💙</h2>
              <p className="text-muted">
                Short guided routines to boost emotional resilience, calm anxiety, and improve sleep — tailored just for you.
              </p>
              <button className="btn btn-info text-white mt-2" onClick={scrollToLogin}>
                Try a Session
              </button>
            </div>
          </div>
        </div>
      </Element>

      {/* 🔑 Login Section (With Bootstrap Animation) */}
      <Element name="loginSection" className="container py-5 fade show">
        <h2 className="text-center text-primary">Login to MindWell</h2>
        <LoginPage />
      </Element>

      {/* ❓ FAQ Section (With Bootstrap Animation) */}
      <Element name="faq" className="faq-section text-center fade show">
        <div className="container py-5">
          <div className="row align-items-center">
            {/* Illustration */}
            <div className="col-md-6 mb-4 mb-md-0 fade show">
              <img
                src="https://img.freepik.com/free-vector/faq-concept-illustration_114360-5185.jpg"
                alt="FAQ Illustration"
                className="img-fluid"
                style={{ maxHeight: '350px' }}
              />
            </div>

            {/* FAQ Content */}
            <div className="col-md-6 text-start fade show">
              <h2 className="text-primary fw-bold mb-4">Frequently Asked Questions 🙋‍♀️</h2>
              <Accordion defaultActiveKey="0" flush>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>What is MindWell?</Accordion.Header>
                  <Accordion.Body>
                    MindWell is your mental health companion. We provide tools to improve mood,
                    reduce anxiety, and build emotional resilience through guided sessions and support.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>Is it free to use?</Accordion.Header>
                  <Accordion.Body>
                    Yes! MindWell offers a wide range of free resources. Some premium features may require a subscription.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                  <Accordion.Header>How does the chatbot work?</Accordion.Header>
                  <Accordion.Body>
                    Our AI-powered MindBot offers emotional support, check-ins, and wellness reminders through a chat interface.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                  <Accordion.Header>Can I talk to a real therapist?</Accordion.Header>
                  <Accordion.Body>
                    While MindWell doesn't offer therapy, we connect you with verified resources if you need professional help.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </div>
        </div>
      </Element>

      {/*  Footer */}
      <footer className="footer text-center p-3">
        <p>© 2025 MyCompany. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
