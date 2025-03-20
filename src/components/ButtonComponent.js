import React from "react";

const ButtonComponent = ({ label, onClick }) => {
  return (
    <button
      className="btn btn-success fadeIn fourth"
      onClick={onClick}
      style={{ margin: "10px" }}
    >
      {label}
    </button>
  );
};

export default ButtonComponent;
