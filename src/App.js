import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Loginpage/LoginPage';
import AdminPage from './pages/AdminPage/AdminPage';
import Performance from './components/Admin_page _components/Admin_performance_rewards/Performance';
import Rewards from './components/Admin_page _components/Admin_performance_rewards/Rewards';
import Badges from "./components/Badges/Badges";
import FeedbackPage from "./pages/Feedbackpage/Feedbackpage";
import UserPage from './pages/UserPage/UserPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/feedback" element={
  <>
    
    <FeedbackPage />
  </>
} />

       
      </Routes>
    </Router>
  );
}

export default App;
