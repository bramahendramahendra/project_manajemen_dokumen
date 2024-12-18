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
};

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  activeMessage,
  onMessageSelect,
}) => {
  return (
    <>
    <div>
      {messages.map((message, index) => (
        <div
          key={message.id}
          onClick={() => onMessageSelect(message)}
          className={`cursor-pointer p-4 text-dark-4 hover:bg-gray-100 ${index !== 0 ? "border-t" : ""} ${index !== messages.length - 1 ? "border-b" : ""} ${activeMessage?.id === message.id ? "bg-gray-200" : ""} ${index === 0 ? "rounded-tl-[10px]" : ""} ${index === messages.length - 1 ? "rounded-bl-[0px]" : ""}`}
        >
          <h4 className="font-bold">{message.subject}</h4>
          <p className="text-sm text-gray-500">{message.sender}</p>
        </div>
      ))}
    </div>
    </>
  );
};
