import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser"; // Optional if not using EmailJS
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

  // Simulate or fetch from your real backend
  const fetchQuestions = async () => {
    try {
      // Example: 5 questions
      const data = [
        { id: 1, text: "How satisfied are you with our service?" },
        { id: 2, text: "How do you rate our product quality?" },
        { id: 3, text: "How do you rate our customer support?" },
        { id: 4, text: "How do you rate our website usability?" },
        { id: 5, text: "How likely are you to recommend us?" },
      ];
      setQuestions(data);

      // Initialize all ratings to 3
      const initial = {};
      data.forEach((q) => (initial[q.id] = 3));
      setResponses(initial);
    } catch (error) {
      console.error("Error fetching questions:", error);
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
    <div className="feedback-wrapper" style={{backgroundImage: "linear-gradient(135deg, rgb(255, 255, 255), rgb(168, 241, 255))"}}>
      <Feedbacknavbar title="Survey" />
      <div className="survey-container">
        <h2>Survey</h2>
        <form className="survey-form" onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div key={q.id} className="question-block">
              <p className="question-text">{q.text}</p>

              {/* SLIDER + CURRENT VALUE */}
              <div className="slider-row">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={responses[q.id]}
                  onChange={(e) =>
                    handleRating(q.id, parseInt(e.target.value, 10))
                  }
                  className="rating-slider"
                />
                <span className="slider-value">{responses[q.id]}</span>
              </div>

              {/* LABELS 1–5 UNDERNEATH */}
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

        {status && <p className="success-message">{status}</p>}
      </div>
    </div>
  );
};

export default SurveyForm;
