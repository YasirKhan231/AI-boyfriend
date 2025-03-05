import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-center">
      <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center">
        <Image
          src="/placeholder.svg?height=40&width=40"
          alt="Boltshift Logo"
          width={24}
          height={24}
          className="text-black"
        />
      </div>

      <h1 className="text-3xl font-bold tracking-tight">
        Meet Your New Best Friend- Always Here and Listening!
      </h1>

      <p className="text-muted-foreground">
        Whether you need a chat, a laugh, or a little motivation, your AI friend
        is just a message away.
      </p>

      <Button
        onClick={onNext}
        className="mt-6 rounded-full px-6 hover:cursor-pointer"
      >
        Get Started <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
