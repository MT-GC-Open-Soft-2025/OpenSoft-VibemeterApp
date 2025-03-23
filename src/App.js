import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Loginpage/LoginPage';
import AdminPage from './pages/AdminPage/AdminPage';
import Navbar from './components/navbar';

import FeedbackPage from "./pages/Feedbackpage/Feedbackpage";
import Sidebar from './components/sidebar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/feedback" element={<FeedbackPage />}/>
        <Route path="/admin" element={
          <>
            <Navbar />
            <Sidebar />
            
            <div style={{ 
              marginLeft: '200px', 
              marginTop: '64px',
              backgroundColor: 'white',
              minHeight: '100vh',
              padding: '20px'
            }}>
              <AdminPage />
            </div>
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;

