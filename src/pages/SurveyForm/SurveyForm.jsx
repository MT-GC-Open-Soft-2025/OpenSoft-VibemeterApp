import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser"; // Optional if not using EmailJS
import "./SurveyForm.css";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar";
import axios from "axios";
import Swal from 'sweetalert2'



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
    console.log(responses)
    
    
    const payload = Object.fromEntries(
      Object.entries(responses).map(([question_id, rating]) => [`Q${question_id}`, rating])
    );
    
    console.log("PAYLOAD",payload)

    console.log("Submitting payload:", JSON.stringify(payload, null, 2));
    

    const res = await axios.post("http://127.0.0.1:8000/chat/add_feedback", payload, {
  })
    setStatus(res.status);
    console.log(res)


    // Show SweetAlert success
    Swal.fire({
      icon: 'success',
      title: 'Thank you!',
      text: 'Your feedback has been submitted.',
      confirmButtonColor: '#36ABAA',
    }).then(() => {
      const initialResponses = {};
      questions.forEach(q => initialResponses[q.id] = 3);
      setResponses(initialResponses);

      navigate("/user");
    })

    
  }

  catch (error) {
    console.error("Error:", error);
    setStatus("Failed to take feedback.");

    // Show SweetAlert error
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Failed to submit feedback. Please try again later!',
      confirmButtonColor: '#d33',
  })

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

        {status && <p className="success-message ">{status==200?"Added Sucessfully":"Failed to Add"}</p>}
      </div>
    </div>
  );
};

export default SurveyForm;
