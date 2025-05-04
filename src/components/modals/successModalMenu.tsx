import React from 'react';

interface SuccessModalMenuProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  status: 'success' | 'error';
}

const SuccessModalMenu: React.FC<SuccessModalMenuProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText,
  onButtonClick,
  status
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg relative z-10 w-full max-w-md">
        {/* Icon container with background */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Background circular gradient */}
            <div className={`absolute -inset-1 rounded-full opacity-30 ${status === 'success' ? 'bg-green-300' : 'bg-red-300'}`}></div>
            
            {/* Small dots around the circle */}
            <div className="absolute -inset-4 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-400' : 'bg-red-400'} absolute top-0`}></div>
              <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-400' : 'bg-red-400'} absolute top-2 right-2`}></div>
              <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-400' : 'bg-red-400'} absolute right-0`}></div>
              <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-400' : 'bg-red-400'} absolute bottom-2 right-2`}></div>
              <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-400' : 'bg-red-400'} absolute bottom-0`}></div>
              <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-400' : 'bg-red-400'} absolute bottom-2 left-2`}></div>
              <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-400' : 'bg-red-400'} absolute left-0`}></div>
              <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-400' : 'bg-red-400'} absolute top-2 left-2`}></div>
            </div>
            
            {/* Main circle with icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {status === 'success' ? (
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}
            </div>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-center mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        
        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          {message}
        </p>
        
        {/* Small dot indicator */}
        <div className="flex justify-center mb-6 space-x-1">
          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
        </div>
        
        {/* Button */}
        <button 
          onClick={onButtonClick} 
          className={`w-full py-3 px-4 rounded-md ${
            status === 'success' 
              ? 'bg-gradient-to-r from-[#0C479F] to-[#1D92F9] hover:from-[#0C479F] hover:to-[#0C479F]' 
              : 'bg-gradient-to-r from-red-600 to-red-400 hover:from-red-600 hover:to-red-600'
          } text-white font-medium`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessModalMenu;