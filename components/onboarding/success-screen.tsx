import { Button } from "@/components/ui/button";
import { MessageSquare, Phone } from "lucide-react";

interface SuccessScreenProps {
  userData: {
    name: string;
    dob: string;
    selectedVoice: string;
    answers: string[];
  };
}

export default function SuccessScreen({ userData }: SuccessScreenProps) {
  return (
    <div className="space-y-8 text-center">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold">You're all set!</h1>

      <p className="text-muted-foreground">
        Your AI friend is ready to chat and call with you. Start a conversation
        now!
      </p>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <Button
          variant="outline"
          size="lg"
          className="flex items-center justify-center space-x-2 h-16 rounded-lg"
        >
          <MessageSquare className="h-5 w-5" />
          <span>Start Chat</span>
        </Button>

        <Button
          size="lg"
          className="flex items-center justify-center space-x-2 h-16 rounded-lg"
        >
          <Phone className="h-5 w-5" />
          <span>Call AI</span>
        </Button>
      </div>

      <div className="mt-8 p-4 bg-secondary/30 rounded-lg">
        <h3 className="font-medium mb-2">Your AI Friend Profile</h3>
        <div className="text-sm text-muted-foreground text-left">
          <p>
            <span className="font-medium">Name:</span>{" "}
            {userData.name || "Not provided"}
          </p>
          <p>
            <span className="font-medium">Voice:</span>{" "}
            {userData.selectedVoice.charAt(0).toUpperCase() +
              userData.selectedVoice.slice(1) || "Default"}
          </p>
          <p>
            <span className="font-medium">Fantasy:</span> Personalized
            experience created
          </p>
        </div>
      </div>
    </div>
  );
}
