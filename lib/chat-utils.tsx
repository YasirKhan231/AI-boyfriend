import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Format message text with code blocks
export const formatMessageText = (text: string) => {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      if (!match)
        return (
          <pre
            key={index}
            className="bg-gray-900 text-gray-200 p-4 rounded-md my-2 overflow-x-auto"
          >
            {part}
          </pre>
        );

      const [, language, code] = match;

      return (
        <div
          key={index}
          className="my-4 overflow-hidden rounded-md border border-gray-700"
        >
          {language && (
            <div className="bg-gray-900 text-gray-300 px-4 py-1 text-xs font-mono">
              {language}
            </div>
          )}
          <pre className="bg-gray-950 text-gray-200 p-4 overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    return (
      <div key={index} className="whitespace-pre-wrap">
        {part.split("\n").map((line, i) => (
          <p key={i} className={line.trim() === "" ? "h-4" : "mb-2"}>
            {line}
          </p>
        ))}
      </div>
    );
  });
};

// Format timestamp
export const formatTime = (timestamp: any) => {
  if (!timestamp) return "Sending...";

  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Available voices
export const availableVoices = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Josh" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Adam" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sam" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Rachel" },
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
