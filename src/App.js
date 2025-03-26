import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Loginpage/LoginPage';
import AdminPage from './pages/AdminPage/AdminPage';
import FeedbackPage from "./pages/Feedbackpage/Feedbackpage";

import UserPage from './pages/UserPage/UserPage';

import 'bootstrap/dist/css/bootstrap.min.css';

  
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/feedback" element={<FeedbackPage />}/>
       
        <Route path="/user" element={<UserPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;

