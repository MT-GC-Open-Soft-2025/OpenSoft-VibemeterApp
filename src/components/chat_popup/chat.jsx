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

  const [convids, setConversationIds] = useState([]);
  const [conversations, setConversations] = useState([]);

  // Chat state
  const [chatStarted, setChatStarted] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [rating, setRating] = useState(0);

  const chatHistoryRef = useRef(null);

  // Fetch conversations from API on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }
        const res = await axios.get("http://127.0.0.1:8000/user/getConvoids", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched conversations:", res.data);
        setConversationIds(res.data.convid_list || []);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        Swal.fire("Error", "Failed to fetch conversations. Please try again.", "error");
      }
    };

    fetchConversations();
  }, [navigate]);

  const messagesPerPage = 7;
  const totalPages = Math.ceil(convids.length / messagesPerPage);
  const [currentPage, setCurrentPage] = useState(0);

  // Restore conversation state from localStorage on component mount
  useEffect(() => {
    const savedChatMessages = localStorage.getItem("chatMessages");
    const savedConversationId = localStorage.getItem("conversationId");
    const savedChatStarted = localStorage.getItem("chatStarted");

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

  // On clicking a conversation, fetch its chat history
  const handleConversationClick = async (conv_id, index) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/chat/chat/${conv_id}`);
      console.log("Fetched chat history:", res.data);
      // Map the received messages to the expected structure (using "message" as "text")
      const fetchedMessages = res.data.chat.map((m) => ({
        sender: m.sender,
        text: m.message,
      }));
      setChatMessages(fetchedMessages);
      setConversationId(conv_id);
      setChatStarted(true);
    } catch (err) {
      console.error("Error fetching chat:", err);
      Swal.fire("Error", "Failed to load chat history. Please try again.", "error");
    }
    setSelectedIndex(index);
  };

  const currentConversations = convids.slice(
    currentPage * messagesPerPage,
    (currentPage + 1) * messagesPerPage
  );

  const handleStartChat = async () => {
    const uniqueId = nanoid(6);
    localStorage.setItem("uniqueId", uniqueId);
    setConversationId(uniqueId);
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
      console.log("Chat initiated:", res.data);
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
    try{
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
  }
  catch(err){
    alert ("Feedback already given")
  }
  };

  // Updated sendFeedback function to update conversation list without refreshing
  const sendFeedback = async (feedback) => {
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
      console.log(res.status)
      if (res.status==404) alert("fEEDBACK GOIVEN")
      console.log("Chat ended:", res.data);
      // Add the new conversation id to the state if it's not already there
      setConversationIds((prev) =>
        prev.includes(uniqueId) ? prev : [...prev, uniqueId]
      );
    } catch (err) {
      console.error("Error ending chat:", err);
      alert("Feedback has been given")
    }

    // Clear conversation data from state and localStorage
    setChatMessages([]);
    setInputValue("");
    setChatStarted(false);
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
              {currentConversations.map((conv_id, index) => (
                <div
                  key={conv_id}
                  className={`bubble ${
                    selectedIndex === index + currentPage * messagesPerPage
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleConversationClick(
                      conv_id,
                      index + currentPage * messagesPerPage
                    )
                  }
                >
                  {conv_id}
                </div>
              ))}
            </div>
            {convids.length > messagesPerPage && (
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

            <div className="chat-right-content">
              {chatStarted ? (
                <>
                  <div className="chat-history" ref={chatHistoryRef} style={{backgroundImage: "linear-gradient(135deg, rgb(255, 255, 255), rgb(168, 241, 255))" }}>
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`chat-message ${
                          msg.sender === "bot" ? "bot" : "user"
                        }`}
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