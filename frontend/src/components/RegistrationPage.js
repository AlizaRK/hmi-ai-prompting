// RegistrationPage.jsx

import React, { useState } from 'react';
import ConsentPage from './ConsentPage';
import RegistrationForm from './RegistrationForm';

const RegistrationPage = ({ onRegistrationComplete }) => {
  const [consentGiven, setConsentGiven] = useState(false);

  return consentGiven ? (
    <RegistrationForm onRegistrationComplete={onRegistrationComplete} />
  ) : (
    <ConsentPage onConsentAccepted={() => setConsentGiven(true)} />
  );
};

export default RegistrationPage;
