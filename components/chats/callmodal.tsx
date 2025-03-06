"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { PhoneOff, Volume2, VolumeX } from "lucide-react";

interface CallModalProps {
  isCallActive: boolean;
  callHistory: string[];
  voiceWaveform: number[];
  isListening: boolean;
  transcript: string;
  endCall: () => void;
  audioMuted: boolean;
  toggleMute: () => void;
}

const CallModal: React.FC<CallModalProps> = ({
  isCallActive,
  callHistory,
  voiceWaveform,
  isListening,
  transcript,
  endCall,
  audioMuted,
  toggleMute,
}) => {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-xl shadow-2xl max-w-md w-full mx-auto overflow-hidden border border-gray-800">
        <div className="p-4 md:p-6 flex flex-col items-center">
          <div className="w-full h-24 md:h-32 flex items-center justify-center my-4">
            <div className="flex items-center justify-center gap-1 h-full">
              {voiceWaveform.map((height, i) => (
                <div
                  key={i}
                  className="w-[2px] bg-gray-400 rounded-full"
                  style={{
                    height: `${height}px`,
                    opacity: isListening ? 1 : 0.5,
                    transition: "height 0.1s ease-in-out",
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div className="w-full max-h-40 md:max-h-60 overflow-y-auto my-3 md:my-4 px-3 md:px-4 rounded-lg bg-black">
            {callHistory.map((message, index) => (
              <div
                key={index}
                className={`py-2 text-sm ${
                  message.startsWith("You:")
                    ? "text-right text-blue-400"
                    : "text-left text-gray-300"
                }`}
              >
                {message}
              </div>
            ))}
          </div>

          <div className="text-center my-3 md:my-4">
            {isCallActive ? (
              <p className="text-xs md:text-sm text-gray-400">
                {transcript ? transcript : "Listening...speak now"}
              </p>
            ) : (
              <p className="text-xs md:text-sm text-gray-400">Connecting...</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={toggleMute}
              className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-gray-800 hover:bg-gray-700 text-white"
            >
              {audioMuted ? (
                <VolumeX className="h-5 w-5 md:h-6 md:w-6" />
              ) : (
                <Volume2 className="h-5 w-5 md:h-6 md:w-6" />
              )}
            </Button>

            <Button
              onClick={endCall}
              className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
