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
      }`}
    >
      <div className={`max-w-[85%] ${message.sender === "user" ? "" : ""}`}>
        <div
          className={`rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
            message.sender === "user"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          <div className="text-white text-sm md:text-base">
            {formatMessageText(message.text)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
