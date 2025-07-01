// MessageList.jsx
import React from "react";

interface Message {
  id: number;
  sender: string;
  date: string;
  subject: string;
  content: string;
}

type MessageListProps = {
  messages: Message[];
  activeMessage: Message | null;
  onMessageSelect: (message: Message) => void;
  isSearching?: boolean;
  noResults?: boolean;
  searchTerm?: string;
};

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  activeMessage,
  onMessageSelect,
  isSearching = false,
  noResults = false,
  searchTerm = "",
}) => {
  if (noResults && isSearching) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <div className="text-gray-400 text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400 mb-3" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          <p className="text-sm font-medium">Tidak ada hasil untuk</p>
          <p className="mt-1 text-base font-semibold">&quot;{searchTerm}&quot;</p>
          <p className="mt-4 text-xs text-gray-500">
            Coba cari dengan kata kunci lain
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {messages.map((message, index) => (
        <div
          key={message.id}
          onClick={() => onMessageSelect(message)}
          className={`cursor-pointer p-4 text-dark-4 hover:bg-gray-100 ${
            index !== 0 ? "border-t" : ""
          } ${index !== messages.length - 1 ? "border-b" : ""} ${
            activeMessage?.id === message.id ? "bg-gray-200" : ""
          } ${index === 0 ? "rounded-tl-[0px]" : ""} ${
            index === messages.length - 1 ? "rounded-bl-[0px]" : ""
          }`}
        >
          <h4 className="font-bold">{message.subject}</h4>
          <p className="text-sm text-gray-500">{message.sender}</p>
        </div>
      ))}
    </div>
  );
};