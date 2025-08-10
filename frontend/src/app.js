import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import ChatPage from './components/ChatPage';
import PostStudyQuestionnaire from './components/PostStudyQuestionare';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudyIntro from './components/StudyIntro';
import ThankYou from './components/ThankYou';
import PersonalityTest from './components/PersonalityTest';

const App = () => {
  const [user, setUser] = useState(null);

  const handleRegistrationComplete = (userData) => {
    setUser(userData);
  };

  const handleLoginComplete = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleEndStudy = () => {
    window.location.hash = '/post-study-questionnaire';
  };

  const handleQuestionnaireComplete = () => {
    window.location.hash = '/thank-you';
  };

  return (
    <HashRouter>
      <Routes>
        {/* Landing page */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/chat" replace /> : <LandingPage />
          }
        />

        {/* Login page */}
        <Route
          path="/login"
          element={
            user ?
              <Navigate to="/chat" replace /> :
              <LoginPage onLoginComplete={handleLoginComplete} />
          }
        />

        {/* Registration page */}
        <Route
          path="/register"
          element={
            user ?
              <Navigate to="/study-intro" replace /> :
              <RegistrationPage onRegistrationComplete={handleRegistrationComplete} />
          }
        />

        {/* Study Intro page */}
        <Route
          path="/study-intro"
          element={
            user ?
              <StudyIntro /> :
              <Navigate to="/" replace />
          }
        />

        {/* Post-Study Questionnaire page */}
        <Route
          path="/post-study-questionnaire"
          element={
            user ?
              <PostStudyQuestionnaire 
                user={user} 
                onComplete={handleQuestionnaireComplete} 
              /> :
              <Navigate to="/" replace />
          }
        />

        {/* Thank You page */}
        <Route
          path="/thank-you"
          element={
            user ?
              <ThankYou /> :
              <Navigate to="/" replace />
          }
        />

        {/* Chat page */}
        <Route
          path="/chat"
          element={
            user ?
              <ChatPage 
                user={user} 
                onLogout={handleLogout} 
                onEndStudy={handleEndStudy}
              /> :
              <Navigate to="/" replace />
          }
        />

        {/* Personality Test page */}
        <Route
          path="/personality-test"
          element={
            user ?
              <PersonalityTest onComplete={() => window.location.hash = '/chat'} /> :
              <Navigate to="/" replace />
          }
        />

        {/* Catch all other routes and redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;