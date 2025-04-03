import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./chat.css";
import Lottie from "lottie-react";
import animationData from "../../Assets/animation.json";
import photo from "../../Assets/send.png"; // Adjust path if needed
import axios from "axios";
import { nanoid } from "nanoid";
import Swal from "sweetalert2";

const Chat = () => {
  const navigate = useNavigate();

  const conversations = [
    {
      id: "CHAT001",
      message: "Hello, how can I help you today?",
      details: "Details for CHAT001.",
    },
    {
      id: "CHAT002",
      message: "I have an issue with my account.",
      details: "Details for CHAT002.",
    },
    {
      id: "CHAT003",
      message: "Can you assist me with billing?",
      details: "Details for CHAT003.",
    },
    {
      id: "CHAT004",
      message: "Thank you for your help!",
      details: "Details for CHAT004.",
    },
    {
      id: "CHAT005",
      message: "What are your operating hours?",
      details: "Details for CHAT005.",
    },
    {
      id: "CHAT006",
      message: "I need further assistance.",
      details: "Details for CHAT006.",
    },
    {
      id: "CHAT007",
      message: "Can you escalate my issue?",
      details: "Details for CHAT007.",
    },
    {
      id: "CHAT008",
      message: "I want to know more about your services.",
      details: "Details for CHAT008.",
    },
    { id: "CHAT009", message: "Goodbye!", details: "Details for CHAT009." },
    {
      id: "CHAT010",
      message: "Thank you again!",
      details: "Details for CHAT010.",
    },
  ];

  const messagesPerPage = 7;
  const totalPages = Math.ceil(conversations.length / messagesPerPage);
  const [currentPage, setCurrentPage] = useState(0);
  const [rating, setRating] = useState(0);

  const [selectedMessage, setSelectedMessage] = useState("Please select a chat.");
  const [selectedDetails, setSelectedDetails] = useState("Please select a chat.");
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Chat state
  const [chatStarted, setChatStarted] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const chatHistoryRef = useRef(null);

  // Restore conversation state from localStorage on component mount
  useEffect(() => {
    const savedChatMessages = localStorage.getItem("chatMessages");
    const savedConversationId = localStorage.getItem("conversationId");
    const savedChatStarted = localStorage.getItem("chatStarted");

    if (savedChatMessages) {
      const parsedMessages = JSON.parse(savedChatMessages);
      if (parsedMessages.length > 0) {
        setChatMessages(parsedMessages);
        // If there are previous messages, mark chat as started.
        setChatStarted(true);
      }
    }
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
    // Optionally, if you want to honor the saved chatStarted flag:
    // if (savedChatStarted === "true") {
    //   setChatStarted(true);
    // }
  }, []);

  // Persist chat messages whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Persist chatStarted flag in localStorage
  useEffect(() => {
    localStorage.setItem("chatStarted", chatStarted.toString());
  }, [chatStarted]);

  // Persist conversationId in localStorage
  useEffect(() => {
    localStorage.setItem("conversationId", conversationId);
  }, [conversationId]);

  // Auto-scroll chat history to the bottom on new message
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle closing chat and clearing storage
  const handleCloseChat = () => {
    setChatStarted(false);
    setChatMessages([]);
    setInputValue("");
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatStarted");
    localStorage.removeItem("conversationId");
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

  const handleStartChat = async () => {
    const uniqueId = nanoid(6);
    localStorage.setItem("uniqueId", uniqueId);
    setConversationId(uniqueId);
    console.log("Unique conversation ID:", uniqueId);
    setChatStarted(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/chat/initiate_chat/${uniqueId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res);
      setChatMessages([{ sender: "bot", text: res.data.response }]);
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  const generateStarRatingUI = (currentRating) => {
    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
      starsHtml += `
        <input type="radio" id="star${i}" name="rating" value="${i}" ${
        i === currentRating ? "checked" : ""
      }>
        <label for="star${i}">⭐</label>
      `;
    }
    return `<div style="font-size: 30px; display: flex; gap: 10px; justify-content: center;">${starsHtml}</div>`;
  };

  const openFeedbackPopup = async () => {
    const { value: selectedRating } = await Swal.fire({
      title: "Give Your Feedback",
      html: generateStarRatingUI(rating),
      showCancelButton: true,
      confirmButtonText: "Submit",
      preConfirm: () => {
        const selected = document.querySelector('input[name="rating"]:checked');
        return selected
          ? parseInt(selected.value)
          : Swal.showValidationMessage("Please select a rating!");
      },
    });

    if (selectedRating) {
      setRating(selectedRating);
      Swal.fire("Thank You!", `You rated: ${selectedRating} ⭐`, "success");
      console.log("User Feedback:", selectedRating);
      sendFeedback(selectedRating);
    }
  };

  const sendFeedback = async (feedback) => {
    setChatStarted(false);
    const token = localStorage.getItem("token");
    const uniqueId = localStorage.getItem("uniqueId");

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/chat/end_chat/${uniqueId}/${feedback}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res);
    } catch (err) {
      console.error("Error ending chat:", err);
    }

    // Clear conversation data from state and localStorage
    setChatMessages([]);
    setInputValue("");
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatStarted");
    localStorage.removeItem("conversationId");
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    try {
      const token = localStorage.getItem("token");

      const newUserMessage = { sender: "user", text: inputValue };
      setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);

      const convo = String(localStorage.getItem("uniqueId"));
      const mess = String(inputValue);

      const response = await fetch("http://127.0.0.1:8000/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ convid: convo, message: mess }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInputValue("");
      const newBotMessage = { sender: "bot", text: data.response };

      setTimeout(() => {
        setChatMessages((prevMessages) => [...prevMessages, newBotMessage]);
      }, 800);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-window">
        {/* Close Button */}
        <span className="chat-close" onClick={handleCloseChat}>
          &times;
        </span>

        <div className="chat-container">
          <div className="chat-left">
            <h5 className="chat-heading fw-bold mt-4">👨 Employee Chats</h5>
            <div className="conversation">
              {currentConversations.map((conv, index) => (
                <div
                  key={conv.id}
                  className={`bubble ${
                    selectedIndex === index + currentPage * messagesPerPage
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleConversationClick(
                      conv.message,
                      conv.details,
                      index + currentPage * messagesPerPage
                    )
                  }
                >
                  {conv.id}
                </div>
              ))}
            </div>
            {conversations.length > messagesPerPage && (
              <div className="pagination">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 0}
                  className="page-btn"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages - 1}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="chat-right">
            {chatStarted && (
              <button className="end-chat-btn" onClick={openFeedbackPopup}>
                End Chat
              </button>
            )}

            <div className="chat-right-content" style={{backgroundImage: "linear-gradient(135deg, rgb(255, 255, 255), rgb(168, 241, 255))"}}>
              {/* If chat has started (or restored), show the conversation */}
              {chatStarted ? (
                <>
                  <div className="chat-history" ref={chatHistoryRef} style={{backgroundImage: "linear-gradient(135deg, rgb(255, 255, 255), rgb(168, 241, 255))" }}>
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`chat-message ${msg.sender === "bot" ? "bot" : "user"}`}
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
              ) : (
                <div className="animated"> 
                  <div className="animation-container">
                    <Lottie animationData={animationData} loop={true} />
                  </div>
                  <button className="start-chat-btn" onClick={handleStartChat}>
                    Start Chat!
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;