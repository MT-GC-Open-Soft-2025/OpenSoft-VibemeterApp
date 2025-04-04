// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";

// // Function to determine emoji and styling
// const getEmojiByValue = (value) => {
//   switch (value) {
//     case 1: return <span className="display-1 text-danger">😭</span>; // Very Bad
//     case 2: return <span className="display-1 text-danger">😢</span>; // Bad
//     case 3: return <span className="display-1 text-warning">🙁</span>; // Not Good
//     case 4: return <span className="display-1 text-warning">😐</span>; // Average
//     case 5: return <span className="display-1 text-success">🙂</span>; // Happy
//     case 6: return <span className="display-1 text-success">😊</span>; // Very Happy
//     default: return <span className="display-1 text-secondary">❓</span>; // Unknown
//   }
// };

// // Function to get mood text
// const getTextByValue = (value) => {
//   switch (value) {
//     case 1: return "Very Bad";
//     case 2: return "Bad";
//     case 3: return "Not Good";
//     case 4: return "Average";
//     case 5: return "Happy";
//     case 6: return "Very Happy";
//     default: return "Invalid";
//   }
// };

// export default function EmojiMeter({ employeeId }) {
//   const [vibeScore, setVibeScore] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchVibeScore = async () => {
//       if (!employeeId) {
//         console.warn("No employee ID provided.");
//         setError("Employee ID is missing!");
//         return;
//       }

//       console.log(`Fetching vibe score for Employee ID: ${employeeId}`);

//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           throw new Error("No authentication token found. Please log in.");
//         }

//         const response = await axios.get(
//           `http://127.0.0.1:8000/admin/get_detail/${employeeId}`,  
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         console.log("Full API Response:", response.data);

//         if (!response.data || typeof response.data.user_record.vibe_score === "undefined") {
//           throw new Error("vibe_score not found in API response!");
//         }

//         let score = response.data.vibe_score;

        
//         if (score === -1) score = 1; // Very Bad
//         else if (score === 0) score = 2; // Bad
//         else if (score === 1) score = 3; // Not Good
//         else if (score === 2) score = 4; // Average
//         else if ([3, 4, 5].includes(score)) score = 5; // Happy
//         else score = 6; // Very Happy

//         setVibeScore(score);
//         setError(""); // Clear any previous error
//       } catch (error) {
//         console.error("Error fetching vibe score:", error.message);
//         setError(error.message);
//         setVibeScore(null);
//       }
//     };

//     fetchVibeScore();
//   }, [employeeId]);

//   return (
//     <div className="container d-flex justify-content-center align-items-center py-5 container-emoji">
//       <div className="card text-center shadow-lg p-4" style={{ width: "22rem" }}>
//         <div className="card-header bg-primary text-white">
//           <h4>Emoji Mood Meter</h4>
//         </div>
//         <div className="card-body">
//           {error ? (
//             <p className="text-danger">Error: {error}</p>
//           ) : vibeScore !== null ? (
//             <>
//               {getEmojiByValue(vibeScore)}
//               <h5 className="mt-3">{getTextByValue(vibeScore)}</h5>
//               <p className="text-muted">Vibe Score: <strong>{vibeScore}</strong></p>
//             </>
//           ) : (
//             <p>Loading...</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useEffect, useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { useNavigate } from "react-router-dom";
// import userImg from "../../Assets/user.png";
// import Chat from "../../components/chat_popup/chat.jsx";
// import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar.jsx";
// import Sidebar from "../../components/Admin_page _components/Admin_sidebar/Adminpagesidebar";
// import Badges from "../../components/Badges/Badges";
// import EmojiMeter from "../AdminPage/EmojiMeter.jsx";
// import Image from "../../Assets/image.png";
// import Swal from "sweetalert2";
// import animationData from "../../Assets/Newanimation.json"; // Bot animation
// import Lottie from "lottie-react";
// import { Link } from "react-router-dom";
// import Footer from "../../components/Footer/Footer.jsx";

// const getEmojiByValue = (value) => {
//   useEffect(() => {
//       const token = localStorage.getItem("token");
//       if (!token) return;
  
//       fetch("http://localhost:8000/user/getUserDetails", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//         .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch")))
//         .then(setUser)
//         .catch(console.error);
//     }, []);
//     const truncatedVibeScore = user ? user.vibe_score.toFixed(2) : 0;

//     if (!user) return <div className="p-4">Loading...</div>;
//     const getMood = () => {
//       if (truncatedVibeScore >= 4.5)
//         return { icon: "bi-emoji-smile-fill", text: "Happy", color: "success" };
//       if (truncatedVibeScore >= 3)
//         return {
//           icon: "bi-emoji-neutral-fill",
//           text: "Neutral",
//           color: "primary",
//         };
  
//       if (truncatedVibeScore < 3 && truncatedVibeScore >= 0)
//         return {
//           icon: "bi-emoji-frown-fill",
//           text: "Sad",
//           color: "danger",
//         };
//       return {
//         icon: "bi-emoji-neutral-fill",
//         text: "Neutral",
//         color: "primary",
//       };
//     };
//     const radius = 90;
//     const circumference = 2 * Math.PI * radius;
// }