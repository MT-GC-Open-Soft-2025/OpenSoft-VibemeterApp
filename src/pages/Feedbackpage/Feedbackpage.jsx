import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Feedbackpage.css";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar";
import Markdown from 'markdown-to-jsx'
import baseUrl from "../../Config";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");

useEffect(() => {
  const storedId = localStorage.getItem("selectedEmployee");
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
          `${baseUrl}/admin/get_conversations/${employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(response)

        if (!Array.isArray(response.data.ConvoID)) {
          throw new Error("Invalid API response format!");
        }

        setConversations(response.data.ConvoID);
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
        `${baseUrl}/admin/get_conversationFeedback/${employeeId}/${convId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const summaryRes = await axios.get(
        `${baseUrl}/admin/get_conversationSummary/${employeeId}/${convId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(feedbackRes)
      console.log(feedbackRes.data["Feedback "] )
      console.log(summaryRes.data["Summary "])



      function parseTextResponse(text) {
        // Split into lines
        const lines = text.split("\n");
        
        // Initialize an object to store parsed data
        const parsedData = {};
        let currentSection = null;
    
        lines.forEach(line => {
            line = line.trim();  // Remove extra spaces
    
            // Detect section headers (lines starting and ending with **)
            if (/^\*\*(.+?)\*\*$/.test(line)) {
                currentSection = line.replace(/\*\*/g, "").trim(); // Remove **
                parsedData[currentSection] = "";
            } else if (currentSection) {
                parsedData[currentSection] += (parsedData[currentSection] ? " " : "") + line;
            }
        });
        
        return parsedData;
    }
      
      setSelectedFeedback(feedbackRes.data["Feedback "] || "No feedback available.");
      setSelectedSummary(summaryRes.data["Summary "] || "No summary available.");
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
                    key={conv}
                    className={`bubble ${selectedIndex === index ? "selected" : ""}`}
                    onClick={() => handleConversationClick(conv, index)}
                  >
                    {conv}
                  </div>
                ))}
              </div>
            </div>
              <div  className="new">
                <div className="notnew">
            <div className="feedback-section">
              <h2>Feedback</h2>
              <p style={{fontSize: '30px'}}>{loadingDetails ? "Loading..." : selectedFeedback}</p>
              {selectedFeedback === '0' && !loadingDetails && (
                <p>No feedback given.</p>
              )}
            </div>

            
            </div>
            <div className="feedback-section">
              <h2>Summary</h2>
              <p>{loadingDetails ? "Loading..." : <Markdown>{selectedSummary}</Markdown>}</p>
            </div>
            </div>
          </>
        )}
      </div>
    </div>
    
    
  );
};

export default FeedbackPage;
