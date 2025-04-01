import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Badges.css";

import badge1 from "../../Assets/badge1.png";
import badge2 from "../../Assets/badge2.png";
import badge3 from "../../Assets/badge3.png";
import badge4 from "../../Assets/badge4.png";

export default function Badges({ employeeData }) {
  console.log("Employee Data in Badges:", employeeData); // ✅ Debugging Log
  if (!employeeData || !employeeData.award_list || employeeData.award_list.length === 0) {
    return <div className="no-badges">No awards earned</div>;
  }

  const awardBadgeMap = {
    "Innovation Award": badge1,
    "Leadership Excellence": badge2,
    "Best Team Player": badge3,
    "Star Performer": badge4,
  };

  return (
    <div className="badges-container container mt-4">
      <div className="employee-awards">
        {employeeData.award_list.map((award, i) => (
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
