"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, ArrowRight, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Initialize date from userData if available
  useEffect(() => {
    if (userData.dob) {
      setDate(new Date(userData.dob));
    }
  }, [userData.dob]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Format date as YYYY-MM-DD using native JS
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      updateUserData({ dob: `${year}-${month}-${day}` });
    }
  };

  // Format date for display (like "January 1, 2023")
  const formatDateForDisplay = (date: Date | undefined) => {
    if (!date) return "";

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="space-y-8 bg-background p-6 rounded-xl shadow-lg max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex-1 mx-4">
          <ProgressBar currentStep={currentStep} totalSteps={5} />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
        Tell us about yourself
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-medium">
            Your Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={userData.name}
            onChange={(e) => updateUserData({ name: e.target.value })}
            required
            className="bg-secondary/50 border-none rounded-lg h-12 px-4 focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="dob" className="text-sm font-medium">
            Date of Birth
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-secondary/50 border-none rounded-lg h-12 px-4 hover:bg-secondary/70 transition-colors",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-3 h-4 w-4" />
                {date
                  ? formatDateForDisplay(date)
                  : "Select your date of birth"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-background border border-primary/20"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
                className="rounded-md bg-background"
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          type="submit"
          className="w-full rounded-full h-12 mt-8 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity"
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
