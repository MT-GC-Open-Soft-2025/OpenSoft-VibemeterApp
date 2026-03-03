import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'animate.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

const Start = lazy(() => import('./pages/Loginpage/Start'));
const AdminPage = lazy(() => import('./pages/AdminPage/AdminPage'));
const UserPage = lazy(() => import('./pages/UserPage/UserPage'));
const SurveyForm = lazy(() => import('./pages/SurveyForm/SurveyForm'));
const ChatPage = lazy(() => import('./pages/ChatPage/ChatPage'));
const FeedbackPage = lazy(() => import('./pages/Feedbackpage/Feedbackpage'));
const ContactForm = lazy(() => import('./pages/ContactPage/ContactForm'));

function LoadingFallback() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
    });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <a href="#main-content" className="visually-hidden-focusable skip-link">
              Skip to main content
            </a>
            <main id="main-content">
              <Routes>
                <Route path="/" element={<Start />} />
                <Route path="/login" element={<Start />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user"
                  element={
                    <ProtectedRoute>
                      <UserPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/surveyform"
                  element={
                    <ProtectedRoute>
                      <SurveyForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/feedback"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <FeedbackPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/contact" element={<ContactForm />} />
              </Routes>
            </main>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
