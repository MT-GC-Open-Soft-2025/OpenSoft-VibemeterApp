import React from "react";
import "./Feedbackpage.css";

const Feedback = () => {
  return (
    <div className="feedback-container">
      {/* Section 1: Feedback Form */}
      <div className="feedback-section">
        <h2>Feedback Form</h2>
        <form>
          <input
            type="text"
            placeholder="Your Name"
            className="feedback-input"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="feedback-input"
          />
          <textarea
            placeholder="Your Feedback"
            className="feedback-textarea"
          ></textarea>
          <button type="submit" className="feedback-button">Submit</button>
        </form>
      </div>

      {/* Section 2: Recent Feedback */}
      <div className="feedback-section">
        <h2>Recent Feedback</h2>
        <ul>
          <li>Great experience with the service!</li>
          <li>Suggestions to improve the UI.</li>
          <li>Loved the new features!</li>
        </ul>
      </div>

      {/* Section 3: Contact Us */}
      <div className="feedback-section">
        <h2>Contact Us</h2>
        <p>Email: support@company.com</p>
        <p>Phone: +1 (123) 456-7890</p>
        <p>Address: 1234 Feedback St, City, Country</p>
      </div>
    </div>
  );
};

export default Feedback;
