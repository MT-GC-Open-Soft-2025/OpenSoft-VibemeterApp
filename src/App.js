// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LoginPage from './pages/Loginpage/LoginPage';
// import AdminPage from './pages/AdminPage/AdminPage';


// import FeedbackPage from "./pages/Feedbackpage/Feedbackpage";

// import UserPage from './pages/UserPage/UserPage';

  
// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/admin" element={ 
//           <>
//           <AdminPage /></>
//           } />
//            <Route path="/user" element={<UserPage />} />
//           <Route path="/feedback" element={
//             <FeedbackPage />
//           }/>
//       </Routes>
//     </Router>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Loginpage/LoginPage';
import AdminPage from './pages/AdminPage/AdminPage';
import FeedbackPage from "./pages/Feedbackpage/Feedbackpage"; // Old layout (if needed)
import SurveyForm from './pages/SurveyForm/SurveyForm';           // New renamed form
import UserPage from './pages/UserPage/UserPage';
import ContactForm from './pages/ContactPage/ContactForm'; // Import Contact Form
import 'bootstrap/dist/css/bootstrap.min.css';

import Chat from './components/chat_popup/chat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
}

export default App;


