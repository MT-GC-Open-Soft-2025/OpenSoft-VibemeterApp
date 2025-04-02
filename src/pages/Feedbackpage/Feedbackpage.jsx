import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Feedbackpage.css";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");

useEffect(() => {
  const storedId = localStorage.getItem("employeeId");
  setEmployeeId(storedId);
}, []);

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState("Please select a conversation ID.");
  const [selectedSummary, setSelectedSummary] = useState("Please select a conversation ID.");
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    if (!employeeId) {
      console.error("Error: Employee ID is missing.");
      return;
    }

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found. Please log in.");

        const response = await axios.get(
          `http://127.0.0.1:8000/admin/get_conversations/${employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid API response format!");
        }

        setConversations(response.data);
      } catch (err) {
        console.error("Error fetching conversations:", err.message);
        setError(err.message);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [employeeId]);

  const handleConversationClick = async (convId, index) => {
    setSelectedIndex(index);
    setSelectedFeedback("Loading feedback...");
    setSelectedSummary("Loading summary...");
    setLoadingDetails(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in.");

      const feedbackRes = await axios.get(
        `http://127.0.0.1:8000/get_conversationFeedback/${employeeId}/${convId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const summaryRes = await axios.get(
        `http://127.0.0.1:8000/get_conversationSummary/${employeeId}/${convId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedFeedback(feedbackRes.data.user_record.feedback || "No feedback available.");
      setSelectedSummary(summaryRes.data.user_record.summary || "No summary available.");
    } catch (err) {
      console.error("Error fetching feedback & summary:", err.message);
      setSelectedFeedback("Error fetching feedback.");
      setSelectedSummary("Error fetching summary.");
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="feedback-wrapper">
      <Feedbacknavbar title="Feedback Page" />

      <div className="feedback-container">
        {loadingConversations ? (
          <p>Loading conversations...</p>
        ) : error ? (
          <p className="text-danger">Error: {error}</p>
        ) : (
          <>
            <div className="feedback-section">
              <h2>Conversation ID</h2>
              <div className="conversation">
                {conversations.map((conv, index) => (
                  <div
                    key={conv.id}
                    className={`bubble ${selectedIndex === index ? "selected" : ""}`}
                    onClick={() => handleConversationClick(conv.id, index)}
                  >
                    {conv.id}
                  </div>
                ))}
              </div>
            </div>

            <div className="feedback-section">
              <h2>Feedback</h2>
              <p>{loadingDetails ? "Loading..." : selectedFeedback}</p>
            </div>

            <div className="feedback-section">
              <h2>Summary</h2>
              <p>{loadingDetails ? "Loading..." : selectedSummary}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
