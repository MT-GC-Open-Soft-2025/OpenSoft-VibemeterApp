import React, { useState } from "react";
import "./Feedbackpage.css";

const Feedback = () => {
  // Array of messages for dynamic bubbles
  const messages = [
    "Hello, how can I assist you?",
    "I need help with feedback submission.",
    "Sure, let me guide you through.",
    "Thank you!",
    "You're welcome!",
    "Is there anything else I can help with?",
    "Yes, just one more thing.",
    "Got it. Go ahead.",
    "Thanks a lot!",
    "No problem!"
  ];

  // Pagination state
  const messagesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(0);

  // Pagination controls
  const totalPages = Math.ceil(messages.length / messagesPerPage);
  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };
  const handlePrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  // Slice messages based on the current page
  const currentMessages = messages.slice(
    currentPage * messagesPerPage,
    (currentPage + 1) * messagesPerPage
  );

  return (
    <div className="feedback-wrapper">
      <div className="feedback-container">
        {/* Section 1: Conversation ID */}
        <div className="feedback-section">
          <h2>Conversation ID</h2>
          <div className="conversation">
            {currentMessages.map((message, index) => (
              <div key={index} className="bubble" style={{ backgroundColor: "#cccccc" }}>
                {message}
              </div>
            ))}
          </div>
          {messages.length > messagesPerPage && (
            <div className="pagination">
              <button onClick={handlePrevious} disabled={currentPage === 0} className="page-btn">
                Previous
              </button>
              <button onClick={handleNext} disabled={currentPage === totalPages - 1} className="page-btn">
                Next
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Feedback */}
        <div className="feedback-section">
          <h2>Feedback</h2>
          <ul>
            <li>Great assistance!</li>
            <li>Quick response time.</li>
            <li>Very helpful and polite.</li>
          </ul>
        </div>

        {/* Section 3: Summary */}
        <div className="feedback-section">
          <h2>Summary</h2>
          <p>Feedback submission successful. Thank you for your valuable input!</p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;






