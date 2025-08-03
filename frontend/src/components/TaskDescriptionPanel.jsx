import React from 'react';
import { X } from 'lucide-react';

const TaskDescriptionPanel = ({ description, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-72 z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">Task Description</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <div className="text-sm text-gray-700 whitespace-pre-line">
        {description || 'No description provided.'}
      </div>
    </div>
  );
};

export default TaskDescriptionPanel;
