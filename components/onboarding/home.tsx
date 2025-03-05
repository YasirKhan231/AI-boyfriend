"use client";
import { ArrowRight } from "lucide-react";

interface HomeProps {
  onStart: () => void;
}

export default function Home({ onStart }: HomeProps) {
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

        {/* Heading */}
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
          Meet Your New Best Friend- Always Here and Listening!
        </h1>

        {/* Subheading */}
        <p className="text-secondary text-sm md:text-base">
          Whether you need a chat, a laugh or a little motivation, your AI
          friend is just a message away.
        </p>

        {/* Get Started Button */}
        <button
          onClick={onStart}
          className="flex items-center justify-center px-4 py-2 mt-6 text-sm font-medium text-black bg-white rounded-full hover:bg-opacity-90 transition-all"
        >
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
