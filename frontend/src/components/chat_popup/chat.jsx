import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "./chat.css";
import Lottie from "lottie-react";
import animationData from "../../Assets/animation.json";
import photo from "../../Assets/send.png";
import axios from "axios";
import { nanoid } from "nanoid";
import baseUrl from "../../Config";
import Markdown from 'markdown-to-jsx'

const Chat = ({ onClose }) => {
  const navigate = useNavigate();
  const [convids, setConversationIds] = useState([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatHistoryRef = useRef(null);

  // Layout states
  const [showHistory, setShowHistory] = useState(false);

  // Modal states
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "" });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const res = await axios.get(`${baseUrl}/user/getConvoids`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data.convid_list || [];
      const current = localStorage.getItem("uniqueId");
      const reordered =
        current && all.includes(current)
          ? [current, ...all.filter((id) => id !== current)]
          : all;
      setConversationIds(reordered);
    } catch (err) {
      showErrorModal("Failed to fetch conversations. Please try again.");
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [navigate]);

  useEffect(() => {
    const savedChatMessages = localStorage.getItem("chatMessages");
    const savedConversationId = localStorage.getItem("conversationId");

    if (savedChatMessages) {
      const parsedMessages = JSON.parse(savedChatMessages);
      if (parsedMessages.length > 0) {
        setChatMessages(parsedMessages);
        setChatStarted(true);
      }
    }
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem("chatStarted", chatStarted.toString());
  }, [chatStarted]);

  useEffect(() => {
    localStorage.setItem("conversationId", conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatMessages, isBotTyping]);

  const showErrorModal = (message) => {
    setModalConfig({ isOpen: true, type: "error", message });
  };

  const openFeedbackPopup = () => {
    setRating(0);
    setHoverRating(0);
    setModalConfig({ isOpen: true, type: "feedback" });
  };

  const handleStartChat = async () => {
    const existingId = localStorage.getItem("uniqueId");
    if (existingId) {
      if (conversationId && conversationId !== existingId) {
        setConversationId(existingId);
        setChatStarted(true);
        setSelectedIndex(null);
        setShowHistory(false);
        try {
          const res = await axios.get(`${baseUrl}/chat/chat/${existingId}`);
          const fetchedMessages = res.data.chat.map((m) => ({
            sender: m.sender,
            text: m.message,
          }));
          setChatMessages(fetchedMessages);
        } catch (err) {
          showErrorModal("Failed to load chat history.");
        }
        return;
      }
      if (existingId && conversationId === existingId) {
        setModalConfig({ isOpen: true, type: "confirmNewChat" });
        return;
      }
    }

    startNewChatProcess();
  };

  const startNewChatProcess = async () => {
    const uniqueId = nanoid(6);
    localStorage.setItem("uniqueId", uniqueId);
    setConversationId(uniqueId);
    setChatStarted(true);
    setSelectedIndex(null);
    setShowHistory(false);
    await fetchConversations();

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${baseUrl}/chat/initiate_chat/${uniqueId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatMessages([{ sender: "bot", text: res.data.response }]);
    } catch (err) {
      console.error("Error starting chat:", err);
      showErrorModal("Failed to start a new chat.");
    }
  };

  const sendFeedback = async (feedbackValue) => {
    setModalLoading(true);
    const token = localStorage.getItem("token");
    const uniqueId = localStorage.getItem("uniqueId");

    try {
      await axios.post(
        `${baseUrl}/chat/end_chat/${uniqueId}/${feedbackValue}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConversationIds((prev) =>
        prev.includes(uniqueId) ? prev : [uniqueId, ...prev]
      );
    } catch (err) {
      console.warn("Feedback already submitted or error occurred.");
    }

    setModalLoading(false);
    setModalConfig({ isOpen: false, type: "" });
    localStorage.removeItem("uniqueId");
    
    setChatMessages([]);
    setInputValue("");
    setChatStarted(false);
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatStarted");
    localStorage.removeItem("conversationId");
  };

  const handleConversationClick = async (conv_id, index) => {
    try {
      const res = await axios.get(`${baseUrl}/chat/chat/${conv_id}`);
      const fetchedMessages = res.data.chat.map((m) => ({
        sender: m.sender,
        text: m.message,
      }));
      setChatMessages(fetchedMessages);
      setConversationId(conv_id);
      setChatStarted(true);
      setSelectedIndex(index);
      setShowHistory(false); // return to chat view
    } catch (err) {
      showErrorModal("Failed to load chat history. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const messageToSend = inputValue;

      const newUserMessage = { sender: "user", text: messageToSend };
      setChatMessages((prev) => [...prev, newUserMessage]);
      setInputValue("");
      setIsBotTyping(true);

      const convo = String(localStorage.getItem("uniqueId"));

      const response = await fetch(`${baseUrl}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ convid: convo, message: messageToSend }),
      });

      const data = await response.json();
      const newBotMessage = { sender: "bot", text: data.response };

      setTimeout(() => {
        setIsBotTyping(false);
        setChatMessages((prev) => [...prev, newBotMessage]);
      }, 800);
    } catch (err) {
      console.error(err);
      setIsBotTyping(false);
      showErrorModal("Failed to send message.");
    }
  };

  const handleClosePortal = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/user");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render modal content based on state
  const renderModalContent = () => {
    if (modalConfig.type === "error") {
      return (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>{modalConfig.message}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalConfig({ isOpen: false, type: "" })}>Close</Button>
          </Modal.Footer>
        </>
      );
    }

    if (modalConfig.type === "confirmNewChat") {
      return (
        <>
          <Modal.Header closeButton>
            <Modal.Title>You already have a chat</Modal.Title>
          </Modal.Header>
          <Modal.Body>Do you really want to start a new one? You won’t be able to text here after this.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalConfig({ isOpen: false, type: "" })}>No, stay here</Button>
            <Button variant="primary" onClick={() => {
              setModalConfig({ isOpen: false, type: "" });
              openFeedbackPopup();
            }}>Yes, start new</Button>
          </Modal.Footer>
        </>
      );
    }

    if (modalConfig.type === "feedback") {
      return (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Do you want to give feedback?</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <p>Rate your experience with this chat</p>
            <div className="star-rating d-flex justify-content-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    cursor: "pointer",
                    fontSize: "2.5rem",
                    color: star <= (hoverRating || rating) ? "#ffc107" : "#e4e5e9",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            {modalLoading && <p className="text-muted">Submitting feedback...</p>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalConfig({ isOpen: false, type: "" })} disabled={modalLoading}>Cancel</Button>
            <Button variant="outline-danger" onClick={() => sendFeedback(0)} disabled={modalLoading}>No, thanks</Button>
            <Button variant="primary" onClick={() => sendFeedback(rating)} disabled={modalLoading || rating === 0}>Submit</Button>
          </Modal.Footer>
        </>
      );
    }

    return null;
  };

  const isReadonly = localStorage.getItem("uniqueId") !== conversationId;

  return (
    <>
      <div className="chat-floating-widget bg-white shadow-lg rounded-4 overflow-hidden border">
        {/* Header */}
        <div className="chat-header d-flex justify-content-between align-items-center p-3 text-white">
          <div className="d-flex align-items-center gap-2">
            <h6 className="mb-0 fw-bold">WellBee Chat</h6>
            {showHistory ? (
              <button className="btn btn-sm btn-light py-0 px-2 rounded-pill" onClick={() => setShowHistory(false)}>Back to Chat</button>
            ) : (
              <button className="btn btn-sm btn-light py-0 px-2 rounded-pill" onClick={() => setShowHistory(true)}>History</button>
            )}
          </div>
          <button className="btn-close btn-close-white" onClick={handleClosePortal} aria-label="Close"></button>
        </div>

        {/* Content Area */}
        <div className="chat-content-area">
          {showHistory ? (
            <div className="chat-history-list p-3 h-100 overflow-y-auto bg-light">
              <button className="btn btn-success w-100 mb-3 rounded-pill fw-bold" onClick={handleStartChat}>
                ➕ Start New Chat
              </button>
              <h6 className="text-muted mb-2">Past Conversations</h6>
              <div className="d-flex flex-column gap-2">
                {convids.map((conv_id, index) => (
                  <div
                    key={conv_id}
                    className={`p-2 rounded-3 border cursor-pointer history-item ${selectedIndex === index ? "bg-primary text-white" : "bg-white text-dark"}`}
                    onClick={() => handleConversationClick(conv_id, index)}
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                  >
                    Chat Session {convids.length - index}
                  </div>
                ))}
                {convids.length === 0 && <p className="text-center text-muted mt-3">No past chats found.</p>}
              </div>
            </div>
          ) : (
            <div className="chat-right-content">
              {chatStarted && !isReadonly && (
                <div className="p-2 bg-light border-bottom text-center">
                  <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" onClick={openFeedbackPopup}>
                    End Chat
                  </button>
                </div>
              )}

              {chatStarted ? (
                <>
                  {isReadonly && (
                    <div className="readonly-notice bg-warning text-dark py-1 text-center" style={{ fontSize: "14px" }}>
                      🔒 <em>This is a read-only past chat.</em>
                    </div>
                  )}

                  <div className="chat-history p-3" ref={chatHistoryRef}>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`chat-message ${msg.sender === "bot" ? "bot" : "user"}`}>
                        <div className="message-bubble">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      </div>
                    ))}
                    {isBotTyping && (
                      <div className="chat-message bot">
                        <div className="message-bubble typing-indicator m-0">
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="chat-input-wrapper p-2 bg-white border-top">
                    <div className="chat-input-container rounded-pill border d-flex align-items-center pe-2">
                      <input
                        type="text"
                        className="chat-input flex-grow-1 border-0 rounded-pill px-3 py-2 bg-transparent"
                        placeholder={!isReadonly ? "Type your message..." : "Cannot message in past chats"}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isReadonly}
                        style={{ outline: "none" }}
                      />
                      <img
                        src={photo}
                        alt="Send"
                        className={`send-photo ${isReadonly ? "opacity-50" : "cursor-pointer"}`}
                        style={{ width: "24px", height: "24px", cursor: isReadonly ? "not-allowed" : "pointer" }}
                        onClick={!isReadonly ? handleSendMessage : undefined}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center">
                  <div className="animation-container mb-4" style={{ width: "200px" }}>
                    <Lottie animationData={animationData} loop={true} />
                  </div>
                  <h5 className="fw-bold mb-3 text-dark">Ready to chat?</h5>
                  <button className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm" onClick={handleStartChat}>
                    Start Chat!
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal show={modalConfig.isOpen} onHide={() => setModalConfig({ isOpen: false, type: "" })} centered>
        {renderModalContent()}
      </Modal>
    </>
  );
};

export default Chat;
