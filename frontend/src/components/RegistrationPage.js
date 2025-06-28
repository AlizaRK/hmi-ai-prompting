import React, { useState } from 'react';

const RegistrationPage = ({ onRegistrationComplete }) => {
  const [formData, setFormData] = useState({
    participantId: '',
    fullName: '',
    age: '',
    gender: '',
    education: '',
    consent: false
  });

  const handleSubmit = () => {
    if (formData.consent) {
      onRegistrationComplete(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Research Study Registration
        </h1>
        
        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Informed Consent</h2>
          <div className="text-sm text-gray-700 space-y-3 max-h-40 overflow-y-auto">
            <p><strong>Study Purpose:</strong> This research aims to understand how people interact with AI assistants in different contexts.</p>
            <p><strong>Participation:</strong> You will engage in conversations with AI assistants on various topics. Sessions may be recorded for analysis.</p>
            <p><strong>Risks & Benefits:</strong> Minimal risks are anticipated. Your participation helps advance AI research.</p>
            <p><strong>Confidentiality:</strong> All data will be anonymized and stored securely.</p>
            <p><strong>Voluntary Participation:</strong> You may withdraw at any time without penalty.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participant ID
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.participantId}
              onChange={(e) => setFormData(prev => ({...prev, participantId: e.target.value}))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                required
                min="18"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({...prev, age: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({...prev, gender: e.target.value}))}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.education}
              onChange={(e) => setFormData(prev => ({...prev, education: e.target.value}))}
            >
              <option value="">Select...</option>
              <option value="high-school">High School</option>
              <option value="bachelors">Bachelor's Degree</option>
              <option value="masters">Master's Degree</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-start space-x-3 pt-4">
            <input
              type="checkbox"
              id="consent"
              required
              className="mt-1"
              checked={formData.consent}
              onChange={(e) => setFormData(prev => ({...prev, consent: e.target.checked}))}
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I have read and understood the informed consent information above. I voluntarily agree to participate in this research study.
            </label>
          </div>

          <button
            type="button"
            disabled={!formData.consent || !formData.participantId || !formData.fullName || !formData.age || !formData.gender || !formData.education}
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Begin Study
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;