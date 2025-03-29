import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Badges.css";

import badge1 from "../../Assets/badge1.png";
import badge2 from "../../Assets/badge2.png";
import badge3 from "../../Assets/badge3.png";
import badge4 from "../../Assets/badge4.png";

export default function Badges() {
  const awardBadgeMap = {
    "Innovation Award": badge1,
    "Leadership Excellence": badge2,
    "Best Team Player": badge3,
    "Star Performer": badge4,
  };

  const employees = [
    {
      name: "Alice",
      awards: ["Innovation Award", "Leadership Excellence"],
    },
    {
      name: "Bob",
      awards: ["Star Performer"],
    },
    {
      name: "Charlie",
      awards: ["Best Team Player", "Innovation Award"],
    },
    {
      name: "David",
      awards: ["Leadership Excellence", "Best Team Player", "Star Performer"],
    },
    {
      name: "Eve",
      awards: ["Best Team Player"],
    },
    {
      name: "Frank",
      awards: ["Innovation Award", "Leadership Excellence"],
    },
    {
      name: "Grace",
      awards: ["Star Performer"],
    },
    {
      name: "Hannah",
      awards: ["Best Team Player", "Innovation Award"],
    },
    {
      name: "Ivan",
      awards: [
        "Leadership Excellence",
        "Best Team Player",
        "Star Performer",
      ],
    },
    {
      name: "Judy",
      awards: ["Best Team Player"],
    },
  ];

  // Get only Alice's data
  const alice = employees.find((emp) => emp.name === "Alice");

  return (
    <div className="badges-container container mt-4">
      {alice && (
        <div className="employee-section mb-4">
          <div className="employee-awards">
            {alice.awards.map((award, i) => (
              <div key={i} className="badge-img-container">
                <img
                  src={awardBadgeMap[award]}
                  alt="Award Badge"
                  className="badge-img"
                />
                <span className="badge-tooltip">{award}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
