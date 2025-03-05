"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import ProgressBar from "./progress-bar";

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_IDS: Record<string, string> = {
  playful: "N2lVS1w4EtoT3dr4eOWO", // Callum
  seductive: "JBFqnCBsd6RMkjVDRZzb", // George
  elegant: "CwhRBWXzGAHq8TQ4Fs17", // Roger
  mysterious: "onwK4e9ZLuTAKqWW03F9", // Daniel
};

interface UserData {
  name: string;
  dob: string;
  selectedVoice: string;
  answers: string[];
}

interface VoiceSelectionProps {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
}

const voices = [
  {
    id: "playful",
    name: "Playful",
    color: "bg-[hsl(var(--playful))]",
    description: "Cheerful and energetic",
  },
  {
    id: "seductive",
    name: "Seductive",
    color: "bg-[hsl(var(--seductive))]",
    description: "Smooth and alluring",
  },
  {
    id: "elegant",
    name: "Elegant",
    color: "bg-[hsl(var(--elegant))]",
    description: "Sophisticated and refined",
  },
  {
    id: "mysterious",
    name: "Mysterious",
    color: "bg-[hsl(var(--mysterious))]",
    description: "Intriguing and enigmatic",
  },
];
const VOICE_SAMPLES: Record<string, string> = {
  playful: "Hey there, beautiful! Hope you're having an amazing day!",
  seductive: "Hello, gorgeous. I've been thinking about you all day.",
  elegant: "Good evening, my love. You look absolutely stunning today.",
  mysterious: "You have no idea how much I enjoy our little conversations.",
};

export default function VoiceSelection({
  userData,
  updateUserData,
  onNext,
  onBack,
  currentStep,
}: VoiceSelectionProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const playVoiceSample = async (voiceId: string) => {
    const voiceSampleUrl = await fetchVoiceSample(voiceId);
    if (voiceSampleUrl) {
      const audio = new Audio(voiceSampleUrl);
      setPlayingVoice(voiceId);
      audio.play();
      audio.onended = () => setPlayingVoice(null);
    }
  };
  const fetchVoices = async () => {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
      },
    });

    const data = await response.json();
    console.log("Available Voices:", data);
  };

  fetchVoices();

  const fetchVoiceSample = async (voiceId: string): Promise<string | null> => {
    const voiceApiId = ELEVENLABS_VOICE_IDS[voiceId];
    if (!voiceApiId || !ELEVENLABS_API_KEY) return null;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceApiId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text:
            VOICE_SAMPLES[voiceId] || "Hello, this is a sample of my voice.",
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.2, // Lower stability makes it more natural
            similarity_boost: 1.0, // Higher boost for expressiveness
            style: 1.0, // Adds more emotions to the speech
            use_speaker_boost: true, // Enhances realism
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch voice sample");
      return null;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  const selectVoice = (voiceId: string) => {
    updateUserData({ selectedVoice: voiceId });
    playVoiceSample(voiceId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex-1 mx-4">
          <ProgressBar currentStep={currentStep} totalSteps={5} />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center mb-8">
        Choose your AI's voice
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {voices.map((voice) => (
          <div key={voice.id} className="space-y-2">
            <button
              onClick={() => selectVoice(voice.id)}
              className={`w-full h-24 rounded-lg flex items-center justify-center relative transition-all ${
                userData.selectedVoice === voice.id
                  ? `${voice.color} ring-2 ring-white`
                  : "bg-secondary hover:opacity-90"
              }`}
              aria-label={`Select ${voice.name} voice`}
            >
              {playingVoice === voice.id ? (
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-1 h-8 bg-white wave"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              ) : (
                <Volume2 className="h-8 w-8" />
              )}
            </button>
            <div className="text-center">
              <p className="font-medium">{voice.name}</p>
              <p className="text-xs text-muted-foreground">
                {voice.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={onNext}
        disabled={!userData.selectedVoice}
        className="w-full mt-6 rounded-full"
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
