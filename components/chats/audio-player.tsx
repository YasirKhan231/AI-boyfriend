"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  isMuted: boolean;
  toggleMute: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  isPlaying,
  isMuted,
  toggleMute,
}) => {
  const [waveform, setWaveform] = useState<number[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Generate random waveform for visualization
    const generateWaveform = () => {
      const newWaveform = Array.from(
        { length: 40 },
        () => Math.floor(Math.random() * 30) + 5
      );
      setWaveform(newWaveform);

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(generateWaveform);
      }
    };

    if (isPlaying) {
      generateWaveform();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-sm bg-black p-4 rounded-lg border border-gray-800 shadow-lg z-40">
      <div className="flex items-center justify-between">
        <div className="flex-1 h-16 flex items-center justify-center">
          <div className="flex items-center justify-center gap-1 h-full">
            {waveform.map((height, i) => (
              <div
                key={i}
                className="w-[2px] bg-gray-400 rounded-full"
                style={{
                  height: `${height}px`,
                  opacity: isMuted ? 0.3 : 0.8,
                  transition: "height 0.1s ease-in-out",
                }}
              ></div>
            ))}
          </div>
        </div>

        <Button
          onClick={toggleMute}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-gray-300 hover:bg-gray-800 ml-2"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default AudioPlayer;
