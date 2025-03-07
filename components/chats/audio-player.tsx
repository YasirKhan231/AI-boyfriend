"use client";

import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, X } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  onCancel: () => void; // Add a callback for canceling the audio
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  isPlaying,
  isMuted,
  toggleMute,
  onCancel,
}) => {
  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 p-4 rounded-lg shadow-lg flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={toggleMute}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-800"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <audio src={audioUrl} controls className="hidden" />
      </div>
      <Button
        onClick={onCancel}
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-800"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AudioPlayer;
