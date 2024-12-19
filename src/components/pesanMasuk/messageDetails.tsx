import React from 'react';

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
  if (!message) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No message selected
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">{message.subject}</h2>
      <p className="text-sm text-gray-500 mb-4">
        From: {message.sender} • {message.date}
      </p>
      <p className="text-gray-700">{message.content}</p>
    </div>
  );
};
