"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Pause, Play, RefreshCw } from "lucide-react";
import ProgressBar from "./progress-bar";

interface FantasyQuestionsProps {
  userData: {
    name: string;
    dob: string;
    selectedVoice: string;
    answers: string[];
  };
  updateUserData: (data: Partial<FantasyQuestionsProps["userData"]>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
}

const questions = [
  "Describe your perfect romantic evening. Where do you find yourself?",
  "On this romantic evening, who's by your side? What draws you to them?",
  "How do you want to feel in this fantasy?",
  "Describe a romantic moment or adventure you want to share together.",
  "What is your fantasy?",
];

export default function FantasyQuestions({
  userData,
  updateUserData,
  onNext,
  onBack,
  currentStep,
}: FantasyQuestionsProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    setTimer(interval);
  };

  const pauseRecording = () => {
    if (timer) clearInterval(timer);
    setIsPaused(true);
  };

  const resumeRecording = () => {
    setIsPaused(false);
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    setTimer(interval);
  };

  const stopRecording = () => {
    if (timer) clearInterval(timer);
    setIsRecording(false);
    setIsPaused(false);

    // Simulate recording completion
    const newAnswers = [...userData.answers];
    newAnswers[questionIndex] = "Audio response recorded";
    updateUserData({ answers: newAnswers });
  };

  const retryRecording = () => {
    if (timer) clearInterval(timer);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);

    // Remove the current answer
    const newAnswers = [...userData.answers];
    newAnswers[questionIndex] = "";
    updateUserData({ answers: newAnswers });
  };

  const handleNext = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      onNext();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
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
        {questions[questionIndex]}
      </h1>

      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Main recording button */}
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all bg-secondary hover:bg-secondary/80"
              aria-label="Start recording"
            >
              <Mic className="h-8 w-8" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all bg-red-500"
              aria-label="Stop recording"
            >
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-8 bg-white wave"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </button>
          )}

          {/* Pause/Resume button - only shown when recording */}
          {isRecording && (
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-secondary hover:bg-secondary/80"
              aria-label={isPaused ? "Resume recording" : "Pause recording"}
            >
              {isPaused ? (
                <Play className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Retry button - only shown when recording or when an answer exists */}
          {(isRecording || userData.answers[questionIndex]) && (
            <button
              onClick={retryRecording}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-secondary hover:bg-secondary/80"
              aria-label="Retry recording"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          )}
        </div>

        {isRecording && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isPaused ? "Paused" : "Recording..."} {formatTime(recordingTime)}
            </p>
          </div>
        )}

        {!isRecording && userData.answers[questionIndex] && (
          <div className="text-center">
            <p className="text-sm text-green-400">✓ Response recorded</p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => {
            if (questionIndex > 0) {
              setQuestionIndex(questionIndex - 1);
            }
          }}
          disabled={questionIndex === 0}
          className="rounded-full"
        >
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!userData.answers[questionIndex]}
          className="rounded-full"
        >
          {questionIndex < questions.length - 1 ? "Next" : "Complete"}
        </Button>
      </div>
    </div>
  );
}
