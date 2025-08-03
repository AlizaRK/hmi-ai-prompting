import React from 'react';
import { CheckCircle, Heart, Users, Award } from 'lucide-react';

const FinalPage = ({ user, onBackToStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle size={64} className="text-green-600" />
          </div>
        </div>

        {/* Main Thank You Message */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Thank You for Participating!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Your contribution to this AI interaction study is greatly appreciated.
        </p>

        {/* Participant Info */}
        {user && (
          <div className="bg-blue-50 rounded-lg p-4 mb-8">
            <p className="text-gray-700">
              <span className="font-semibold">Participant:</span> {user.fullName}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Study completed on:</span> {new Date().toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Study Impact Message */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col items-center p-4">
            <Users size={32} className="text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-800 mb-1">Research Impact</h3>
            <p className="text-sm text-gray-600 text-center">
              Your interactions help improve AI systems for everyone
            </p>
          </div>
          
          <div className="flex flex-col items-center p-4">
            <Heart size={32} className="text-red-500 mb-2" />
            <h3 className="font-semibold text-gray-800 mb-1">Valuable Data</h3>
            <p className="text-sm text-gray-600 text-center">
              Every response contributes to better human-AI understanding
            </p>
          </div>
          
          <div className="flex flex-col items-center p-4">
            <Award size={32} className="text-yellow-600 mb-2" />
            <h3 className="font-semibold text-gray-800 mb-1">Session Ended</h3>
            <p className="text-sm text-gray-600 text-center">
              Thank you for your participation in this study
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Your data will be analyzed as part of our research into AI interaction patterns
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              All responses are kept confidential and used solely for research purposes
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Results from this study may be published in academic research
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="text-gray-600 mb-8">
          <p className="text-sm">
            If you have any questions about this study, please contact our research team.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">


          <strong>You can close this window now.</strong> 
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Frankfurt University of Applied Sciences, Human-Computer Interaction SoSe'25
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinalPage;