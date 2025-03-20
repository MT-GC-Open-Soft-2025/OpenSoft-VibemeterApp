import React from "react";
import { useNavigate } from "react-router-dom";

const ButtonComponent = ({ label }) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/feedback");
  };

  return (
    <button
      className="btn btn-success fadeIn fourth"
      onClick={handleButtonClick}
      style={{ margin: "10px" }}
    >
      {label}
    </button>
  );
};

export default ButtonComponent;

