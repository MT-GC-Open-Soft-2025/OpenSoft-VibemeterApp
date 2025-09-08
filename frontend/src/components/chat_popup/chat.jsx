import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./chat.css";
import Lottie from "lottie-react";
import animationData from "../../Assets/animation.json";
import photo from "../../Assets/send.png";
import axios from "axios";
import { nanoid } from "nanoid";
import Swal from "sweetalert2";
import baseUrl from "../../Config";
import Markdown from 'markdown-to-jsx'

const Chat = () => {
  const navigate = useNavigate();
  const [convids, setConversationIds] = useState([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [rating, setRating] = useState(0);
  const [isBotTyping, setIsBotTyping] = useState(false); // typing indicator
  const chatHistoryRef = useRef(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

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
      // Swal.fire({"Error", "Failed to fetch conversations. Please try again", "error", confirmButtonColor: '#36ABAA'});
      Swal.fire({
        title: "Error",
        text: "Failed to fetch conversations. Please try again",
        icon: "error",
        confirmButtonColor: '#36ABAA'
      });
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

  const generateStarHTML = () => {
    return `
      <style>
        .star-rating {
          direction: rtl;
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .star-rating input {
          display: none;
        }
        .star-rating label {
          font-size: 2.2rem;
          color: #ccc;
          cursor: pointer;
          transition: color 0.2s;
        }
        .star-rating input:checked ~ label,
        .star-rating label:hover,
        .star-rating label:hover ~ label {
          color: #ffc107;
        }
      </style>
      <div class="star-rating">
        <input type="radio" id="star5" name="rating" value="5" />
        <label for="star5">★</label>
        <input type="radio" id="star4" name="rating" value="4" />
        <label for="star4">★</label>
        <input type="radio" id="star3" name="rating" value="3" />
        <label for="star3">★</label>
        <input type="radio" id="star2" name="rating" value="2" />
        <label for="star2">★</label>
        <input type="radio" id="star1" name="rating" value="1" />
        <label for="star1">★</label>
      </div>
    `;
  };


  const openFeedbackPopup = async () => {
    try {
      const { isConfirmed, isDenied, value: selectedRating } = await Swal.fire({
        title: "Do you want to give feedback?",
        text: "Rate your experience with this chat",
        icon: "question",
        showCloseButton: true,
        showDenyButton: true,
        showCancelButton: true,
        denyButtonText: "No, thanks",
        cancelButtonText: "Cancel",
        confirmButtonText: "Submit",
        html: generateStarHTML(),
        confirmButtonColor: '#36ABAA',
        preConfirm: () => {
          const selected = document.querySelector('input[name="rating"]:checked');
          if (!selected) {
            Swal.showValidationMessage({
              text: "Please select a rating!",
              confirmButtonColor: '#d33',
            });
          }
          return selected ? parseInt(selected.value) : null;
        },
      });
  
      if (isDenied) {
        Swal.fire({
          title: "Submitting your feedback...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        await sendFeedback(0);
        Swal.fire({
          title: "No problem!", 
          text: "Feedback skipped 👍", 
          icon: "info",
          confirmButtonColor: '#36ABAA'
        }
        );
      } else if (isConfirmed && selectedRating) {
        setRating(selectedRating);
  
        // ✅ Show loader while sending feedback
        Swal.fire({
          title: "Submitting your feedback...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
  
        await sendFeedback(selectedRating);
        Swal.fire({
          title: "Thank You!", 
          text: `You rated: ${selectedRating} ⭐`, 
          icon: "success",
          confirmButtonColor: '#36ABAA'
        }
        );
      }
  
      localStorage.removeItem("uniqueId");
    } catch (err) {
      alert("Feedback already given");
    }
  };
  

  const handleStartChat = async () => {
    const existingId = localStorage.getItem("uniqueId");
    if (existingId) {
      if (conversationId && (conversationId !== existingId)) {
        setConversationId(existingId);
        setChatStarted(true);
        setSelectedIndex(null);
        const res = await axios.get(`${baseUrl}/chat/chat/${existingId}`);
        const fetchedMessages = res.data.chat.map((m) => ({
          sender: m.sender,
          text: m.message,
        }));
        setChatMessages(fetchedMessages);
        return;
      }
      if (existingId && conversationId === existingId) {
        const result = await Swal.fire({
          title: "You already have a chat",
          text: "Do you really want to start a new one? You won’t be able to text here after this.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, start new",
          cancelButtonText: "No, stay here",
          confirmButtonColor: '#36ABAA'
        });
        if (!result.isConfirmed) return;
        await openFeedbackPopup();
      }
    }

    const uniqueId = nanoid(6);
    localStorage.setItem("uniqueId", uniqueId);
    setConversationId(uniqueId);
    setChatStarted(true);
    setSelectedIndex(null);
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
    }
  };

  const sendFeedback = async (feedback) => {
    const token = localStorage.getItem("token");
    const uniqueId = localStorage.getItem("uniqueId");

    try {
      await axios.post(
        `${baseUrl}/chat/end_chat/${uniqueId}/${feedback}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConversationIds((prev) =>
        prev.includes(uniqueId) ? prev : [uniqueId, ...prev]
      );
    } catch (err) {
      console.warn("Feedback already submitted or error occurred.");
    }

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
      
    } catch (err) {
      Swal.fire({
        title: "Error", 
        text: "Failed to load chat history. Please try again.", 
        icon: "error",
        confirmButtonColor: '#d33'
    });
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
    }
  };

  const handleClosePortal = () => {
    const id = localStorage.getItem("uniqueId");
    if (id) {
      sendFeedback(0);
    }
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatStarted");
    localStorage.removeItem("conversationId");
    localStorage.removeItem("uniqueId");

    setConversationIds([]);
    setChatMessages([]);
    setChatStarted(false);
    setConversationId("");
    setSelectedIndex(null);
    setInputValue("");

    navigate("/user");
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
        <button className="close-portal-btn" onClick={handleClosePortal}>
          X
        </button>
        <div className="chat-container">
          <div className="chat-left">
            <h5 className="chat-heading fw-bold mt-4">Employee Chats</h5>
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <button className="start-chat-sidebar-btn" onClick={handleStartChat}>
                {!localStorage.getItem("uniqueId") || conversationId === localStorage.getItem("uniqueId")
                  ? "New Chat"
                  : "⬅ Go to Current Chat"}
              </button>
            </div>
            <div className="conversation">
              {convids.map((conv_id, index) => (
                <div
                  key={conv_id}
                  className={`bubble ${selectedIndex === index ? "selected" : ""}`}
                  onClick={() => handleConversationClick(conv_id, index)}
                >
                  {`Chat ${index}`}
                </div>
              ))}
            </div>
          </div>

          <div className="chat-right">
            {chatStarted && localStorage.getItem("uniqueId") === conversationId && (
              <button className="end-chat-btn" onClick={openFeedbackPopup}>
                End Chat
              </button>
            )}

            <div className="chat-right-content">
              {chatStarted ? (
                <>
                  {localStorage.getItem("uniqueId") !== localStorage.getItem("conversationId") && (
                    <div className="readonly-notice">
                      🔒 <em>This is a read-only chat.</em>
                    </div>
                  )}

                  <div
                    className="chat-history"
                    ref={chatHistoryRef}
                    style={{
                      backgroundImage: "linear-gradient(135deg, rgb(255, 255, 255), rgb(168, 241, 255))",
                    }}
                  >
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`chat-message ${msg.sender === "bot" ? "bot" : "user"}`}
                      >
                        <p><Markdown>{msg.text}</Markdown></p>
                      </div>
                    ))}
                    {isBotTyping && (
                      <div className="chat-message bot typing-indicator">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                    )}
                  </div>
                  <div className="chat-input-container">
                    <input
                      type="text"
                      className="chat-input"
                      placeholder={
                        localStorage.getItem("uniqueId") === conversationId
                          ? "Type your message..."
                          : "Cannot message in past chats"
                      }
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={
                        localStorage.getItem("uniqueId") !== localStorage.getItem("conversationId")
                      }
                    />
                    <img
                      src={photo}
                      alt="Send"
                      className={`send-photo ${
                        localStorage.getItem("uniqueId") !== localStorage.getItem("conversationId")
                          ? "disabled-send"
                          : ""
                      }`}
                      onClick={
                        localStorage.getItem("uniqueId") === localStorage.getItem("conversationId")
                          ? handleSendMessage
                          : undefined
                      }
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
