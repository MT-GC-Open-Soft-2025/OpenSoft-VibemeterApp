import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap

// Function to determine emoji and styling
const getEmojiByValue = (value) => {
  if (value <= 3) {
    return <span className="display-1 text-danger">😞</span>; // Sad Face (Red)
  } else if (value <= 6) {
    return <span className="display-1 text-warning">😐</span>; // Neutral (Amber)
  } else if (value <= 8) {
    return <span className="display-1 text-success">😊</span>; // Smile (Green)
  } else {
    return <span className="display-1 text-primary">😁</span>; // Big Smile (Blue)
  }
};

// Function to determine mood text
const getTextByValue = (value) => {
  if (value <= 3) return "Not Good";
  else if (value <= 6) return "Average";
  else if (value <= 8) return "Good";
  else return "Excellent!";
};

export default function EmojiMeter() {
  const [value, setValue] = useState(5);

  const generateRandomValue = () => {
    const newValue = Math.floor(Math.random() * 10) + 1;
    setValue(newValue);
  };

  useEffect(() => {
    generateRandomValue();
  }, []);

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card text-center shadow-lg p-4" style={{ width: "22rem" }}>
        <div className="card-header bg-primary text-white">
          <h4>Emoji Mood Meter</h4>
        </div>
        <div className="card-body">
          {getEmojiByValue(value)}
          <h5 className="mt-3">{getTextByValue(value)}</h5>
          <p className="text-muted">Mood Value: <strong>{value}</strong></p>
          <button className="btn btn-primary" onClick={generateRandomValue}>
            Generate Random Mood
          </button>
        </div>
      </div>
    </div>
  );
}

