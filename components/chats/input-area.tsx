"use client";

import type React from "react";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Volume2, VolumeX } from "lucide-react";

interface InputAreaProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: (text?: string) => Promise<void>;
  loading: boolean;
  audioMuted: boolean;
  toggleMute: () => void;
  audioPlaying: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
  message,
  setMessage,
  handleSendMessage,
  loading,
  audioMuted,
  toggleMute,
  audioPlaying,
}) => {
  // Optimized input handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
    },
    [setMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <div className="p-3 md:p-4 bg-black border-t border-gray-800">
      <div className="max-w-4xl mx-auto flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Message..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="pr-14 py-5 md:py-6 rounded-full border-gray-700 bg-gray-900 shadow-sm focus:border-gray-600 focus:ring-gray-600 text-white text-sm md:text-base"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={message.trim() === "" || loading}
            size="icon"
            className="h-8 w-8 md:h-10 md:w-10 absolute right-1.5 top-1/2 transform -translate-y-1/2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
            ) : (
              <Send className="h-3 w-3 md:h-4 md:w-4" />
            )}
          </Button>
        </div>

        {audioPlaying && (
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-gray-300 hover:bg-gray-800"
          >
            {audioMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default InputArea;
