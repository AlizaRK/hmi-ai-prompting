import React from 'react';
import { X, LogOut } from 'lucide-react';

const AccountPanel = ({ user, onLogout, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Account Details</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Name:</span>
          <span className="ml-2 font-medium">{user.fullName}</span>
        </div>
        <div>
          <span className="text-gray-600">Age:</span>
          <span className="ml-2 font-medium">{user.age}</span>
        </div>
        <div>
          <span className="text-gray-600">Education:</span>
          <span className="ml-2 font-medium capitalize">{user.education.replace('-', ' ')}</span>
        </div>
      </div>
      
      <hr className="my-3" />
      
      <button
        onClick={onLogout}
        className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm w-full"
      >
        <LogOut size={14} />
        <span>End Study Session</span>
      </button>
    </div>
  );
};

export default AccountPanel;