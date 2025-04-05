import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SurveyForm.css";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar";
import Swal from 'sweetalert2'
import baseUrl from "../../Config";



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

      
      const response = await axios.get("https://api.wellbee.live/chat/feedback", {
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

      // Initialize responses with default value 3
      const initialResponses = {};
      data.forEach((q) => (initialResponses[q.question_id] = 3));
      setResponses(initialResponses);
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
    console.log(responses)
    
    
    const payload = Object.fromEntries(
      Object.entries(responses).map(([question_id, rating]) => [`Q${question_id}`, rating])
    );
    
    console.log("PAYLOAD",payload)

    console.log("Submitting payload:", JSON.stringify(payload, null, 2));
    

    const res = await axios.post("https://api.wellbee.live/chat/add_feedback", payload, {
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
    <div className="feedback-wrapper" style={{ backgroundImage: "linear-gradient(135deg, rgb(255, 255, 255), rgb(168, 241, 255))" }}>
      <Feedbacknavbar title="Survey" />
      <div className="survey-container">
        <h2>Survey</h2>
        <form className="survey-form" onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div key={q.question_id} className="question-block">
              <p className="question-text">{q.question_text}</p>

              {/* SLIDER + CURRENT VALUE */}
              <div className="slider-row">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={responses[q.question_id] || 3}
                  onChange={(e) =>
                    handleRating(q.question_id, parseInt(e.target.value, 10))
                  }
                  className="rating-slider"
                />
                <span className="slider-value">{responses[q.question_id] || 3}</span>
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
        

        {status && <p className="success-message ">{status==200?"Added Sucessfully":"Failed to Add"}</p>}
      </div>
    </div>
  );
};

export default SurveyForm;
