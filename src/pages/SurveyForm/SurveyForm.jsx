import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SurveyForm.css";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar";

const SurveyForm = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]); 
  const [responses, setResponses] = useState({}); 
  const [status, setStatus] = useState(""); 

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You are not logged in.");
      }

      
      const response = await axios.get("http://127.0.0.1:8000/chat/feedback", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API Response Data:", response.data); 

      
      const data = response.data?.response || [];

      
      if (!Array.isArray(data) || data.length === 0) {
        setStatus("No questions available.");
        setQuestions([]);
        return;
      }

      setQuestions(data);

      
      const initial = {};
      data.forEach((q) => (initial[q.question_id] = 3));
      setResponses(initial);

    } catch (error) {
      console.error("Error fetching questions:", error.response?.data || error.message);
      setStatus("Failed to load questions.");
    }
  };

  const handleRating = (questionId, rating) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: rating,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace with your actual API endpoint if needed
      const res = await fetch("/api/submit-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("Survey submitted successfully!");

      // Optionally reset responses to 3
      const reset = {};
      questions.forEach((q) => (reset[q.id] = 3));
      setResponses(reset);
    } catch (error) {
      console.error("Error submitting survey:", error);
      setStatus("Failed to submit survey.");
    }
  };

  return (
    <div
      className="feedback-wrapper"
      style={{
        backgroundImage: "linear-gradient(135deg, rgb(255, 255, 255), rgb(168, 241, 255))",
      }}
    >
      <Feedbacknavbar title="Survey" />
      <div className="survey-container">
        <h2>Survey</h2>

        {questions.length === 0 ? (
          <p className="error-message">{status || "No questions available."}</p>
        ) : (
          <form className="survey-form" onSubmit={handleSubmit}>
            {questions.map((q) => (
              <div key={q.question_id} className="question-block">
                <p className="question-text">{q.question_text}</p>

                <div className="slider-row">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={responses[q.question_id]}
                    onChange={(e) =>
                      handleRating(q.question_id, parseInt(e.target.value, 10))
                    }
                    className="rating-slider"
                  />
                  <span className="slider-value">{responses[q.question_id]}</span>
                </div>

                <div className="slider-labels">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            ))}
            <button type="submit" className="survey-submit">
              Submit Survey
            </button>
          </form>
        )}

        {status && <p className="success-message">{status}</p>}
      </div>
    </div>
  );
};

export default SurveyForm;
