import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Loginpage/LoginPage';
import AdminPage from './pages/AdminPage/AdminPage';
import FeedbackPage from "./pages/Feedbackpage/Feedbackpage"; // Old layout (if needed)
import SurveyForm from './pages/SurveyForm/SurveyForm';           // New renamed form
import UserPage from './pages/UserPage/UserPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user" element={<UserPage />} />
        {/* Route for the new single-form survey */}
        <Route path="/feedback" element={<SurveyForm />} />
        {/* The old three-column layout remains on a different route (if still needed) */}
        <Route path="/chat-feedback" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
