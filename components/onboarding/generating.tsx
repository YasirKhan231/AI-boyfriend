"use client";

import { useEffect, useState } from "react";

interface GeneratingProps {
  userPrompt?: string;
  onComplete: () => void;
}

export default function Generating({
  userPrompt = "I want to meet someone who can help me position my startup venture",
  onComplete,
}: GeneratingProps) {
  const [dots, setDots] = useState("...");

  useEffect(() => {
    // Animate the dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);

    // Complete after 3 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-white dark:bg-background">
      <div className="flex flex-col items-center max-w-md mx-auto text-center space-y-8">
        {/* Loading dots */}
        <div className="flex space-x-2 mt-8">
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-primary text-xl font-medium">Hold On!</p>
          <p className="text-secondary">
            While we generating your AI friend{dots}
          </p>
        </div>

        {/* User prompt */}
        <div className="mt-auto pt-20">
          <p className="text-secondary text-sm italic">{userPrompt}</p>
        </div>
      </div>
    </div>
  );
}
