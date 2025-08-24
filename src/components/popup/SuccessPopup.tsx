// components/SuccessPopup.tsx
import { useRouter } from 'next/navigation';

interface SuccessPopupProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  redirectUrl?: string;
  redirectButtonText?: string;
  stayButtonText?: string;
  onStay: () => void;
  onClose?: () => void;
}

const SuccessPopup = ({
  isOpen,
  title = "Data Berhasil Ditambahkan!",
  message = "Data berhasil ditambahkan ke dalam sistem.",
  redirectUrl,
  redirectButtonText = "Lihat Data",
  stayButtonText = "Tambah Data Lagi",
  onStay,
  onClose
}: SuccessPopupProps) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleRedirect = () => {
    if (redirectUrl) {
      router.push(redirectUrl);
    }
    if (onClose) onClose();
  };

  const handleStay = () => {
    onStay();
    if (onClose) onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleStay();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-dark rounded-[10px] shadow-1 dark:shadow-card p-6 max-w-md mx-4">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          
          {/* Success Message */}
          <h3 className="text-lg font-medium text-dark dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {message}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {redirectUrl && (
              <button
                onClick={handleRedirect}
                className="flex-1 rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] hover:from-[#0C479F] hover:to-[#0C479F] px-4 py-2 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {redirectButtonText}
              </button>
            )}
            <button
              onClick={handleStay}
              className="flex-1 rounded-[7px] border border-stroke bg-transparent px-4 py-2 text-sm font-medium text-dark dark:text-white dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {stayButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;