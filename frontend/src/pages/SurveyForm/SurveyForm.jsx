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
  const [answers, setAnswers] = useState({}); 
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

      
      const response = await axios.get(`${baseUrl}/chat/feedback`, {
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

      // Initialize answers with default value 3
      const initialAnswers = {};
      data.forEach((q) => (initialAnswers[q.question_id] = 3));
      setAnswers(initialAnswers);
    } catch (error) {
      console.error("Error fetching questions:", error.response?.data || error.message);
      setStatus("Failed to load questions.");
    }
  };

  const handleRating = (questionId, rating) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: rating,
    }));
  };
  
  
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log(answers)
    
    
    const payload = Object.fromEntries(
      Object.entries(answers).map(([question_id, rating]) => [`${question_id}`, rating])
    );
    
    console.log("PAYLOAD",payload)

    console.log("Submitting payload:", JSON.stringify(payload, null, 2));
    

    const res = await axios.post(`${baseUrl}/chat/add_feedback`, payload, {
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
      const initialAnswers = {};
      questions.forEach(q => initialAnswers[q.id] = 3);
      setAnswers(initialAnswers);

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
    <div className="feedback-wrapper">
      <Feedbacknavbar title="Survey" />
      <div className="survey-container bg-white shadow-sm rounded-4 p-4 p-md-5 mx-auto">
        <h2 className="mb-4 text-center text-dark">Survey</h2>
        <form className="survey-form" onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div key={q.question_id} className="question-block mb-5">
              <p className="question-text fw-semibold fs-5 text-dark mb-3">{q.question_text}</p>

              <div className="segmented-pill-control d-flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => {
                  const currentResponse = answers[q.question_id] !== undefined ? answers[q.question_id] : 3;
                  const isSelected = currentResponse === score;
                  return (
                    <button
                      key={score}
                      type="button"
                      className={`pill-btn flex-fill py-2 rounded-pill fw-medium transition-all ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleRating(q.question_id, score)}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button type="submit" className="survey-submit mt-4 rounded-pill fw-bold text-white w-100 py-3 border-0 transition-all">
            Submit Survey
          </button>
        </form>

        {status && <p className="success-message text-center mt-3">{status == 200 ? "Added Successfully" : "Failed to Add"}</p>}
      </div>
    </div>
  );
};

export default SurveyForm;
