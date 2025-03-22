import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Loginpage/LoginPage';
import AdminPage from './pages/AdminPage/AdminPage';
import Navbar from './components/navbar';
  
import Feedback from "./pages/Feedbackpage/Feedbackpage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={ 
          <><Navbar />
          <AdminPage /></>
          } />
      </Routes>
    </Router>
  );
}

export default App;

