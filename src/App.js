import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Loginpage/LoginPage';
import AdminPage from './pages/AdminPage/AdminPage';


import FeedbackPage from "./pages/Feedbackpage/Feedbackpage";

import UserPage from './pages/UserPage/UserPage';

  
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={ 
          <>
          <AdminPage /></>
          } />
           <Route path="/user" element={<UserPage />} />
          <Route path="/feedback" element={
            <FeedbackPage />
          }/>
      </Routes>
    </Router>
  );
}

export default App;
