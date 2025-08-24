import React from 'react';
import { useRouter } from 'next/navigation';

interface SuccessModalLinkProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  showTwoButtons?: boolean; // New prop to show two buttons
  primaryButtonText?: string; // Text for primary button (redirect)
  secondaryButtonText?: string; // Text for secondary button (stay)
  onButtonClick?: () => void; // Optional custom handler
  redirectPath?: string; // Optional redirect path
}

const SuccessModalLink: React.FC<SuccessModalLinkProps> = ({
  isOpen,
  onClose,
  title,
  message,
  showTwoButtons = false,
  primaryButtonText = "OK",
  secondaryButtonText = "Tetap di Halaman",
  onButtonClick,
  redirectPath
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handlePrimaryButtonClick = () => {
    // Execute custom onButtonClick if provided
    if (onButtonClick) {
      onButtonClick();
    }
    
    // Navigate to redirectPath if provided
    if (redirectPath) {
      router.push(redirectPath);
    }
    
    // Close modal
    onClose();
  };

  const handleSecondaryButtonClick = () => {
    // Just close modal, stay on current page
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl max-w-md w-full mx-4 overflow-hidden shadow-xl">
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          {/* Icon container with green background */}
          <div className="relative mb-6">
            {/* Background circular gradient */}
            <div className="absolute inset-0 bg-green-500 rounded-full opacity-20"></div>
            
            {/* Small dots around the circle */}
            <div className="absolute w-2 h-2 bg-green-500 rounded-full -top-1 left-1/2 -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 bg-green-500 rounded-full top-1/4 -right-1"></div>
            <div className="absolute w-2 h-2 bg-green-500 rounded-full -bottom-1 left-1/2 -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 bg-green-500 rounded-full top-1/4 -left-1"></div>
            
            {/* Main circle with checkmark */}
            <div className="w-16 h-16 flex items-center justify-center bg-green-500 rounded-full relative z-10">
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
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 text-lg mb-8">
            {message}
          </p>
          
          {/* Small dot indicator */}
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mb-6"></div>
          
          {/* Buttons */}
          {showTwoButtons ? (
            <div className="w-full space-y-3">
              {/* Primary Button (Redirect) */}
              <button
                onClick={handlePrimaryButtonClick}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-xl transition-colors"
              >
                {primaryButtonText}
              </button>
              
              {/* Secondary Button (Stay) */}
              <button
                onClick={handleSecondaryButtonClick}
                className="w-full py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 text-lg font-medium rounded-xl transition-colors"
              >
                {secondaryButtonText}
              </button>
            </div>
          ) : (
            /* Single Button */
            <button
              onClick={handlePrimaryButtonClick}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-medium rounded-xl transition-colors"
            >
              {primaryButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessModalLink;

// Usage examples:

/* 
// 1. With two buttons (redirect option + stay option)
<SuccessModal
  isOpen={isSuccessModalOpen}
  onClose={handleCloseModal}
  title="Berhasil!"
  message="User baru telah berhasil ditambahkan ke dalam sistem."
  showTwoButtons={true}
  primaryButtonText="Ke Halaman User Management"
  secondaryButtonText="Tambah User Lagi"
  redirectPath="/user_management"
/>

// 2. Single button with redirect
<SuccessModal
  isOpen={isSuccessModalOpen}
  onClose={handleCloseModal}
  title="Berhasil!"
  message="Data berhasil disimpan!"
  primaryButtonText="Kembali ke Dashboard"
  redirectPath="/dashboard"
/>

// 3. Single button without redirect (just close)
<SuccessModal
  isOpen={isSuccessModalOpen}
  onClose={handleCloseModal}
  title="Berhasil!"
  message="Operasi berhasil diselesaikan!"
  primaryButtonText="OK"
/>
*/