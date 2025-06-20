// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./Badges.css";

// import badge1 from "../../Assets/badge1.png";
// import badge2 from "../../Assets/badge2.png";
// import badge3 from "../../Assets/badge3.png";
// import badge4 from "../../Assets/badge4.png";

// export default function Badges({ employeeId }) {
//   const [awardList, setAwardList] = useState([]);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!employeeId) return;

//     const fetchAwards = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         // const empId = localStorage.getItem("empId");

//         if (!token) throw new Error("No authentication token found. Please log in.");
//         // if (!empId) throw new Error("Login info not found. Please log in again.");

//         const endpoint =
//         employeeId === "admin"
//             ? `http://127.0.0.1:8000/admin/get_detail/${employeeId}`
//             : `http://127.0.0.1:8000/user/getUserDetails`;

//         const response = await axios.get(endpoint, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         console.log("Badges API Response:", response.data);
//         setAwardList(response.data.user_record.award_list || []);
//         setError("");
//       } catch (err) {
//         console.error("Error fetching badges:", err.message);
//         setError(err.message);
//         setAwardList([]);
//       }
//     };

//     fetchAwards();
//   }, [employeeId]);

//   if (!employeeId) return <div className="no-badges">No employee selected</div>;
//   if (error) return <div className="alert alert-danger">{error}</div>;
//   if (awardList.length === 0) return <div className="no-badges">No awards earned</div>;

//   const awardBadgeMap = {
//     "Innovation Award": badge1,
//     "Leadership Excellence": badge2,
//     "Best Team Player": badge3,
//     "Star Performer": badge4,
//   };

//   return (
//     <div className="badges-container container mt-4">
//       <div className="employee-awards">
//         {awardList.map((award, i) => (
//           <div key={i} className="badge-img-container">
//             <img
//               src={awardBadgeMap[award] || ""}
//               alt={award}
//               className="badge-img"
//             />
//             <span className="badge-tooltip">{award}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Badges.css";
import baseUrl from "../../Config";

import badge1 from "../../Assets/badge1.png";
import badge2 from "../../Assets/badge2.png";
import badge3 from "../../Assets/badge3.png";
import badge4 from "../../Assets/badge4.png";

export default function Badges({ employeeId }) {
  const [awardList, setAwardList] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employeeId) return;
  
    const fetchAwards = async () => {
      try {
        const token = localStorage.getItem("token");
        const empId = localStorage.getItem("empId"); 
  
        if (!token) throw new Error("No authentication token found. Please log in.");
        if (!empId) throw new Error("Login info not found. Please log in again.");
  
        const endpoint =
          empId === "admin"
            ? `https://api.wellbee.live/admin/get_detail/${employeeId}`
            : `https://api.wellbee.live/user/getUserDetails`;
  
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const awardList =
          empId === "admin"
            ? response.data.user_record.award_list || []
            : response.data.award_list || [];
  
        console.log("Badges API Response:", response.data);
        setAwardList(awardList);
        setError("");
      } catch (err) {
        console.error("Error fetching badges:", err.message);
        setError(err.message);
        setAwardList([]);
      }
    };
  
    fetchAwards();
  }, [employeeId]);
  

  if (!employeeId) return <div className="no-badges">No employee selected</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (awardList.length === 0) return <div className="no-badges">No awards earned</div>;

  const awardBadgeMap = {
    "Innovation Award": badge1,
    "Leadership Excellence": badge2,
    "Best Team Player": badge3,
    "Star Performer": badge4,
  };

  return (
    <div className="badges-container container mt-4">
      <div className="employee-awards">
        {awardList.map((award, i) => (
          <div key={i} className="badge-img-container">
            <img
              src={awardBadgeMap[award] || ""}
              alt={award}
              className="badge-img"
            />
            <span className="badge-tooltip">{award}</span>
          </div>
        ))}
      </div>
    </div>
  );
}