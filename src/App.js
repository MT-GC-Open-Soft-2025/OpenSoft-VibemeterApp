import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Loginpage/LoginPage';
import AdminPage from './pages/AdminPage/AdminPage';
<<<<<<< HEAD
import Performance from './components/Performance';
=======
import Navbar from './components/navbar';

import FeedbackPage from "./pages/Feedbackpage/Feedbackpage";
import Sidebar from './components/sidebar';

import UserPage from './pages/UserPage/UserPage';

>>>>>>> b503b3e1a7dd50bc4c46b5ee1f310d0721fbd54b
  
import Rewards from './components/Rewards';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
<<<<<<< HEAD
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/performance" element={<Performance />} />
=======
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
        <Route path="/user" element={<UserPage />} />
        <Route path="/feedback" element={
            <FeedbackPage />
          }/>
>>>>>>> b503b3e1a7dd50bc4c46b5ee1f310d0721fbd54b
      </Routes>
    </Router>
  );
}

export default App;

