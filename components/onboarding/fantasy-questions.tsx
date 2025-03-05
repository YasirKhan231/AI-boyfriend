"use client";

import { useState, useRef, useEffect } from "react";
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
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // References for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);

  // Start recording function
  const startRecording = async () => {
    try {
      // Reset any previous conversion errors
      setConversionError(null);

      // Reset recording time to 0
      setRecordingTime(0);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setTimer(interval);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setConversionError(
        "Could not access microphone. Please check permissions."
      );
    }
  };

  // Pause recording function
  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
    }

    if (timer) clearInterval(timer);
    setIsPaused(true);
  };

  // Resume recording function
  const resumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
    }

    setIsPaused(false);
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    setTimer(interval);
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();

      // Create audio URL when recording stops
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Revoke previous URL if it exists
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }

        // Create new URL for the audio blob
        audioUrlRef.current = URL.createObjectURL(audioBlob);

        // Mark as recorded
        const newAnswers = [...userData.answers];
        newAnswers[questionIndex] = "Audio response recorded";
        updateUserData({ answers: newAnswers });
      };

      // Stop all tracks in the stream
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    if (timer) clearInterval(timer);
    setIsRecording(false);
    setIsPaused(false);
  };

  // Retry recording function
  const retryRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    if (timer) clearInterval(timer);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    audioChunksRef.current = [];

    // Revoke previous URL if it exists
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    // Remove the current answer
    const newAnswers = [...userData.answers];
    newAnswers[questionIndex] = "";
    updateUserData({ answers: newAnswers });

    // Reset conversion error
    setConversionError(null);
  };

  // Convert audio to text using Elevenlabs API directly from frontend
  const convertAudioToText = async () => {
    if (audioChunksRef.current.length === 0) {
      console.log("No audio chunks available for conversion.");
      return null;
    }

    try {
      console.log("Starting Elevenlabs conversion...");
      setIsConverting(true);
      setConversionError(null);

      // Create audio blob from chunks
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      // Create form data for API request
      const formData = new FormData();
      formData.append("audio", audioBlob);

      // Call Elevenlabs API directly
      const response = await fetch(
        "https://api.elevenlabs.io/v1/speech-to-text",
        {
          method: "POST",
          headers: {
            "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Elevenlabs API error:", errorData);
        throw new Error(
          errorData.detail?.message || "Failed to convert speech to text"
        );
      }

      const data = await response.json();
      console.log("Elevenlabs conversion successful:", data);
      setIsConverting(false);

      return data.text;
    } catch (error) {
      console.error("Error converting audio to text with Elevenlabs:", error);
      setIsConverting(false);
      setConversionError(
        error instanceof Error
          ? error.message
          : "Failed to convert speech to text"
      );
      return null;
    }
  };

  // Alternative method using AssemblyAI if Elevenlabs doesn't work
  const convertAudioWithAssemblyAI = async () => {
    if (audioChunksRef.current.length === 0) return null;

    try {
      setIsConverting(true);
      setConversionError(null);

      // Create audio blob from chunks
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      // Step 1: Get upload URL
      const uploadResponse = await fetch(
        "https://api.assemblyai.com/v2/upload",
        {
          method: "POST",
          headers: {
            Authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || "",
            "Content-Type": "application/json",
          },
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { upload_url } = await uploadResponse.json();

      // Step 2: Upload the audio file
      const uploadAudioResponse = await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": "audio/webm",
        },
        body: audioBlob,
      });

      if (!uploadAudioResponse.ok) {
        throw new Error("Failed to upload audio file");
      }

      // Step 3: Submit the transcription request
      const transcriptResponse = await fetch(
        "https://api.assemblyai.com/v2/transcript",
        {
          method: "POST",
          headers: {
            Authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio_url: upload_url,
          }),
        }
      );

      if (!transcriptResponse.ok) {
        throw new Error("Failed to submit transcription request");
      }

      const { id } = await transcriptResponse.json();

      // Step 4: Poll for the transcription result
      let transcriptResult;
      let attempts = 0;

      while (attempts < 30) {
        const resultResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || "",
            },
          }
        );

        if (!resultResponse.ok) {
          throw new Error("Failed to get transcription result");
        }

        transcriptResult = await resultResponse.json();

        if (transcriptResult.status === "completed") {
          break;
        } else if (transcriptResult.status === "error") {
          throw new Error("Transcription failed: " + transcriptResult.error);
        }

        // Wait 1 second before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!transcriptResult || transcriptResult.status !== "completed") {
        throw new Error("Transcription timed out");
      }

      setIsConverting(false);
      return transcriptResult.text;
    } catch (error) {
      console.error("Error converting audio with AssemblyAI:", error);
      setIsConverting(false);
      setConversionError(
        error instanceof Error
          ? error.message
          : "Failed to convert speech to text"
      );
      return null;
    }
  };

  // Handle next button click
  const handleNext = async () => {
    console.log("Next button clicked");

    // If we have audio recorded, convert it to text first
    if (userData.answers[questionIndex] === "Audio response recorded") {
      console.log("Audio response recorded. Starting conversion...");

      // Try Elevenlabs first, then fall back to AssemblyAI if needed
      let text = await convertAudioToText();

      // If Elevenlabs fails, try AssemblyAI

      if (text) {
        console.log("Conversion successful. Converted text:", text);

        // Update the user data with the converted text
        const newAnswers = [...userData.answers];
        newAnswers[questionIndex] = text;
        updateUserData({ answers: newAnswers });

        // Move to next question or complete
        if (questionIndex < questions.length - 1) {
          console.log("Moving to the next question...");
          setQuestionIndex(questionIndex + 1);
          // Reset recording state for the next question
          retryRecording();
        } else {
          console.log("All questions completed. Moving to the next step...");
          onNext();
        }
      } else {
        console.log("Conversion failed. No text was generated.");
        // If both conversion methods fail, show an error
        if (!conversionError) {
          setConversionError(
            "Failed to convert speech to text. Please try again."
          );
        }
      }
    } else {
      console.log("No audio recorded. Moving to the next question...");
      // If no conversion needed, just move to next question or complete
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
        // Reset recording state for the next question
        retryRecording();
      } else {
        onNext();
      }
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [timer]);

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
              disabled={isConverting}
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

          {/* Pause/Resume button - always shown when recording */}
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

          {/* Retry button - always shown when recording or when an answer exists */}
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
            {audioUrlRef.current && (
              <audio className="mt-2" controls src={audioUrlRef.current} />
            )}
          </div>
        )}

        {isConverting && (
          <div className="text-center">
            <p className="text-sm text-amber-400">
              Converting speech to text...
            </p>
            <div className="mt-2 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
            </div>
          </div>
        )}

        {conversionError && (
          <div className="text-center">
            <p className="text-sm text-red-500">{conversionError}</p>
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
          disabled={questionIndex === 0 || isConverting}
          className="rounded-full"
        >
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={
            // Enable the Next button if:
            // 1. Recording has started (isRecording is true), or
            // 2. An answer has been recorded for the current question, or
            // 3. The recording is paused (isPaused is true)
            !(isRecording || userData.answers[questionIndex] || isPaused) ||
            isConverting
          }
          className="rounded-full"
        >
          {isConverting
            ? "Converting..."
            : questionIndex < questions.length - 1
            ? "Next"
            : "Complete"}
        </Button>
      </div>
    </div>
  );
}
