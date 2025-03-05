import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProgressBar from "./progress-bar";

interface OnboardingFormProps {
  userData: {
    name: string;
    dob: string;
    selectedVoice: string;
    answers: string[];
  };
  updateUserData: (data: Partial<OnboardingFormProps["userData"]>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
}

export default function OnboardingForm({
  userData,
  updateUserData,
  onNext,
  onBack,
  currentStep,
}: OnboardingFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
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
        Tell us about yourself
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={userData.name}
            onChange={(e) => updateUserData({ name: e.target.value })}
            required
            className="bg-secondary border-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={userData.dob}
            onChange={(e) => updateUserData({ dob: e.target.value })}
            required
            className="appearance-auto text-white"
          />
        </div>

        <Button type="submit" className="w-full rounded-full">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
