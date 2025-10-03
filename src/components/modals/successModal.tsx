// src/components/modals/successModal.tsx
import React, { useEffect } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText,
  onButtonClick
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-dark rounded-3xl max-w-md w-full shadow-2xl transform transition-all animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center px-8 pt-10 pb-8 text-center">
          {/* Success Icon with Animation */}
          <div className="relative mb-8">
            {/* Pulsing background circles */}
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 bg-green-500/10 rounded-full scale-125 animate-pulse"></div>
            
            {/* Decorative dots */}
            <div className="absolute w-2 h-2 bg-green-500 rounded-full -top-2 left-1/2 -translate-x-1/2 animate-bounce"></div>
            <div className="absolute w-2 h-2 bg-green-500 rounded-full top-1/4 -right-2 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute w-2 h-2 bg-green-500 rounded-full -bottom-2 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute w-2 h-2 bg-green-500 rounded-full top-1/4 -left-2 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            
            {/* Main circle with checkmark */}
            <div className="relative w-20 h-20 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/50">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-white animate-checkmark" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 text-base mb-8 leading-relaxed">
            {message}
          </p>
          
          {/* Decorative divider */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
          
          {/* Button */}
          <button
            onClick={onButtonClick}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            {buttonText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes checkmark {
          0% {
            stroke-dasharray: 0, 100;
          }
          100% {
            stroke-dasharray: 100, 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-checkmark {
          stroke-dasharray: 100;
          animation: checkmark 0.5s ease-in-out 0.3s forwards;
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;