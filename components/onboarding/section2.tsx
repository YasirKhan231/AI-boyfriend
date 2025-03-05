"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Mic } from "lucide-react";

interface Section2Props {
  onNext: (genre: string) => void;
  onBack: () => void;
}

export default function Section2({ onNext, onBack }: Section2Props) {
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const genres = [
    "Become a successful actor",
    "Become financially free",
    "Build connections",
  ];

  const handleNext = () => {
    onNext(selectedGenre || inputValue);
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
            <div className="w-2/3 h-full bg-white"></div>
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-center mb-8">
          What is your genre?
        </h2>

        {/* Input field */}
        <div className="relative mb-8">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your genre..."
            className="w-full px-4 py-3 bg-transparent border-b border-gray-600 focus:border-white outline-none text-white"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-background-lighter">
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-3 rounded-full text-left text-sm ${
                selectedGenre === genre
                  ? "bg-white bg-opacity-20 border border-white"
                  : "bg-button-secondary hover:bg-button-hover"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Next button */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            disabled={!selectedGenre && !inputValue}
            className={`flex items-center justify-center w-12 h-12 rounded-full ${
              selectedGenre || inputValue ? "bg-white" : "bg-gray-700"
            }`}
          >
            <ArrowRight
              className={`w-5 h-5 ${
                selectedGenre || inputValue ? "text-black" : "text-gray-500"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
