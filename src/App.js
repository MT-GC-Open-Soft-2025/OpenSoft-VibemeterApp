// // import React from 'react';
// // import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// // import LoginPage from './pages/Loginpage/LoginPage';
// // import AdminPage from './pages/AdminPage/AdminPage';
// // import Navbar from './components/navbar';

// // import FeedbackPage from "./pages/Feedbackpage/Feedbackpage";

// // function App() {
// //   return (
    
// //     <Router>
// //       <Routes>
// //         <Route path="/" element={<LoginPage />} />
// //         <Route path="/admin" element={ 
// //           <><Navbar />
// //           <AdminPage /></>
// //           } />
// //           <Route path="/feedback" element={
// //             <FeedbackPage />
// //           }/>
// //       </Routes>
// //     </Router>
// //   );
// // }

// // export default App;

// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LoginPage from "./pages/Loginpage/LoginPage";
// import AdminPage from "./pages/AdminPage/AdminPage";
// import FeedbackPage from "./pages/Feedbackpage/Feedbackpage";
// import Navbar from "./components/navbar";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Login Page - Default Route */}
//         <Route path="/" element={<LoginPage />} />

//         {/* Admin Page with Navbar */}
//         <Route path="/admin" element={
//           <>
//             <Navbar />
//             <AdminPage />
//           </>
//         } />

//         {/* Feedback Page (No Navbar) */}
//         <Route path="/feedback" element={<FeedbackPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard"; // ✅ Ensure this is included
import LoginPage from "./pages/Loginpage/LoginPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import FeedbackPage from "./pages/Feedbackpage/Feedbackpage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<Dashboard />} /> {/* ✅ Ensure Dashboard is loaded */}
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
