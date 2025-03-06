import type React from "react";
import type { Message } from "@/types";
import { formatMessageText } from "@/lib/chat-utils";

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[80%] ${
          message.sender === "user" ? "ml-auto" : "mr-auto"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2 ${
            message.sender === "user"
              ? "bg-blue-500 text-white rounded-br-sm"
              : "bg-gray-700 text-white rounded-bl-sm"
          }`}
        >
          <div className="text-sm md:text-base">
            {formatMessageText(message.text)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
