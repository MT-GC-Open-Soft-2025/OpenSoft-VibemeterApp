import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feedbackpage.css';
import Feedbacknavbar from '../../components/Feedback_navbar/Feedbacknavbar'; // Update the path
// Importing FeedbackNavbar component

const FeedbackPage = () => {
  const navigate = useNavigate();
 
  // Array of conversation IDs and corresponding feedback and summary messages
  const conversations = [
    { id: 'CONV001', feedback: 'Great assistance provided.', summary: 'Helped with account setup.' },
    { id: 'CONV002', feedback: 'Quick response time.', summary: 'Resolved payment issue promptly.' },
    { id: 'CONV003', feedback: 'Very helpful and polite.', summary: 'Guided through profile update.' },
    { id: 'CONV004', feedback: 'Accurate solutions.', summary: 'Solved technical glitch.' },
    { id: 'CONV005', feedback: 'Professional and patient.', summary: 'Clarified subscription plans.' },
    { id: 'CONV006', feedback: 'Friendly interaction.', summary: 'Assisted with feedback submission.' },
    { id: 'CONV007', feedback: 'Helpful guidance.', summary: 'Explained account recovery steps.' },
    { id: 'CONV008', feedback: 'Fast and efficient.', summary: 'Resolved login issues.' },
    { id: 'CONV009', feedback: 'Clear instructions.', summary: 'Walked through feature usage.' },
    { id: 'CONV010', feedback: 'Positive experience.', summary: 'Resolved billing queries.' }
  ];

  // Pagination state
  const messagesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState('Please select a conversation ID.');
  const [selectedSummary, setSelectedSummary] = useState('Please select a conversation ID.');
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Pagination controls
  const totalPages = Math.ceil(conversations.length / messagesPerPage);
  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };
  const handlePrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  // Handle click on conversation ID
  const handleConversationClick = (feedback, summary, index) => {
    setSelectedFeedback(feedback);
    setSelectedSummary(summary);
    setSelectedIndex(index);
  };

  // Slice conversations based on the current page
  const currentConversations = conversations.slice(
    currentPage * messagesPerPage,
    (currentPage + 1) * messagesPerPage
  );

  return (
    <div className='feedback-wrapper'>
      {/* Feedback Navbar */}
      <Feedbacknavbar title="" />


      <div className='feedback-container'>
        <div className='feedback-section'>
          <h2>Conversation ID</h2>
          <div className='conversation'>
            {currentConversations.map((conv, index) => (
              <div
                key={conv.id}
                className={`bubble ${selectedIndex === index + currentPage * messagesPerPage ? 'selected' : ''}`}
                onClick={() => handleConversationClick(conv.feedback, conv.summary, index + currentPage * messagesPerPage)}
              >
                {conv.id}
              </div>
            ))}
          </div>
          {conversations.length > messagesPerPage && (
            <div className='pagination'>
              <button onClick={handlePrevious} disabled={currentPage === 0} className='page-btn'>Previous</button>
              <button onClick={handleNext} disabled={currentPage === totalPages - 1} className='page-btn'>Next</button>
            </div>
          )}
        </div>

        <div className='feedback-section'>
          <h2>Feedback</h2>
          <p>{selectedFeedback}</p>
        </div>

        <div className='feedback-section'>
          <h2>Summary</h2>
          <p>{selectedSummary}</p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;

















