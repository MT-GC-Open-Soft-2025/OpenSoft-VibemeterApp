import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Badges.css";
import { getEmployeeDetail } from "../../api/admin";
import { getUserDetails } from "../../api/user";

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
        const empId = localStorage.getItem("empId");
        let awards = [];

        if (empId === "admin") {
          const response = await getEmployeeDetail(employeeId);
          awards = response.user_record?.award_list || [];
        } else {
          const response = await getUserDetails();
          awards = response.award_list || [];
        }

        setAwardList(awards);
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
            <img src={awardBadgeMap[award] || ""} alt={award} className="badge-img" />
            <span className="badge-tooltip">{award}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
