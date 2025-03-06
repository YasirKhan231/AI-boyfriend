"use client";

import type React from "react";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Send, Volume2, VolumeX } from "lucide-react";

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
    <div className="p-2 md:p-4 bg-black border-t border-gray-800">
      <div className="max-w-4xl mx-auto flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <Plus className="h-5 w-5" />
          </div>
          <Input
            placeholder="iMessage"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-900 border-gray-800 rounded-full py-6 pl-12 pr-12 text-white placeholder:text-gray-500"
          />
          {message.trim() !== "" && (
            <Button
              onClick={() => handleSendMessage()}
              disabled={loading}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          )}
        </div>

        {audioPlaying && (
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-gray-400 hover:bg-gray-800"
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
