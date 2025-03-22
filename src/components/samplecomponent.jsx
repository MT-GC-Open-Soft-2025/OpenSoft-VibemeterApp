import React from "react";

const Button = ({ children, onClick, variant = "primary", disabled = false, className = "" }) => {
  const baseStyles = "btn";
  const variants = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    outline: "btn btn-outline-secondary",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? "disabled" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
