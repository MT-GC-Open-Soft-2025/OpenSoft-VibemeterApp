import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './chat.css';
import Lottie from "lottie-react";
import animationData from "../../Assets/animation.json";
import photo from "../../Assets/send.png"; // Adjust path if needed
import bcrypt from 'bcryptjs'; // Import bcryptjs for hashing

const Chat = () => {
  const navigate = useNavigate();

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

  const messagesPerPage = 7;
  const totalPages = Math.ceil(conversations.length / messagesPerPage);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState('Please select a chat.');
  const [selectedDetails, setSelectedDetails] = useState('Please select a chat.');
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [chatStarted, setChatStarted] = useState(false);
  const [conversationId, setConversationId] = useState('');

  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const chatHistoryRef = useRef(null);

  // Function to handle closing the chat and navigating back to /user
  const handleCloseChat = () => {
    setChatStarted(false);
    setChatMessages([]);
    setInputValue('');
    navigate("/user");
  };

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

  const currentConversations = conversations.slice(
    currentPage * messagesPerPage,
    (currentPage + 1) * messagesPerPage
  );

  const handleStartChat = () => {
    const rawId = `CHAT-${Date.now()}-${Math.random()}`;
    const uniqueId = bcrypt.hashSync(rawId, 10);
    setConversationId(uniqueId);
    console.log("Unique conversation ID:", uniqueId);
    setChatStarted(true);

    setChatMessages([
      { sender: 'bot', text: 'Hello! How can I help you today?' }
    ]);
  };

  const handleEndChat = () => {
    setChatStarted(false);
    setChatMessages([]);
    setInputValue('');
  };

  const simulateBotResponse = (userMessage) => {
    return `You said: "${userMessage}". How else can I help?`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMessage = { sender: 'user', text: inputValue };
    setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setInputValue('');

    const botReplyText = simulateBotResponse(inputValue);
    const newBotMessage = { sender: 'bot', text: botReplyText };

    setTimeout(() => {
      setChatMessages((prevMessages) => [...prevMessages, newBotMessage]);
    }, 800);
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-window">
        {/* Close Button (Now Navigates to /user) */}
        <span className="chat-close" onClick={handleCloseChat}>&times;</span>
        
        <div className="chat-container">
          <div className="chat-left">
            <h2 className="chat-heading">Chats</h2>
            <div className="conversation">
              {currentConversations.map((conv, index) => (
                <div
                  key={conv.id}
                  className={`bubble ${
                    selectedIndex === index + currentPage * messagesPerPage ? 'selected' : ''
                  }`}
                  onClick={() =>
                    handleConversationClick(conv.message, conv.details, index + currentPage * messagesPerPage)
                  }
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

          <div className="chat-right">
            {chatStarted && (
              <button className="end-chat-btn" onClick={handleEndChat}>
                End Chat
              </button>
            )}

            <div className="chat-right-content">
              {!chatStarted && (
                <>
                  <div className="animation-container">
                    <Lottie animationData={animationData} loop={true} />
                  </div>
                  <button className="start-chat-btn" onClick={handleStartChat}>
                    Start Chat!
                  </button>
                </>
              )}

              {chatStarted && (
                <>
                  <div className="chat-history" ref={chatHistoryRef}>
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`chat-message ${msg.sender === 'bot' ? 'bot' : 'user'}`}
                      >
                        <p>{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="chat-input-container">
                    <input
                      type="text"
                      className="chat-input"
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <img
                      src={photo}
                      alt="Send"
                      className="send-photo"
                      onClick={handleSendMessage}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
