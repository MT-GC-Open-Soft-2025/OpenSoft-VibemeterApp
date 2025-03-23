import React, { useState } from 'react';
import './chat.css';
import Lottie from "lottie-react";
import animationData from "../../Assets/animation.json";

const Chat = ({ onClose }) => {
  // Example conversations with IDs and corresponding chat details
  const conversations = [
    { id: 'CHAT001', message: 'Hello, how can I help you today?', details: 'Details for CHAT001.' },
    { id: 'CHAT002', message: 'I have an issue with my account.', details: 'Details for CHAT002.' },
    { id: 'CHAT003', message: 'Can you assist me with billing?', details: 'Details for CHAT003.' },
    { id: 'CHAT004', message: 'Thank you for your help!', details: 'Details for CHAT004.' },
    { id: 'CHAT005', message: 'What are your operating hours?', details: 'Details for CHAT005.' },
    { id: 'CHAT006', message: 'I need further assistance.', details: 'Details for CHAT006.' },
    { id: 'CHAT007', message: 'Can you escalate my issue?', details: 'Details for CHAT007.' },
    { id: 'CHAT008', message: 'I want to know more about your services.', details: 'Details for CHAT008.' },
    { id: 'CHAT009', message: 'Goodbye!', details: 'Details for CHAT009.' },
    { id: 'CHAT010', message: 'Thank you again!', details: 'Details for CHAT010.' },
  ];

  const messagesPerPage = 5;
  const totalPages = Math.ceil(conversations.length / messagesPerPage);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState('Please select a chat.');
  const [selectedDetails, setSelectedDetails] = useState('Please select a chat.');
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleConversationClick = (message, details, index) => {
    setSelectedMessage(message);
    setSelectedDetails(details);
    setSelectedIndex(index);
  };

  // Slice conversations for the current page
  const currentConversations = conversations.slice(
    currentPage * messagesPerPage,
    (currentPage + 1) * messagesPerPage
  );

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-window" onClick={(e) => e.stopPropagation()}>
        <span className="chat-close" onClick={onClose}>&times;</span>
        <div className="chat-container">
          {/* Left Partition: Chat Buttons & Pagination */}
          <div className="chat-left">
            <h2>Chats</h2>
            <div className="conversation">
              {currentConversations.map((conv, index) => (
                <div
                  key={conv.id}
                  className={`bubble ${selectedIndex === index + currentPage * messagesPerPage ? 'selected' : ''}`}
                  onClick={() => handleConversationClick(conv.message, conv.details, index + currentPage * messagesPerPage)}
                >
                  {conv.id}
                </div>
              ))}
            </div>
            {conversations.length > messagesPerPage && (
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

          {/* Right Partition: Animation & Start Chat Button */}
          <div className="chat-right">
            <div className="chat-right-content">
              <div className="animation-container">
                <Lottie animationData={animationData} loop={true} />
              </div>
              <button className="start-chat-btn">Start Chat!</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
