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
  // Update the initial audioVolume state to have a minimum height
  const [audioVolume, setAudioVolume] = useState<number[]>(Array(32).fill(20));
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

      // Set up audio analysis
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      // Start audio visualization
      visualizeAudio();

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

  // Audio visualization function with new waveform style
  const visualizeAudio = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const updateVisualization = () => {
      if (!analyserRef.current || !dataArrayRef.current || isPaused) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Calculate volume levels with improved sensitivity for waveform
      const bufferLength = analyserRef.current.frequencyBinCount;
      const newVolumes = Array(32).fill(0); // Increased number of points for smoother wave

      // Process frequency data for visualization
      for (let i = 0; i < bufferLength; i++) {
        const index = Math.floor((i / bufferLength) * 32);
        newVolumes[index] = Math.max(
          newVolumes[index],
          (dataArrayRef.current[i] / 255) * 100
        );
      }

      // Apply smoothing
      setAudioVolume((prevVolumes) =>
        newVolumes.map((vol, i) => {
          const smoothFactor = 0.3;
          return prevVolumes[i] * (1 - smoothFactor) + vol * smoothFactor;
        })
      );

      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };

    animationFrameRef.current = requestAnimationFrame(updateVisualization);
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

    // Resume visualization
    if (!animationFrameRef.current) {
      visualizeAudio();
    }
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

    // Stop audio context and analysis
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (timer) clearInterval(timer);
    setIsRecording(false);
    setIsPaused(false);
    setAudioVolume(Array(32).fill(0));
  };

  // Also update the retryRecording function to reset audioVolume to minimum height
  const retryRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    // Stop audio context and analysis
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (timer) clearInterval(timer);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setAudioVolume(Array(32).fill(20)); // Set to minimum height instead of zero
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
      console.log("Starting ElevenLabs conversion...");
      setIsConverting(true);
      setConversionError(null);

      // Convert audio to WAV format
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      // Call ElevenLabs API
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
        throw new Error(
          errorData.detail?.message || "Failed to convert speech to text"
        );
      }

      const data = await response.json();
      setIsConverting(false);

      return data.text; // ✅ Successfully converted text
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error converting audio to text:", error.message);
        setConversionError(error.message);
      } else {
        console.error("Unknown error occurred:", error);
        setConversionError("An unknown error occurred");
      }
      setIsConverting(false);
      return null;
    }
  };

  // Alternative method using AssemblyAI if Elevenlabs doesn't work
  const convertAudioWithAssemblyAI = async () => {
    if (audioChunksRef.current.length === 0) return null;

    try {
      setIsConverting(true);
      setConversionError(null);

      // Convert audio to WAV format
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      // Step 1: Upload the file to AssemblyAI
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

      // Step 2: Upload the actual file
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

      // Step 3: Submit for transcription
      const transcriptResponse = await fetch(
        "https://api.assemblyai.com/v2/transcript",
        {
          method: "POST",
          headers: {
            Authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio_url: upload_url }),
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
        } else if (transcriptResult.status === "failed") {
          throw new Error("Transcription failed: " + transcriptResult.error);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 sec before retry
        attempts++;
      }

      if (!transcriptResult || transcriptResult.status !== "completed") {
        throw new Error("Transcription timed out");
      }

      setIsConverting(false);
      return transcriptResult.text;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error converting audio to text:", error.message);
        setConversionError(error.message);
      } else {
        console.error("Unknown error occurred:", error);
        setConversionError("An unknown error occurred");
      }
      setIsConverting(false);
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
      const text = await convertAudioToText();

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
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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
          {/* Main recording visualization */}
          <div className="relative w-full max-w-md h-32">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-full h-full relative overflow-hidden bg-black rounded-lg"
                aria-label="Stop recording"
              >
                {/* Waveform container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full flex items-center">
                    {/* Mirror the waves for symmetrical effect */}
                    <div className="w-1/2 h-full flex items-center justify-end">
                      {audioVolume
                        .slice(0, 16)
                        .reverse()
                        .map((volume, i) => (
                          <div
                            key={`left-${i}`}
                            className="w-[3px] mx-[1px] transform origin-center"
                            style={{
                              height: `${Math.max(4, volume)}%`,
                              background: `linear-gradient(180deg, 
                              rgba(255,0,0,0.2) 0%, 
                              rgba(255,69,0,0.8) 50%, 
                              rgba(255,140,0,1) 100%)`,
                              boxShadow:
                                volume > 50
                                  ? "0 0 10px rgba(255,140,0,0.5), 0 0 20px rgba(255,69,0,0.3)"
                                  : "none",
                              transition: "height 0.1s ease-out",
                            }}
                          />
                        ))}
                    </div>
                    <div className="w-1/2 h-full flex items-center justify-start">
                      {audioVolume.slice(16, 32).map((volume, i) => (
                        <div
                          key={`right-${i}`}
                          className="w-[3px] mx-[1px] transform origin-center"
                          style={{
                            height: `${Math.max(4, volume)}%`,
                            background: `linear-gradient(180deg, 
                              rgba(255,0,0,0.2) 0%, 
                              rgba(255,69,0,0.8) 50%, 
                              rgba(255,140,0,1) 100%)`,
                            boxShadow:
                              volume > 50
                                ? "0 0 10px rgba(255,140,0,0.5), 0 0 20px rgba(255,69,0,0.3)"
                                : "none",
                            transition: "height 0.1s ease-out",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Center glow effect */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,140,0,0.3) 0%, rgba(255,69,0,0.1) 50%, transparent 100%)",
                    filter: "blur(8px)",
                  }}
                />
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-full h-full flex items-center justify-center bg-black/90 hover:bg-black/80 rounded-lg transition-colors"
                aria-label="Start recording"
                disabled={isConverting}
              >
                <Mic className="h-8 w-8 text-orange-500" />
              </button>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex flex-col space-y-2">
            {isRecording && (
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="w-12 h-12 rounded-lg flex items-center justify-center transition-all bg-black/90 hover:bg-black/80 text-orange-500"
                aria-label={isPaused ? "Resume recording" : "Pause recording"}
              >
                {isPaused ? (
                  <Play className="h-5 w-5" />
                ) : (
                  <Pause className="h-5 w-5" />
                )}
              </button>
            )}

            {(isRecording || userData.answers[questionIndex]) && (
              <button
                onClick={retryRecording}
                className="w-12 h-12 rounded-lg flex items-center justify-center transition-all bg-black/90 hover:bg-black/80 text-orange-500"
                aria-label="Retry recording"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            )}
          </div>
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

      {/* CSS for flame animation */}
      <style jsx global>{`
        @keyframes flicker-0 {
          0% {
            transform: scaleX(1) scaleY(1);
            opacity: 0.9;
          }
          100% {
            transform: scaleX(0.95) scaleY(0.95);
            opacity: 1;
          }
        }
        @keyframes flicker-1 {
          0% {
            transform: scaleX(0.97) scaleY(1.03);
            opacity: 0.92;
          }
          100% {
            transform: scaleX(0.94) scaleY(0.96);
            opacity: 1;
          }
        }
        @keyframes flicker-2 {
          0% {
            transform: scaleX(1.02) scaleY(0.98);
            opacity: 0.94;
          }
          100% {
            transform: scaleX(0.96) scaleY(0.98);
            opacity: 1;
          }
        }
        @keyframes flicker-3 {
          0% {
            transform: scaleX(0.98) scaleY(1.02);
            opacity: 0.91;
          }
          100% {
            transform: scaleX(0.97) scaleY(0.97);
            opacity: 1;
          }
        }
        @keyframes flicker-4 {
          0% {
            transform: scaleX(1.01) scaleY(0.99);
            opacity: 0.93;
          }
          100% {
            transform: scaleX(0.98) scaleY(0.96);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
