"use client";

import type React from "react";
import type { Message } from "@/types";
import { formatMessageText } from "@/lib/chat-utils";
import { motion } from "framer-motion";

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`max-w-[80%] ${isUser ? "ml-auto" : "mr-auto"}`}>
        <div className={`relative ${isUser ? "message-user" : "message-bot"}`}>
          <div
            className={`rounded-2xl px-4 py-2 ${
              isUser
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
    </motion.div>
  );
};

export default MessageItem;
