// ConsentPage.jsx

import React, { useState } from 'react';

const ConsentPage = ({ onConsentAccepted }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Informed Consent</h1>

        <div className="w-full aspect-[4/3] mb-6 max-w-full max-h-[720px] overflow-hidden rounded-md shadow-md">
          <iframe
            src="https://drive.google.com/file/d/1L4U0lRT4MS6PeTqdSxabzM74IFXl753-/preview"
            allow="autoplay"
            title="Informed Consent Document"
            className="w-full h-full border-0"
          ></iframe>
        </div>

        <div className="flex items-start space-x-3 mb-6">
          <input
            type="checkbox"
            id="consentCheckbox"
            className="mt-1"
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
          <label htmlFor="consentCheckbox" className="text-sm text-gray-700">
            I have read and understood the informed consent document. I voluntarily agree to participate.
          </label>
        </div>

        <button
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={!checked}
          onClick={onConsentAccepted}
        >
          Continue to Registration
        </button>
      </div>
    </div>
  );
};

export default ConsentPage;
