import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Start from './pages/Loginpage/Start';
import AdminPage from './pages/AdminPage/AdminPage';
import FeedbackPage from "./pages/Feedbackpage/Feedbackpage"; // Old layout (if needed)
import SurveyForm from './pages/SurveyForm/SurveyForm';           // New renamed form
import UserPage from './pages/UserPage/UserPage';
import ContactForm from './pages/ContactPage/ContactForm'; 
import { useEffect } from 'react';
import {Link, Element } from 'react-scroll';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Chat from './components/chat_popup/chat';
import LoginPage from './pages/Loginpage/LoginPage';


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
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user" element={<UserPage />} />
        {/* Route for the new single-form survey */}
        <Route path="/surveyform" element={<SurveyForm />} />
        {/* The old three-column layout remains on a different route (if still needed) */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/contact" element={<ContactForm />} /> {/* New Contact Page */}

      </Routes>
    </Router>
  );
};

export default App;