import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SurveyForm.css';
import Feedbacknavbar from '../../components/Feedback_navbar/Feedbacknavbar';
import { useSurvey } from '../../hooks/useSurvey';
import Swal from 'sweetalert2';
/* Bootstrap imported once in App.js */

const SurveyForm = () => {
  const navigate = useNavigate();
  const { questions, answers, status, errorMessage, setAnswer, submitSurvey } = useSurvey();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitSurvey();
    if (result.ok) {
      /* Swal only for the success confirm — it's a navigating action */
      Swal.fire({
        icon: 'success',
        title: 'Thank you!',
        text: 'Your feedback has been submitted.',
        confirmButtonColor: '#0f766e',
      }).then(() => navigate('/user'));
    }
    /* Error is surfaced via inline errorMessage state */
  };

  if (status === 'loading') {
    return (
      <div className="feedback-wrapper">
        <Feedbacknavbar title="Survey" />
        <div className="survey-loading">Loading questions…</div>
      </div>
    );
  }

  return (
    <div className="feedback-wrapper">
      <Feedbacknavbar title="Survey" />
      <div className="survey-container bg-white shadow-sm rounded-4 p-4 p-md-5 mx-auto">
        <h2 className="mb-4 text-center text-dark">Survey</h2>

        {errorMessage && (
          <div className="alert alert-danger py-2 mb-4" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="survey-form" onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div key={q.question_id} className="question-block mb-5">
              <p className="question-text fw-semibold fs-5 text-dark mb-3">
                {q.question_text}
              </p>
              <div
                className="segmented-pill-control d-flex gap-2"
                role="radiogroup"
                aria-label={q.question_text}
              >
                {[1, 2, 3, 4, 5].map((score) => {
                  const isSelected = (answers[q.question_id] ?? 3) === score;
                  return (
                    <button
                      key={score}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Score ${score}`}
                      className={`pill-btn flex-fill py-2 rounded-pill fw-medium ${isSelected ? 'selected' : ''}`}
                      onClick={() => setAnswer(q.question_id, score)}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="survey-submit mt-4 rounded-pill fw-bold text-white w-100 py-3 border-0"
            disabled={status === 'submitting' || questions.length === 0}
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit Survey'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SurveyForm;
