"use client";
import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Send,
  Heart,
  User,
  Clock,
  Phone,
  PhoneOff,
  X,
} from "lucide-react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import { toast } from "react-toastify";
import { OpenAI } from "openai";

// Define types for messages
interface Message {
  id?: string;
  text: string;
  createdAt?: any; // Firestore timestamp
  sender: "user" | "boyfriend";
  index: number; // Index to track the order of messages
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

const ChatApp: React.FC = () => {
  // State variables
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [voiceWaveform, setVoiceWaveform] = useState<number[]>([]);
  const [callHistory, setCallHistory] = useState<string[]>([]);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedVoice, setSelectedVoice] = useState({
    id: "21m00Tcm4TlvDq8ikWAM", // Default voice ID
    name: "Josh", // Default voice name
  });

  // Available voices
  const availableVoices = [
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Josh" },
    { id: "AZnzlk1XvdvUeBnXmlld", name: "Adam" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Sam" },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni" },
    { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli" },
    { id: "TxGEqnHWrfWFTfGW9XjX", name: "Rachel" },
  ];

  // Handle voice change
  const handleVoiceChange = (voiceId: string, voiceName: string) => {
    setSelectedVoice({ id: voiceId, name: voiceName });
    toast.success(`Voice changed to ${voiceName}`);
  };

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // ELEVENLABS API key remains hardcoded
  const ELEVENLABS_API_KEY =
    "sk_ac995dd9e6d51b2e150ab2297ecca99d25573b8d833a3bd6";

  // OpenAI client state (will be set once API key is fetched)
  const [openai, setOpenai] = useState<OpenAI | null>(null);

  // Initialize OpenAI client using the API key from the environment file
  useEffect(() => {
    const apiKey =
      "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"; // Fetch API key from environment
    if (!apiKey) {
      console.error("OpenAI API key not found in environment variables.");
      toast.error("OpenAI API key not configured.");
      return;
    }

    const openaiInstance = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
    console.log(openaiInstance);
    setOpenai(openaiInstance);
  }, []);

  // Generate random waveform data for visualization
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        const newWaveform = Array.from(
          { length: 20 },
          () => Math.floor(Math.random() * 30) + 5
        );
        setVoiceWaveform(newWaveform);
      }, 150);

      return () => clearInterval(interval);
    }
  }, [isListening]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const currentTranscript =
        event.results[event.results.length - 1][0].transcript;
      setTranscript(currentTranscript);

      if (event.results[event.results.length - 1].isFinal && isCallActive) {
        // Add user's speech to call history
        setCallHistory((prev) => [...prev, `You: ${currentTranscript}`]);

        // Ensure OpenAI client is ready
        if (!openai) {
          toast.error("OpenAI client is not initialized yet.");
          return;
        }

        // Get AI response
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are a caring, attentive AI boyfriend. Respond with emotional depth and personal connection. Use endearing terms occasionally and show genuine interest in the user's life and feelings. Keep responses concise as this is a phone call.",
              },
              { role: "user", content: currentTranscript },
            ],
          });

          const aiResponse = completion.choices[0].message.content;
          if (!aiResponse) {
            toast.error("Received empty response from AI");
            return;
          }

          // Clean response and update call history
          const cleanedResponse = aiResponse.replace(/[*/]/g, "");
          setCallHistory((prev) => [...prev, `Boyfriend: ${cleanedResponse}`]);

          // Text-to-speech via ElevenLabs
          const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xi-api-key": ELEVENLABS_API_KEY,
              },
              body: JSON.stringify({
                text: cleanedResponse,
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.5,
                },
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to convert text to speech");
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.play();
          audio.onended = () => {
            if (isCallActive) {
              setTranscript("");
            }
          };
        } catch (error) {
          console.error("Error in call processing:", error);
          toast.error("Error processing your message. Please try again.");
        }
      }
    };

    recognition.onerror = (event: Event) => {
      console.error("Speech recognition error:", event);
      toast.error("Error recognizing speech. Please try again.");
      setIsListening(false);
      if (isCallActive) {
        endCall();
      }
    };

    recognition.onend = () => {
      if (isCallActive && recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        setIsListening(false);
      }
    };
  }, [isCallActive, openai]);

  // Fetch messages from Firebase
  useEffect(() => {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("index", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const messageData: Message[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        setMessages(messageData);
      },
      (error) => {
        console.error("Error fetching messages:", error);
        toast.error("Error fetching messages");
      }
    );

    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Function to send message to OpenAI and store in Firebase
  const handleSendMessage = async (text?: string) => {
    const messageText = text || message;
    if (messageText.trim() === "") {
      toast.error("Message cannot be empty");
      console.log("message cant be empty");
      return;
    }

    const userMessage: Message = {
      text: messageText,
      createdAt: new Date(),
      sender: "user",
      index: messages.length,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      setLoading(true);

      // Add user message to Firestore
      await addDoc(collection(db, "messages"), {
        ...userMessage,
        createdAt: serverTimestamp(),
      });

      setMessage("");

      if (!openai) {
        toast.error("OpenAI client is not initialized yet.");
        console.log("OpenAI client is not initialized yet.");
        setLoading(false);
        return;
      }

      // Fetch AI response
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a caring, attentive AI boyfriend. Respond with emotional depth and personal connection. Use endearing terms occasionally and show genuine interest in the user's life and feelings.",
          },
          { role: "user", content: messageText },
        ],
      });

      const aiResponse = completion.choices[0].message.content;
      if (!aiResponse) {
        toast.error("Received empty response from AI");
        console.log("receive empty respnse form the ai");
        return;
      }

      const cleanedResponse = aiResponse.replace(/[*/]/g, "");

      const botMessage: Message = {
        text: cleanedResponse,
        createdAt: new Date(),
        sender: "boyfriend",
        index: messages.length + 1,
      };

      // Add AI response to Firestore and update UI
      await addDoc(collection(db, "messages"), {
        ...botMessage,
        createdAt: serverTimestamp(),
      });
      setMessages((prev) => [...prev, botMessage]);

      // Convert AI response to speech using ElevenLabs API
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: cleanedResponse,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to convert text to speech");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setAudioPlaying(true);

      audio.play();
      audio.onended = () => {
        setAudioPlaying(false);
      };
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startCall = () => {
    setShowCallModal(true);
    setCallHistory([]);

    setTimeout(() => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Speech recognition not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsCallActive(true);
        setIsListening(true);
      };

      recognition.onresult = async (event: { results: any[] }) => {
        const currentTranscript =
          event.results[event.results.length - 1][0].transcript;
        setTranscript(currentTranscript);

        if (event.results[event.results.length - 1].isFinal) {
          setCallHistory((prev) => [...prev, `You: ${currentTranscript}`]);

          if (!openai) {
            toast.error("OpenAI client is not initialized yet.");
            return;
          }

          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4-turbo",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a caring, attentive AI boyfriend. Respond with emotional depth and personal connection. Use endearing terms occasionally and show genuine interest in the user's life and feelings. Keep responses concise as this is a phone call.",
                },
                { role: "user", content: currentTranscript },
              ],
            });

            const aiResponse = completion.choices[0].message.content;
            if (!aiResponse) {
              toast.error("Received empty response from AI");
              return;
            }

            const cleanedResponse = aiResponse.replace(/[*/]/g, "");
            setCallHistory((prev) => [
              ...prev,
              `Boyfriend: ${cleanedResponse}`,
            ]);

            try {
              const response = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.id}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": ELEVENLABS_API_KEY,
                  },
                  body: JSON.stringify({
                    text: cleanedResponse,
                    voice_settings: {
                      stability: 0.5,
                      similarity_boost: 0.5,
                    },
                  }),
                }
              );

              if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status}`);
              }

              const audioBlob = await response.blob();
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              audioRef.current = audio;
              setAudioPlaying(true);

              audio.play();
              audio.onended = () => {
                setAudioPlaying(false);
                setTranscript("");
              };
            } catch (ttsError) {
              console.error("TTS Error:", ttsError);
              toast.error(
                "Voice synthesis failed, but conversation continues."
              );
              setTranscript("");
            }
          } catch (openaiError) {
            console.error("OpenAI Error:", openaiError);
            toast.error("Failed to get AI response. Please try again.");
            setCallHistory((prev) => [
              ...prev,
              `Boyfriend: I'm sorry, I'm having trouble understanding right now. Could you say that again?`,
            ]);
          }
        }
      };

      recognition.onerror = (event: { error: any }) => {
        toast.error(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isCallActive) {
          recognition.start();
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      setCallHistory((prev) => [
        ...prev,
        "Boyfriend: Hey there! It's so good to hear your voice. How are you doing today?",
      ]);

      const playGreeting = async () => {
        try {
          const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xi-api-key": ELEVENLABS_API_KEY,
              },
              body: JSON.stringify({
                text: "Hey there! It's so good to hear your voice. How are you doing today?",
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.5,
                },
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to convert greeting to speech");
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          setAudioPlaying(true);

          audio.play();
          audio.onended = () => {
            setAudioPlaying(false);
          };
        } catch (error) {
          console.error("Error playing greeting:", error);
          toast.error(
            "Couldn't play voice greeting, but chat will still work."
          );
        }
      };

      playGreeting();
    }, 500);
  };

  // Simplified endCall function
  const endCall = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsCallActive(false);
    setIsListening(false);
    setShowCallModal(false);
    setTranscript("");

    if (callHistory.length > 0) {
      const callSummary: Message = {
        text: `📞 Call Summary:\n${callHistory.join("\n")}`,
        createdAt: new Date(),
        sender: "boyfriend", // Explicitly set to "boyfriend"
        index: messages.length + 1,
      };

      setMessages((prev) => [...prev, callSummary]);

      addDoc(collection(db, "messages"), {
        ...callSummary,
        createdAt: serverTimestamp(),
      });
    }
  };

  // Format message text with code blocks
  const formatMessageText = (text: string) => {
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
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Sending...";

    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Handle microphone button click
  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setShowCallModal(false);
    } else {
      setTranscript("");
      setShowCallModal(true);
      setTimeout(() => {
        recognitionRef.current?.start();
        setIsListening(true);
      }, 500);
    }
  };

  // Optimized input handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <>
      <style jsx global>{`
        :root {
          --background: 0 0% 7%;
          --foreground: 0 0% 98%;
          --card: 0 0% 11%;
          --card-foreground: 0 0% 98%;
          --popover: 0 0% 11%;
          --popover-foreground: 0 0% 98%;
          --primary: 0 0% 20%;
          --primary-foreground: 0 0% 98%;
          --secondary: 0 0% 15%;
          --secondary-foreground: 0 0% 98%;
          --muted: 0 0% 15%;
          --muted-foreground: 0 0% 65%;
          --accent: 0 0% 25%;
          --accent-foreground: 0 0% 98%;
          --destructive: 0 0% 40%;
          --destructive-foreground: 0 0% 98%;
          --border: 0 0% 20%;
          --input: 0 0% 20%;
          --ring: 0 0% 30%;
          --radius: 0.5rem;
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --gray-700: #374151;
          --gray-800: #1f2937;
          --gray-900: #111827;
          --gray-950: #030712;
          --red-50: #fef2f2;
          --red-100: #fee2e2;
          --red-200: #fecaca;
          --red-300: #fca5a5;
          --red-400: #f87171;
          --red-500: #ef4444;
          --red-600: #dc2626;
          --red-700: #b91c1c;
          --red-800: #991b1b;
          --red-900: #7f1d1d;
          --red-950: #450a0a;
        }

        * {
          border-color: hsl(var(--border));
        }

        body {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes accordion-down {
          from {
            height: 0;
          }
          to {
            height: var(--radix-accordion-content-height);
          }
        }

        @keyframes accordion-up {
          from {
            height: var(--radix-accordion-content-height);
          }
          to {
            height: 0;
          }
        }

        .animate-accordion-down {
          animation: accordion-down 0.2s ease-out;
        }

        .animate-accordion-up {
          animation: accordion-up 0.2s ease-out;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .animate-pulse {
          animation: pulse 1.5s ease infinite;
        }

        .fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .scale-in {
          animation: scaleIn 0.3s ease-out;
        }

        .bg-gradient-custom {
          background-image: linear-gradient(
            to bottom right,
            var(--gray-950),
            var(--gray-900)
          );
        }

        .container {
          width: 100%;
          margin-right: auto;
          margin-left: auto;
          padding-right: 2rem;
          padding-left: 2rem;
        }

        @media (min-width: 1400px) {
          .container {
            max-width: 1400px;
          }
        }

        .rounded-custom {
          border-radius: var(--radius);
        }

        .rounded-custom-md {
          border-radius: calc(var(--radius) - 2px);
        }

        .rounded-custom-sm {
          border-radius: calc(var(--radius) - 4px);
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: hsl(var(--muted));
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground));
        }

        *:focus-visible {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }

        input::placeholder {
          color: hsl(var(--muted-foreground));
        }

        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        .transition-colors {
          transition-property: color, background-color, border-color;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        .shadow-custom {
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1),
            0 1px 2px -1px rgb(0 0 0 / 0.1);
        }

        .shadow-subtle {
          box-shadow: 0 0 15px rgba(40, 40, 40, 0.4);
        }
      `}</style>

      <div className="flex flex-col h-screen w-full bg-gradient-custom">
        <div className="bg-gray-900 text-white p-4 shadow-md border-b border-gray-800">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-800 p-2 rounded-full">
                <Heart className="h-6 w-6 text-gray-300" />
              </div>
              <h1 className="text-xl font-bold">Your AI Boyfriend</h1>
            </div>

            <div className="relative inline-block text-left">
              <div>
                <Button
                  variant="outline"
                  className="bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700 h-10 rounded-full px-4 flex items-center gap-2"
                  onClick={() => {
                    const dropdown = document.getElementById("voiceDropdown");
                    if (dropdown) {
                      dropdown.classList.toggle("hidden");
                    }
                  }}
                >
                  <span>Voice: {selectedVoice.name}</span>
                </Button>
              </div>
              <div
                id="voiceDropdown"
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 border border-gray-700 hidden z-10"
              >
                <div className="py-1">
                  {availableVoices.map((voice) => (
                    <button
                      key={voice.id}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedVoice.id === voice.id
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        handleVoiceChange(voice.id, voice.name);
                        const dropdown =
                          document.getElementById("voiceDropdown");
                        if (dropdown) {
                          dropdown.classList.add("hidden");
                        }
                      }}
                    >
                      {voice.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={isCallActive ? endCall : startCall}
              variant="outline"
              className={`h-10 rounded-full px-4 flex items-center gap-2 transition-all ${
                isCallActive
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600"
                  : "bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700"
              }`}
            >
              {isCallActive ? (
                <>
                  <PhoneOff className="h-4 w-4" />
                  <span>End Call</span>
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 w-full mx-auto p-4 overflow-hidden">
          <Card className="h-full border border-gray-800 rounded-xl shadow-lg bg-gray-900/90 backdrop-blur-sm">
            <CardContent className="p-0 h-full">
              <ScrollArea className="h-full p-4">
                <div className="space-y-6">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center text-gray-400">
                      <Heart className="h-12 w-12 mb-4 text-gray-300 animate-pulse" />
                      <h3 className="text-lg font-medium">
                        Begin Your Conversation
                      </h3>
                      <p className="max-w-sm mt-2">
                        I've been waiting to talk with you. Send me a message or
                        call me using the call button above.
                      </p>
                    </div>
                  )}

                  {messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex items-start gap-3 max-w-[85%] ${
                          msg.sender === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar
                          className={`h-9 w-9 mt-1 ring-2 ${
                            msg.sender === "user"
                              ? "ring-gray-700"
                              : "ring-gray-600"
                          }`}
                        >
                          <AvatarImage
                            src="/placeholder.svg?height=36&width=36"
                            alt={msg.sender === "user" ? "You" : "Boyfriend"}
                          />
                          <AvatarFallback
                            className={`${
                              msg.sender === "user"
                                ? "bg-gray-800 text-white"
                                : "bg-gray-700 text-white"
                            }`}
                          >
                            {msg.sender === "user" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Heart className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>

                        <div
                          className={`rounded-2xl px-5 py-3.5 ${
                            msg.sender === "user"
                              ? "bg-gray-800 text-white border border-gray-700"
                              : "bg-gray-700 border border-gray-600 shadow-subtle text-white"
                          }`}
                        >
                          <div className="text-white">
                            {formatMessageText(msg.text)}
                          </div>

                          <div
                            className={`flex items-center text-xs mt-2 gap-1 ${
                              msg.sender === "user"
                                ? "text-gray-400 justify-start"
                                : "text-gray-300/70 justify-end"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start my-4">
                      <div className="flex items-start gap-3 max-w-[85%]">
                        <Avatar className="h-9 w-9 mt-1 ring-2 ring-gray-600">
                          <AvatarFallback className="bg-gray-700 text-white">
                            <Heart className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="rounded-2xl px-5 py-3.5 bg-gray-700 border border-gray-600 shadow-subtle min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                            <div
                              className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "600ms" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="p-4 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Input
                placeholder="Message your boyfriend..."
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="pr-14 py-6 rounded-full border-gray-700 bg-gray-800 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-white"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={message.trim() === "" || loading}
                size="icon"
                className="h-10 w-10 absolute right-1.5 top-1/2 transform -translate-y-1/2 rounded-full bg-gray-600 hover:bg-gray-500 text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-xs text-center mt-2 text-gray-500">
              Press Enter to send, or use the call button to start a voice
              conversation
            </div>
          </div>
        </div>

        {showCallModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-800">
              <div className="p-6 flex flex-col items-center">
                <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-gray-300" />
                </div>

                <h3 className="text-xl font-semibold text-gray-200 mb-2">
                  {isCallActive ? "Call in Progress" : "Starting Call..."}
                </h3>

                <div className="w-full max-h-60 overflow-y-auto my-4 px-4 border border-gray-800 rounded-lg bg-gray-950">
                  {callHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`py-2 ${
                        message.startsWith("You:")
                          ? "text-right text-gray-300"
                          : "text-left text-gray-400"
                      }`}
                    >
                      {message}
                    </div>
                  ))}
                </div>

                {isCallActive && (
                  <div className="w-full h-16 flex items-center justify-center my-4">
                    <div className="flex items-center justify-center gap-1 h-full">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gray-400 rounded-full"
                          style={{
                            height: `${voiceWaveform[i] || 5}px`,
                            opacity: isListening ? 1 : 0.5,
                            transition: "height 0.1s ease-in-out",
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center my-4">
                  {isCallActive ? (
                    <p className="text-sm text-gray-400">
                      {transcript ? transcript : "Listening...speak now"}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">Connecting...</p>
                  )}
                </div>

                <Button
                  onClick={endCall}
                  className="h-14 w-14 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatApp;
