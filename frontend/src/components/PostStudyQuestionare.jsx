import React, { useState } from 'react';
import axios from 'axios';

const PostStudyQuestionnaire = ({ user, onComplete }) => {
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      id: 'ai_responses_helpful',
      question: 'The AI\'s responses were helpful in completing the task I was working on.'
    },
    {
      id: 'satisfied_response_quality',
      question: 'I am satisfied with the overall quality of the AI\'s responses to my prompts.'
    },
    {
      id: 'responses_matched_intent',
      question: 'The AI\'s responses accurately matched what I intended to get from my prompts.'
    },
    {
      id: 'trust_ai_accuracy',
      question: 'I trust the accuracy and reliability of the information provided by the AI in its responses.'
    },
    {
      id: 'would_use_future',
      question: 'I would use AI tools like this for similar everyday tasks in the future.'
    },
    {
      id: 'ai_importance_increased',
      question: 'After using this AI tool, I believe AI technology has become more important in my daily life.'
    }
  ];

  const scaleOptions = [
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Agree' },
    { value: 5, label: 'Strongly Agree' }
  ];

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !responses[q.id]);
    if (unansweredQuestions.length > 0) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('https://api.hmi-ai-prompting.shop/submit-post-study-questionnaire', {
        participant_id: user.participant_id,
        responses: responses
      });
      
      alert('Thank you! Your responses have been submitted successfully.');
      onComplete();
    } catch (error) {
      console.error('Failed to submit questionnaire:', error);
      alert('There was an error submitting your responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCompletionPercentage = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Post-Study Questionnaire</h1>
            <p className="text-gray-600 mb-4">
              Thank you for participating in our AI assistant study, {user?.fullName}! 
              Please share your experience and feedback.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Progress: {getCompletionPercentage()}% complete
            </p>
          </div>

          <div className="space-y-8">
            <p className="text-sm text-gray-600 italic mb-6">
              Please rate each statement using the scale: 1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree
            </p>

            {questions.map((question, index) => (
              <div key={question.id} className="bg-gray-50 p-6 rounded-lg">
                <label className="block text-lg font-medium text-gray-800 mb-4">
                  {index + 1}. {question.question}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {scaleOptions.map((option) => (
                    <label key={option.value} className="flex flex-col items-center space-y-2 cursor-pointer p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={responses[question.id] === option.value}
                        onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
                        className="text-blue-600 focus:ring-blue-500 scale-125"
                      />
                      <span className="text-center text-sm font-medium text-gray-700">
                        {option.value}
                      </span>
                      <span className="text-center text-xs text-gray-500 leading-tight">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {Object.keys(responses).length} of {questions.length} questions answered
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  All questions are required
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(responses).length < questions.length}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Questionnaire</span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Your responses are anonymous and will help us improve AI assistant interactions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostStudyQuestionnaire;