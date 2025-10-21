// src/components/modals/DescriptionModal.tsx
import React from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import { htmlToFullText } from '@/utils/htmlTextFormatter';

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  htmlContent: string;
}

const DescriptionModal: React.FC<DescriptionModalProps> = ({
  isOpen,
  onClose,
  title,
  htmlContent
}) => {
  if (!isOpen) return null;

//   const fullText = htmlToFullText(htmlContent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] rounded-lg bg-white shadow-xl dark:bg-gray-dark overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <HiOutlineXMark className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-120px)]">
            <div
                className="prose dark:prose-invert max-w-none prose-sm prose-p:text-gray-700 dark:prose-p:text-gray-300"
                dangerouslySetInnerHTML={{
                __html: htmlContent,
                }}
            />
        </div>

        {/* Footer */}
        <div className="border-t border-stroke px-6 py-4 dark:border-dark-3">
          <button
            onClick={onClose}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DescriptionModal;