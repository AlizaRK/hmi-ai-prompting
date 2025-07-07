import React, { useState } from 'react';
import Select from 'react-select'

const RegistrationForm = ({ onRegistrationComplete }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    education: '',
    frequency: '',
    english: '',
    usage: [],
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.education}
              onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
            >
              <option value="">Select...</option>
              <option value="high-school">High School</option>
              <option value="bachelors">Bachelor's Degree</option>
              <option value="masters">Master's Degree</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How often do you use AI systems?</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
            >
              <option value="">Select...</option>
              <option value="never">Never</option>
              <option value="rarely">Rarely</option>
              <option value="sometimes">Sometimes</option>
              <option value="often">Often</option>
              <option value="always">Always</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How fluent are you in English?</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.english}
              onChange={(e) => setFormData(prev => ({ ...prev, english: e.target.value }))}
            >
              <option value="">Select...</option>
              <option value="native">Native</option>
              <option value="fluent">Fluent</option>
              <option value="intermediate">Intermediate</option>
              <option value="beginner">Beginner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What do you use AI for?</label>
            <Select
              isMulti
              options={[
                { value: 'work', label: 'Work' },
                { value: 'teaching', label: 'Teaching' },
                { value: 'learning', label: 'Learning' },
                { value: 'research', label: 'Research' },
                { value: 'chatting', label: 'Chatting for fun' },
                { value: 'generating-images', label: 'Generating Images' },
                { value: 'planning', label: 'Planning' },
              ]}
              value={formData.usage} // formData.usage must be an array of selected options (objects)
              onChange={(selected) => setFormData(prev => ({ ...prev, usage: selected || [] }))}
              className="w-full"
              classNamePrefix="react-select"
              placeholder="Select..."
            />
          </div>


          <div className="flex items-start space-x-3 pt-4">
            <input
              type="checkbox"
              id="consent"
              required
              className="mt-1"
              checked={formData.consent}
              onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I have read and understood the informed consent information above. I voluntarily agree to participate in this research study.
            </label>
          </div>

          <button
            type="button"
            disabled={!formData.consent || !formData.fullName || !formData.age || !formData.gender || !formData.education}
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

export default RegistrationForm;