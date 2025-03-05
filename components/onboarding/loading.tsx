"use client";

import { useEffect } from "react";

interface LoadingProps {
  message?: string;
  onComplete?: () => void;
  delay?: number;
}

export default function Loading({
  message = "Loading...",
  onComplete,
  delay = 2000,
}: LoadingProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, delay);

    return () => clearTimeout(timer);
  }, [onComplete, delay]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-white dark:bg-background">
      <div className="flex flex-col items-center max-w-md mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 3L4 14H15L11 21"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

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
        <p className="text-primary text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}
