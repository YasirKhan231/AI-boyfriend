"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Section3Props {
  onNext: (personality: string) => void;
  onBack: () => void;
}

export default function Section3({ onNext, onBack }: Section3Props) {
  const [selectedPersonality, setSelectedPersonality] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const personalities = [
    "The Chatty Buddy",
    "The Motivator",
    "The Listener",
    "The Fun Seeker",
    "The Guru",
  ];

  const handleNext = () => {
    onNext(selectedPersonality || inputValue);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-white dark:bg-background">
      <div className="w-full max-w-md mx-auto">
        {/* Progress bar */}
        <div className="flex items-center mb-12">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 mr-4 rounded-full bg-background-lighter"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 h-1 bg-background-lighter rounded-full overflow-hidden">
            <div className="w-full h-full bg-white"></div>
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-center mb-8">
          What best describes you?
        </h2>

        {/* Input field */}
        <div className="relative mb-8">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe yourself..."
            className="w-full px-4 py-3 bg-transparent border-b border-gray-600 focus:border-white outline-none text-white"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          {personalities.map((personality) => (
            <button
              key={personality}
              onClick={() => setSelectedPersonality(personality)}
              className={`px-4 py-3 rounded-full text-left text-sm ${
                selectedPersonality === personality
                  ? "bg-white bg-opacity-20 border border-white"
                  : "bg-button-secondary hover:bg-button-hover"
              }`}
            >
              {personality}
            </button>
          ))}
        </div>

        {/* Next button */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            disabled={!selectedPersonality && !inputValue}
            className={`flex items-center justify-center w-12 h-12 rounded-full ${
              selectedPersonality || inputValue ? "bg-white" : "bg-gray-700"
            }`}
          >
            <ArrowRight
              className={`w-5 h-5 ${
                selectedPersonality || inputValue
                  ? "text-black"
                  : "text-gray-500"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
