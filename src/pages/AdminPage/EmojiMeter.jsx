import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap
// import "./EmojiMeter.css";


// Function to determine emoji and styling
const getEmojiByValue = (value) => {
  switch (value) {
    case 1:
      return <span className="display-1 text-danger">😭</span>; // Crying Face (Red)
    case 2:
      return <span className="display-1 text-danger">😢</span>; // Sad Face with Tear (Red)
    case 3:
      return <span className="display-1 text-warning">🙁</span>; // Slightly Frowning Face (Amber)
    case 4:
      return <span className="display-1 text-warning">😐</span>; // Neutral Face (Amber)
    case 5:
      return <span className="display-1 text-success">🙂</span>; // Slightly Smiling Face (Green)
    case 6:
      return <span className="display-1 text-success">😊</span>; // Smiling Face (Green)
    default:
      return <span className="display-1 text-secondary">❓</span>; // Unknown (Gray)
  }
};


// Function to determine mood text
const getTextByValue = (value) => {
  switch (value) {
    case 1: return "Very Bad";
    case 2: return "Bad";
    case 3: return "Not Good";
    case 4: return "Average";
    case 5: return "Happy";
    case 6: return "Very Happy";
    default: return "Invalid";
  }
};

export default function EmojiMeter() {
  const [value, setValue] = useState(5);

  const generateRandomValue = () => {
    const newValue = Math.floor(Math.random() * 6) + 1; // Generates a number between 1 and 6
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

