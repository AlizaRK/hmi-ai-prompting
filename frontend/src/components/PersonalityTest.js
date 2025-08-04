import React, { useState } from 'react';
import { CheckCircle, User, ArrowRight } from 'lucide-react';
import axios from 'axios';

const PersonalityTest = ({ onComplete }) => {
  const [responses, setResponses] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // BFI-10 Items (Rammstedt & John, 2007)
  const items = [
    { id: 1, text: "I see myself as someone who is reserved", dimension: "extraversion", reverse: true },
    { id: 2, text: "I see myself as someone who is generally trusting", dimension: "agreeableness", reverse: false },
    { id: 3, text: "I see myself as someone who tends to be lazy", dimension: "conscientiousness", reverse: true },
    { id: 4, text: "I see myself as someone who is relaxed, handles stress well", dimension: "neuroticism", reverse: true },
    { id: 5, text: "I see myself as someone who has few artistic interests", dimension: "openness", reverse: true },
    { id: 6, text: "I see myself as someone who is outgoing, sociable", dimension: "extraversion", reverse: false },
    { id: 7, text: "I see myself as someone who tends to find fault with others", dimension: "agreeableness", reverse: true },
    { id: 8, text: "I see myself as someone who does a thorough job", dimension: "conscientiousness", reverse: false },
    { id: 9, text: "I see myself as someone who gets nervous easily", dimension: "neuroticism", reverse: false },
    { id: 10, text: "I see myself as someone who has an active imagination", dimension: "openness", reverse: false }
  ];

  const itemsPerPage = 5;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handleResponse = (itemId, value) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: parseInt(value)
    }));
  };

  const calculateResults = () => {
    const dimensions = {
      extraversion: [],
      agreeableness: [],
      conscientiousness: [],
      neuroticism: [],
      openness: []
    };

    items.forEach(item => {
      const response = responses[item.id];
      if (response !== undefined) {
        const score = item.reverse ? (6 - response) : response;
        dimensions[item.dimension].push(score);
      }
    });

    const averages = {};
    Object.keys(dimensions).forEach(dim => {
      const scores = dimensions[dim];
      averages[dim] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    });

    return averages;
  };

  const sendToBackend = async (personalityData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const participant_id = user.participant_id;
      
      if (!participant_id) {
        throw new Error('User not found. Please log in again.');
      }

      // Prepare payload according to your backend API
      const payload = {
        participant_id: participant_id,
        responses: personalityData.responses,
        dimensions: personalityData.dimensions
      };

      console.log('Sending personality test data:', payload);

      // Call your backend API
      const response = await axios.post(
        'https://hmi-backend-env.eba-rrkbxtkb.eu-central-1.elasticbeanstalk.com/submit-personality-test',
        payload
      );
      
      console.log('Personality test submitted successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Error saving personality data:', error);
      
      let errorMessage = 'Failed to save personality test results. ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      try {
        // Calculate results
        const calculatedResults = calculateResults();
        
        // Prepare data object for backend
        const personalityData = {
          timestamp: new Date().toISOString(),
          responses: responses, // Raw responses (1-5 for each item)
          items: items, // Include items for context (which items were reverse-scored, etc.)
          dimensions: calculatedResults, // Calculated dimension scores
          metadata: {
            testVersion: 'BFI-10',
            totalItems: items.length,
            completedItems: Object.keys(responses).length,
            testDuration: null // Could track this if needed
          }
        };
        
        // Send to backend
        const result = await sendToBackend(personalityData);
        
        // Proceed to tasks on success
        if (onComplete) {
          onComplete({
            ...calculatedResults,
            testId: result.test_id // Include the test ID from backend response
          });
        }
        
      } catch (error) {
        // Error is already handled in sendToBackend
        // User can see the error message and try again
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getCurrentPageItems = () => {
    const startIndex = currentPage * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const isCurrentPageComplete = () => {
    const currentItems = getCurrentPageItems();
    return currentItems.every(item => responses[item.id] !== undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <User size={32} className="text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Personality Assessment</h1>
          <p className="text-gray-600 mb-4">
            Please rate how well each statement describes you
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="mb-2">
              <strong>Based on:</strong> Big Five Inventory-10 (BFI-10) by Rammstedt & John (2007)
            </p>
            <p className="text-xs">
              A scientifically validated brief measure of the five major personality dimensions
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Page {currentPage + 1} of {totalPages}</span>
            <span>{Object.keys(responses).length}/10 questions completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {getCurrentPageItems().map((item, index) => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {currentPage * itemsPerPage + index + 1}. {item.text}
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-2">
                {[
                  { value: 1, label: "Strongly Disagree" },
                  { value: 2, label: "Disagree" },
                  { value: 3, label: "Neither Agree nor Disagree" },
                  { value: 4, label: "Agree" },
                  { value: 5, label: "Strongly Agree" }
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-200"
                    style={{
                      borderColor: responses[item.id] === option.value ? '#3B82F6' : '#E5E7EB',
                      backgroundColor: responses[item.id] === option.value ? '#EFF6FF' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name={`item-${item.id}`}
                      value={option.value}
                      checked={responses[item.id] === option.value}
                      onChange={(e) => handleResponse(item.id, e.target.value)}
                      className="mr-3"
                      disabled={isSubmitting}
                    />
                    <div>
                      <div className="font-medium text-gray-800">{option.value}</div>
                      <div className="text-sm text-gray-600">{option.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0 || isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={!isCurrentPageComplete() || isSubmitting}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : currentPage === totalPages - 1 ? (
              <>
                <CheckCircle size={20} />
                Continue to Tasks
              </>
            ) : (
              <>
                Next
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* Footer Citation */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Rammstedt, B., & John, O. P. (2007). Measuring personality in one minute or less: A 10-item short version of the Big Five Inventory in English and German. <em>Journal of Research in Personality, 41</em>(1), 203-212.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalityTest;