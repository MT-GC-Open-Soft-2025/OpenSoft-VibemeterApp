/**
 * WellBee – useSurvey hook
 * Extracts question fetching and answer state from SurveyForm.jsx.
 */
import { useState, useEffect } from 'react';
import { getFeedbackQuestions, addFeedback } from '../api/chat';

export function useSurvey() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchQuestions() {
      setStatus('loading');
      try {
        const res = await getFeedbackQuestions();
        const data = res?.response || [];
        if (!Array.isArray(data) || data.length === 0) {
          setErrorMessage('No questions available.');
          setStatus('error');
          setQuestions([]);
          return;
        }
        const initialAnswers = {};
        data.forEach((q) => (initialAnswers[q.question_id] = 3));
        setQuestions(data);
        setAnswers(initialAnswers);
        setStatus('idle');
      } catch (error) {
        console.error('Error fetching questions:', error.response?.data || error.message);
        setErrorMessage('Failed to load questions. Please refresh and try again.');
        setStatus('error');
      }
    }
    fetchQuestions();
  }, []);

  const setAnswer = (questionId, rating) =>
    setAnswers((prev) => ({ ...prev, [questionId]: rating }));

  const submitSurvey = async () => {
    setStatus('submitting');
    setErrorMessage('');
    try {
      const payload = Object.fromEntries(
        Object.entries(answers).map(([question_id, rating]) => [`${question_id}`, rating])
      );
      await addFeedback(payload);
      setStatus('success');
      return { ok: true };
    } catch (error) {
      console.error('Survey submit error:', error);
      setErrorMessage('Failed to submit feedback. Please try again.');
      setStatus('error');
      return { ok: false };
    }
  };

  return {
    questions,
    answers,
    status,
    errorMessage,
    setAnswer,
    submitSurvey,
  };
}
