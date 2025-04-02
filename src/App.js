import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Start from './pages/Loginpage/Start';
import LoginPage from './pages/Loginpage/LoginPage';
import LandingPage from './pages/Loginpage/LandingPage';
import AdminPage from './pages/AdminPage/AdminPage';
import FeedbackPage from "./pages/Feedbackpage/Feedbackpage"; // Old layout (if needed)
import SurveyForm from './pages/SurveyForm/SurveyForm';           // New renamed form
import UserPage from './pages/UserPage/UserPage';
import ContactForm from './pages/ContactPage/ContactForm'; 
import { useEffect } from 'react';
import {Link, Element } from 'react-scroll';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import 'animate.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
    });
  }, []);


  return (
    <div>
      {/* <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
              <div className="container">
                <a className="navbar-brand fw-bold" href="#">MindWell</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                  <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                  <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                      <Link className="nav-link" to="landing" smooth duration={500}>Home</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="login" smooth duration={500}>Sign In</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="faq" smooth duration={500}>FAQ</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="book-demo" smooth duration={500}>Book a Demo</Link>
                    </li>
      
                    <li className="nav-item">
                      <Link className="nav-link" to="footer" smooth duration={500}>Footer</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav> */}
            


      <Router>
        <Routes>
          <Route path="/" element={<Start/>} />
          <Route path="/login" element={<Start />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/surveyform" element={<SurveyForm />} />
          <Route path="/contact" element={<ContactForm />} /> {/* New Contact Page */}
        </Routes>
      </Router>
    </div>
  );
};

export default App;