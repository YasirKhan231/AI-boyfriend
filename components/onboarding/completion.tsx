"use client";

import { Copy, Share2 } from "lucide-react";
import { useState } from "react";

interface CompletionProps {
  colorCode?: string;
  phoneNumber?: string;
  onReset: () => void;
}

export default function Completion({
  colorCode = "Green",
  phoneNumber = "+1 (949) 397-9440",
  onReset,
}: CompletionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-white dark:bg-background">
      <div className="flex flex-col items-center max-w-md mx-auto text-center space-y-8">
        {/* Header */}
        <h1 className="text-3xl font-bold">Your AI Friend is ready.</h1>

        {/* Color circle */}
        <div className="w-20 h-20 rounded-full bg-success"></div>

        {/* Color code */}
        <p className="text-secondary">
          Your Colour Code:{" "}
          <span className="text-success font-medium">{colorCode}</span>
        </p>

        {/* Instructions */}
        <p className="text-secondary text-sm">
          Text their number below to continue
        </p>

        {/* Open iMessage button */}
        <a
          href={`sms:${phoneNumber}`}
          className="inline-block px-6 py-3 bg-background-lighter rounded-md font-medium hover:bg-opacity-80 transition-all"
        >
          Open iMessage
        </a>

        {/* Phone number with copy */}
        <div className="flex items-center justify-center space-x-4 text-secondary">
          <p>{phoneNumber}</p>
          <button
            onClick={handleCopy}
            className="text-white opacity-70 hover:opacity-100"
          >
            {copied ? (
              <span className="text-success text-xs">Copied!</span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button className="text-white opacity-70 hover:opacity-100">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Blue top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
    </div>
  );
}
