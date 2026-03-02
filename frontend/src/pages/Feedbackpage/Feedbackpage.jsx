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
    <div className="feedback-wrapper bg-light min-vh-100">
      <Feedbacknavbar title="Feedback Page" />

      <div className="container-fluid py-4 px-lg-5">
        {loadingConversations ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger mx-auto mt-4" style={{ maxWidth: "600px" }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Error: {error}
          </div>
        ) : (
          <div className="row g-4 mt-2">
            <div className="col-12 col-md-4 col-lg-3">
              <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom-0 pt-4 pb-2 px-4">
                  <h6 className="mb-0 fw-bold text-uppercase text-muted" style={{ letterSpacing: "1px", fontSize: "0.8rem" }}>
                    Conversations
                  </h6>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush conversation-list">
                    {conversations.length === 0 ? (
                      <div className="p-5 text-center text-muted">
                        <div className="opacity-50 mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-chat-square-text" viewBox="0 0 16 16">
                            <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                            <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                          </svg>
                        </div>
                        <p className="mb-0">No past conversations</p>
                      </div>
                    ) : (
                      conversations.map((conv, index) => (
                        <button
                          key={conv}
                          className={`list-group-item list-group-item-action border-0 py-3 px-4 ${
                            selectedIndex === index ? "active" : ""
                          }`}
                          onClick={() => handleConversationClick(conv, index)}
                        >
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0 me-3">
                              <div
                                className={`rounded-circle d-flex align-items-center justify-content-center ${
                                  selectedIndex === index ? "bg-white text-primary shadow-sm" : "bg-light text-secondary"
                                }`}
                                style={{ width: "42px", height: "42px" }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                                </svg>
                              </div>
                            </div>
                            <div className="flex-grow-1 text-truncate">
                              <span className="fw-medium d-block">{conv}</span>
                              <small className={selectedIndex === index ? "text-white-50" : "text-muted"}>
                                Chat Session
                              </small>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-8 col-lg-9">
              {selectedIndex === null ? (
                <div className="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center p-5 text-muted bg-white rounded-4">
                  <div className="text-center">
                    <div className="opacity-25 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-inbox" viewBox="0 0 16 16">
                        <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.311l-.001 5.5a1.5 1.5 0 0 1-1.5 1.5H1.5A1.5 1.5 0 0 1 0 14V8.5a.5.5 0 0 1 .106-.311l3.7-4.625zM1 8.5v5.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-5.5h-4.04a2.5 2.5 0 0 1-4.92 0H1z"/>
                      </svg>
                    </div>
                    <h4 className="fw-bold mb-2">Select a Conversation</h4>
                    <p className="text-secondary">Choose a conversation from the list to view its feedback and detailed summary.</p>
                  </div>
                </div>
              ) : (
                <div className="card border-0 shadow-sm h-100 rounded-4">
                  <div className="card-body p-4 p-lg-5">
                    
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4 d-flex align-items-center text-dark">
                        <div className="bg-warning bg-opacity-10 text-warning rounded p-2 me-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                          </svg>
                        </div>
                        Feedback Given
                      </h5>
                      
                      {loadingDetails ? (
                        <div className="d-flex align-items-center p-4 bg-light rounded-3">
                          <div className="spinner-border text-primary spinner-border-sm me-3" role="status"></div>
                          <span className="text-secondary">Loading feedback...</span>
                        </div>
                      ) : (
                        <div className="feedback-content bg-light rounded-4 p-4 border border-light shadow-sm">
                          {selectedFeedback === '0' || !selectedFeedback ? (
                            <p className="text-muted mb-0 fst-italic">No feedback was provided for this conversation.</p>
                          ) : (
                            <p className="mb-0 fs-5 text-dark" style={{ lineHeight: "1.6" }}>"{selectedFeedback}"</p>
                          )}
                        </div>
                      )}
                    </div>

                    <hr className="text-muted opacity-25 mb-5" />

                    <div>
                      <h5 className="fw-bold mb-4 d-flex align-items-center text-dark">
                        <div className="bg-info bg-opacity-10 text-info rounded p-2 me-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1"/>
                            <path d="M6 5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3A.5.5 0 0 1 6 5m0 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m0 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5"/>
                          </svg>
                        </div>
                        Conversation Summary
                      </h5>
                      
                      {loadingDetails ? (
                        <div className="d-flex flex-column gap-3 p-2">
                          <div className="spinner-grow text-info opacity-25" role="status" style={{ width: "3rem", height: "3rem" }}></div>
                          <span className="text-secondary mt-2">Generating summary details...</span>
                        </div>
                      ) : (
                        <div className="summary-content lead text-secondary">
                          <Markdown>{selectedSummary}</Markdown>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
