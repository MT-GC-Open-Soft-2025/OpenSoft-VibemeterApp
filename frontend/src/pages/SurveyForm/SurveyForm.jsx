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
      <div className="survey-container">
        <h2 className="mb-4 text-center" style={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', fontSize: '2.2rem' }}>We Value Your Feedback</h2>
        <p className="text-center text-muted mb-5" style={{ fontSize: '0.95rem' }}>Your thoughts help us improve WellBee for everyone.</p>

        {errorMessage && (
          <div className="alert alert-danger py-2 mb-4" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="survey-form" onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div key={q.question_id} className="question-block">
              <p className="question-text">
                {q.question_text}
              </p>
              <div
                className="segmented-pill-control"
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
                      className={`pill-btn ${isSelected ? 'selected' : ''}`}
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
            className="survey-submit w-100"
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
