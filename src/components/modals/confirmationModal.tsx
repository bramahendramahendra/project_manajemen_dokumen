import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl max-w-md w-full mx-4 overflow-hidden shadow-xl">
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          {/* Icon container with warning background */}
          <div className="relative mb-6">
            {/* Background circular gradient */}
            <div className="absolute inset-0 bg-yellow-500 rounded-full opacity-20"></div>
            
            {/* Small dots around the circle */}
            <div className="absolute w-2 h-2 bg-yellow-500 rounded-full -top-1 left-1/2 -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 bg-yellow-500 rounded-full top-1/4 -right-1"></div>
            <div className="absolute w-2 h-2 bg-yellow-500 rounded-full -bottom-1 left-1/2 -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 bg-yellow-500 rounded-full top-1/4 -left-1"></div>
            
            {/* Main circle with question mark */}
            <div className="w-16 h-16 flex items-center justify-center bg-yellow-500 rounded-full relative z-10">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 text-lg mb-8">
            {message}
          </p>
          
          {/* Buttons */}
          <div className="flex gap-4 w-full">
            <button
              onClick={onClose}
              className="w-1/2 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-lg font-medium rounded-xl transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="w-1/2 py-3 bg-gradient-to-r from-[#0C479F] to-[#1D92F9] hover:from-[#0A3A7F] hover:to-[#1A7FD9] text-white text-lg font-medium rounded-xl transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;