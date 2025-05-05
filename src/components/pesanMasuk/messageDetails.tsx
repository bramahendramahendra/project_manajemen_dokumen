import React, { useState } from 'react';
import SuccessModal from '../modals/successModal';

interface Message {
  id: number;
  sender: string;
  date: string;
  subject: string;
  content: string;
}

type MessageDetailProps = {
  message: Message | null;
};

export const MessageDetail: React.FC<MessageDetailProps> = ({ message }) => {
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  // Mengubah dari sendSuccess menjadi isModalOpen untuk mengontrol modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!message) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-500">
        No message selected
      </div>
    );
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyText.trim()) return;
    
    setIsSending(true);
    
    try {
      // Simulasi pengiriman pesan (ganti dengan API call sebenarnya)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sukses - buka modal sukses
      setIsModalOpen(true);
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Message content area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800">{message.subject}</h2>
        <p className="text-sm text-gray-500 mb-4">
          From: {message.sender} • {message.date}
        </p>
        <div className="text-gray-700 pb-4">
          {message.content}
        </div>
      </div>
      
      {/* Reply form area */}
      <div className="sticky bottom-0 left-0 right-0 w-full border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleReplySubmit} className="w-full p-6">
          <div className="mb-3">
            <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
              Reply to {message.sender}
            </label>
            <textarea
              id="reply"
              rows={1}
              className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="flex justify-between items-center w-full">
            <button
              type="submit"
              disabled={isSending || !replyText.trim()}
              className={`ml-auto px-5 py-2.5 text-sm font-medium text-white rounded-md focus:outline-none ${
                isSending || !replyText.trim()
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : 'Send Reply'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Success Modal */}
      <SuccessModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Pesan Terkirim"
        message={`Balasan kepada ${message.sender} telah berhasil dikirim.`}
        buttonText="Kembali"
        onButtonClick={handleCloseModal}
      />
    </div>
  );
};