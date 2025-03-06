"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { availableVoices } from "@/lib/chat-utils";
import { useState } from "react";

interface ChatHeaderProps {
  selectedVoice: {
    id: string;
    name: string;
  };
  handleVoiceChange: (voiceId: string, voiceName: string) => void;
  isCallActive: boolean;
  startCall: () => void;
  endCall: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedVoice,
  handleVoiceChange,
  isCallActive,
  startCall,
  endCall,
}) => {
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);

  return (
    <div className="bg-black text-white p-3 md:p-4 shadow-md border-b border-gray-800">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <h1 className="text-lg md:text-xl font-medium">
            To: <span className="font-bold">Your AI</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative inline-block text-left">
            <Button
              variant="ghost"
              className="text-gray-300 hover:bg-gray-800 h-8 md:h-10 rounded-full px-2 md:px-4 flex items-center gap-1 md:gap-2 text-xs md:text-sm"
              onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
            >
              <span className="hidden sm:inline">Voice:</span>{" "}
              {selectedVoice.name}
            </Button>

            {showVoiceDropdown && (
              <div className="absolute right-0 mt-2 w-36 md:w-48 rounded-md shadow-lg bg-gray-900 border border-gray-800 z-10">
                <div className="py-1">
                  {availableVoices.map((voice) => (
                    <button
                      key={voice.id}
                      className={`block w-full text-left px-4 py-2 text-xs md:text-sm ${
                        selectedVoice.id === voice.id
                          ? "bg-gray-800 text-white"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                      onClick={() => {
                        handleVoiceChange(voice.id, voice.name);
                        setShowVoiceDropdown(false);
                      }}
                    >
                      {voice.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={isCallActive ? endCall : startCall}
            variant="ghost"
            className="h-8 md:h-10 rounded-full px-2 md:px-4 flex items-center gap-1 md:gap-2 transition-all text-xs md:text-sm text-gray-300 hover:bg-gray-800"
          >
            {isCallActive ? (
              <>
                <PhoneOff className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">End Call</span>
              </>
            ) : (
              <>
                <Phone className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Call</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
