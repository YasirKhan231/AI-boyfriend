import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart } from "lucide-react";
import type { Message } from "@/types";
import MessageItem from "./message-item";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 w-full mx-auto overflow-hidden bg-black">
      <div className="h-full">
        <ScrollArea className="h-full p-2 md:p-4">
          <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center text-gray-400">
                <Heart className="h-10 w-10 md:h-12 md:w-12 mb-4 text-gray-300 animate-pulse" />
                <h3 className="text-base md:text-lg font-medium">
                  Begin Your Conversation
                </h3>
                <p className="max-w-sm mt-2">
                  I've been waiting to talk with you. Send me a message or call
                  me using the call button above.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <MessageItem key={msg.id || index} message={msg} />
            ))}

            {loading && (
              <div className="flex justify-start my-4">
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="rounded-2xl px-5 py-3.5 bg-gray-800 border border-gray-700 shadow-subtle min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "600ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MessageList;
