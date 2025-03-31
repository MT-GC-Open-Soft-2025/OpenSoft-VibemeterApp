import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Feedbackpage.css';
import Feedbacknavbar from '../../components/Feedback_navbar/Feedbacknavbar'; // Update the path
// Importing FeedbackNavbar component

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const messagesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState('Please select a conversation ID.');
  const [selectedSummary, setSelectedSummary] = useState('Please select a conversation ID.');
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Fetch feedback data from the backend
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/admin/get_conversationFeedback/{emp_id}/{convo_id}");
        setConversations(response.data); 
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(conversations.length / messagesPerPage);
  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };
  const handlePrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  // Handle selection
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
      <Feedbacknavbar title="Admin Feedback" />

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
