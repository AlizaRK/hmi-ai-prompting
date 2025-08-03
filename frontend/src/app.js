import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import ChatPage from './components/ChatPage';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudyIntro from './components/StudyIntro';

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

        <Route
          path="/study-intro"
          element={
            user ?
              <StudyIntro /> :
              <Navigate to="/" replace />
          }
        />

        {/* Chat page */}
        <Route
          path="/chat"
          element={
            user ?
              <ChatPage user={user} onLogout={handleLogout} /> :
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