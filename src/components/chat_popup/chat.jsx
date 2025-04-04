// Updated Chat Component with proper current chat handling
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./chat.css";
import Lottie from "lottie-react";
import animationData from "../../Assets/animation.json";
import photo from "../../Assets/send.png";
import axios from "axios";
import { nanoid } from "nanoid";
import Swal from "sweetalert2";

const Chat = () => {
  const navigate = useNavigate();

  const [convids, setConversationIds] = useState([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [rating, setRating] = useState(0);

  const chatHistoryRef = useRef(null);

  

  // let localStorage.getItem("uniqueId") = localStorage.getItem("uniqueId");
  //let localStorage.getItem("uniqueId")===localStorage.getItem("conversationId") = conversationId === localStorage.getItem("uniqueId");

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

      const all = res.data.convid_list || [];
      const current = localStorage.getItem("uniqueId");
      const reordered = current && all.includes(current)
        ? [current, ...all.filter((id) => id !== current)]
        : all;

      setConversationIds(reordered);
      
    } catch (err) {
      Swal.fire("Error", "Failed to fetch conversations. Please try again", "error");
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
  }, [chatMessages]);

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
    try {
      //swal should have dont wanna give feedback button
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
        html: generateStarRatingUI(rating),
        preConfirm: () => {
          const selected = document.querySelector('input[name="rating"]:checked');
          return selected
            ? parseInt(selected.value)
            : Swal.showValidationMessage("Please select a rating!");
        },
      });
      
      if (isDenied) {
        await sendFeedback(0);
        Swal.fire("No problem!", "Feedback skipped 👍", "info");
      } else if (isConfirmed && selectedRating) {
        setRating(selectedRating);
        await sendFeedback(selectedRating);
        Swal.fire("Thank You!", `You rated: ${selectedRating} ⭐`, "success");
      }
      
      localStorage.removeItem("uniqueId");
      
    } catch (err) {
      alert("Feedback already given");
    }
  };

  const handleStartChat = async () => {
    console.log("localStorage.getItem('uniqueId')", localStorage.getItem('uniqueId'));
   console.log(localStorage.getItem("conversationId"));
    const existingId = localStorage.getItem("uniqueId");
    if(existingId){

    if (conversationId && conversationId !== existingId) {
      // Just switch back to current active chat
      setConversationId(existingId);
      setChatStarted(true);
      setSelectedIndex(null);
      const res = await axios.get(`http://127.0.0.1:8000/chat/chat/${existingId}`);
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
        `http://127.0.0.1:8000/chat/end_chat/${uniqueId}/${feedback}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConversationIds((prev) =>
        prev.includes(uniqueId) ? prev : [uniqueId, ...prev]
      );
    } catch (err) {
      alert("Feedback has been given");
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
      const res = await axios.get(`http://127.0.0.1:8000/chat/chat/${conv_id}`);
      const fetchedMessages = res.data.chat.map((m) => ({
        sender: m.sender,
        text: m.message,
      }));
      setChatMessages(fetchedMessages);
      setConversationId(conv_id);
      setChatStarted(true);
      setSelectedIndex(index);
    } catch (err) {
      Swal.fire("Error", "Failed to load chat history. Please try again.", "error");
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    try {
      const token = localStorage.getItem("token");

      const newUserMessage = { sender: "user", text: inputValue };
      setChatMessages((prev) => [...prev, newUserMessage]);

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

      const data = await response.json();
      setInputValue("");
      const newBotMessage = { sender: "bot", text: data.response };

      setTimeout(() => {
        setChatMessages((prev) => [...prev, newBotMessage]);
      }, 800);
    } catch (err) {
      console.error(err);
    }
  };
  const handleClosePortal = () => {
    const id = localStorage.getItem("uniqueId");
    if(id){sendFeedback(0);}
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
  
    navigate("/user"); // or to "/login" if your app needs it
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
            <h5 className="chat-heading fw-bold mt-4">👨 Employee Chats</h5>
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <button className="start-chat-sidebar-btn" onClick={handleStartChat}>
                {!localStorage.getItem("uniqueId") || localStorage.getItem("conversationId" )=== localStorage.getItem("uniqueId")? "➕ New Chat" : "⬅ Go to Current Chat"}
              </button>
            </div>
            <div className="conversation" >
              {convids.map((conv_id, index) => (
                <div
                  key={conv_id}
                  className={`bubble ${selectedIndex === index ? "selected" : ""}`}
                  onClick={() => handleConversationClick(conv_id, index)}
                >
                  {conv_id}
                </div>
              ))}
            </div>
          </div>

          <div className="chat-right">
            {chatStarted && localStorage.getItem("uniqueId")===localStorage.getItem("conversationId") && (
              <button className="end-chat-btn" onClick={openFeedbackPopup}>End Chat</button>
            )}

            <div className="chat-right-content">
              {chatStarted ? (
                <>
                  {!localStorage.getItem("uniqueId")===localStorage.getItem("conversationId") && (
                    <div className="readonly-notice">🔒 <em>This is a read-only chat.</em></div>
                  )}

                  <div className="chat-history" ref={chatHistoryRef} style={{ backgroundImage: "linear-gradient(135deg, rgb(255, 255, 255), rgb(168, 241, 255))" }}>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`chat-message ${msg.sender === "bot" ? "bot" : "user"}`}>
                        <p>{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="chat-input-container">
                    <input
                      type="text"
                      className="chat-input"
                      placeholder={localStorage.getItem("uniqueId")===localStorage.getItem("conversationId") ? "Type your message..." : "Cannot message in past chats"}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!localStorage.getItem("uniqueId")===localStorage.getItem("conversationId")}
                    />
                    <img
                      src={photo}
                      alt="Send"
                      className={`send-photo ${!localStorage.getItem("uniqueId")===localStorage.getItem("conversationId") ? "disabled-send" : ""}`}
                      onClick={localStorage.getItem("uniqueId")===localStorage.getItem("conversationId") ? handleSendMessage : undefined}
                    />
                  </div>
                </>
              ) : (
                <div className="animated">
                  <div className="animation-container">
                    <Lottie animationData={animationData} loop={true} />
                  </div>
                  <button className="start-chat-btn" onClick={handleStartChat}>Start Chat!</button>
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