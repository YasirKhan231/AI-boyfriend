"use client";
import { useState, useEffect, useRef } from "react";
import type React from "react";

import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
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
import { toast } from "react-toastify";
import { OpenAI } from "openai";
import type { Message } from "@/types";
import ChatHeader from "./chat-headers";
import MessageList from "./message-list";
import InputArea from "./input-area";
import CallModal from "./callmodal";
import AudioPlayer from "./audio-player";
import GlobalStyles from "./global-styles";

const ChatApp: React.FC = () => {
  const router = useRouter();

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
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState({
    id: "21m00Tcm4TlvDq8ikWAM", // Default voice ID
    name: "Josh", // Default voice name
  });

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null!);

  const recognitionRef = useRef<any>(null);

  // ELEVENLABS API key
  const ELEVENLABS_API_KEY =
    "sk_ac995dd9e6d51b2e150ab2297ecca99d25573b8d833a3bd6";

  // OpenAI client state
  const [openai, setOpenai] = useState<OpenAI | null>(null);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("user is not authenticated");
        router.push("/signin"); // Redirect to sign-in page if user is not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [router]);

  // Initialize OpenAI client
  useEffect(() => {
    const apiKey =
      "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";
    if (!apiKey) {
      console.error("OpenAI API key not found in environment variables.");
      toast.error("OpenAI API key not configured.");
      return;
    }

    const openaiInstance = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
    setOpenai(openaiInstance);
  }, []);

  // Generate random waveform data for visualization
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        const newWaveform = Array.from(
          { length: 40 },
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

    recognition.onresult = async (event: any) => {
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
          if (!audioMuted) {
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
            setCurrentAudioUrl(audioUrl);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.play();
            setAudioPlaying(true);
            audio.onended = () => {
              setAudioPlaying(false);
              if (isCallActive) {
                setTranscript("");
              }
            };
          }
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
  }, [isCallActive, openai, selectedVoice.id, audioMuted]);

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

  // Toggle audio mute
  const toggleMute = () => {
    setAudioMuted(!audioMuted);
    if (audioRef.current) {
      audioRef.current.muted = !audioMuted;
      if (audioMuted && !audioRef.current.paused) {
        audioRef.current.play();
      }
    }
  };

  // Function to send message to OpenAI and store in Firebase
  const handleSendMessage = async (text?: string) => {
    const messageText = text || message;
    if (messageText.trim() === "") {
      toast.error("Message cannot be empty");
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
      if (!audioMuted) {
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
        setCurrentAudioUrl(audioUrl);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setAudioPlaying(true);

        audio.play();
        audio.onended = () => {
          setAudioPlaying(false);
        };
      }
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

            if (!audioMuted) {
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
                setCurrentAudioUrl(audioUrl);
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
            } else {
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
        if (audioMuted) return;

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
          setCurrentAudioUrl(audioUrl);
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

  // Handle voice change
  const handleVoiceChange = (voiceId: string, voiceName: string) => {
    setSelectedVoice({ id: voiceId, name: voiceName });
    toast.success(`Voice changed to ${voiceName}`);
  };

  return (
    <>
      <GlobalStyles />

      <div className="flex flex-col h-screen w-full bg-black">
        <ChatHeader
          selectedVoice={selectedVoice}
          handleVoiceChange={handleVoiceChange}
          isCallActive={isCallActive}
          startCall={startCall}
          endCall={endCall}
        />

        <MessageList
          messages={messages}
          loading={loading}
          messagesEndRef={messagesEndRef}
        />

        <InputArea
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          loading={loading}
          audioMuted={audioMuted}
          toggleMute={toggleMute}
          audioPlaying={audioPlaying}
        />

        {showCallModal && (
          <CallModal
            isCallActive={isCallActive}
            callHistory={callHistory}
            voiceWaveform={voiceWaveform}
            isListening={isListening}
            transcript={transcript}
            endCall={endCall}
            audioMuted={audioMuted}
            toggleMute={toggleMute}
          />
        )}

        {audioPlaying && currentAudioUrl && (
          <AudioPlayer
            audioUrl={currentAudioUrl}
            isPlaying={audioPlaying}
            isMuted={audioMuted}
            toggleMute={toggleMute}
          />
        )}
      </div>
    </>
  );
};

export default ChatApp;
