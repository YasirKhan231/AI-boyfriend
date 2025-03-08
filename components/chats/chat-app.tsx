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
  getDocs,
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
  const [showAudioPlayer, setShowAudioPlayer] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState({
    id: "21m00Tcm4TlvDq8ikWAM", // Default voice ID
    name: "Josh", // Default voice name
  });

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null!);

  const recognitionRef = useRef<any>(null);

  // ELEVENLABS API key
  const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "";

  // OpenAI client state
  const [openai, setOpenai] = useState<OpenAI | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirect to the sign-in page if the user is not authenticated
        router.push("/signin");
      } else {
        // User is authenticated, allow rendering
        setIsAuthChecked(true);
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [router]);
  const handleCancelAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioPlaying(false);
    }
    setShowAudioPlayer(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch messages only after the user is authenticated
        const messagesRef = collection(db, "users", user.uid, "chats");
        const q = query(messagesRef, orderBy("index", "asc")); // Order messages by index

        // Listen for real-time updates
        const unsubscribeMessages = onSnapshot(
          q,
          (snapshot) => {
            const messageData: Message[] = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Message[];
            setMessages(messageData); // Update the state with the fetched messages
          },
          (error) => {
            console.error("Error fetching messages:", error);
            toast.error("Error fetching messages");
          }
        );

        // Cleanup the messages listener when the component unmounts
        return () => unsubscribeMessages();
      } else {
        console.log("User is not authenticated. Redirecting to sign-in page.");
        router.push("/signin"); // Redirect to sign-in page if user is not authenticated
      }
    });

    // Cleanup the auth listener when the component unmounts
    return () => unsubscribe();
  }, [router]);
  // Initialize OpenAI client
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
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
  // useEffect(() => {
  //   const user = auth.currentUser;
  //   if (!user) {
  //     console.log("User not authenticated. Cannot fetch messages.");
  //     return;
  //   }

  //   console.log("Fetching messages for user:", user.uid);

  //   // Reference to the user's `chats` subcollection
  //   const messagesRef = collection(db, "users", user.uid, "chats");
  //   const q = query(messagesRef, orderBy("index", "asc")); // Order messages by index

  //   // Listen for real-time updates
  //   const unsubscribe = onSnapshot(
  //     q,
  //     (snapshot) => {
  //       const messageData: Message[] = snapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       })) as Message[];
  //       console.log("Fetched messages:", messageData);
  //       setMessages(messageData); // Update the state with the fetched messages
  //     },
  //     (error) => {
  //       console.error("Error fetching messages:", error);
  //       toast.error("Error fetching messages");
  //     }
  //   );

  //   return () => unsubscribe(); // Cleanup the listener on unmount
  // }, []);
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
    const user = auth.currentUser;
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    const messageText = text || message;
    if (messageText.trim() === "") {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      setLoading(true);

      // Fetch the current messages to calculate the next index
      const messagesRef = collection(db, "users", user.uid, "chats");
      const q = query(messagesRef, orderBy("index", "asc"));
      const snapshot = await getDocs(q);
      const nextIndex = snapshot.size; // Index starts from 0

      // Create the new message object for the user
      const userMessage: Message = {
        text: messageText,
        createdAt: new Date(),
        sender: "user",
        index: nextIndex,
      };

      // Add the user's message to Firestore
      await addDoc(messagesRef, {
        ...userMessage,
        createdAt: serverTimestamp(),
      });

      console.log("User message stored in Firestore:", messageText);
      setMessage(""); // Clear the input field

      // Ensure OpenAI client is ready
      if (!openai) {
        toast.error("OpenAI client is not initialized yet.");
        return;
      }

      // Fetch AI response
      console.log("Sending message to OpenAI:", messageText);
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
      console.log("AI Response:", cleanedResponse);

      // Create the new message object for the AI
      const botMessage: Message = {
        text: cleanedResponse,
        createdAt: new Date(),
        sender: "boyfriend",
        index: nextIndex + 1, // Increment the index
      };

      // Add the AI's response to Firestore
      await addDoc(messagesRef, {
        ...botMessage,
        createdAt: serverTimestamp(),
      });

      console.log("AI message stored in Firestore:", cleanedResponse);

      // Update the UI with the AI's response
      setMessages((prev) => [...prev, userMessage, botMessage]);

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
        setShowAudioPlayer(true); // Show the audio player
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setAudioPlaying(true);

        audio.play();
        audio.onended = () => {
          setAudioPlaying(false);
          setShowAudioPlayer(false); // Hide the audio player when done
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
    setCallStartTime(new Date());
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

      // Inside the recognition.onresult handler
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
            setCallHistory((prev) => [
              ...prev,
              `Boyfriend: ${cleanedResponse}`,
            ]);

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
  const endCall = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsCallActive(false);
    setIsListening(false);
    setShowCallModal(false);
    setTranscript("");

    const user = auth.currentUser;
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    // Pre-check for callStartTime
    if (!callStartTime) {
      console.log("Start time is not set. Cannot calculate duration.");
      return;
    }

    // Prepare call log data
    const callLogData = {
      callHistory: callHistory, // Array of messages
      startTime: serverTimestamp(), // Timestamp when the call started
      endTime: serverTimestamp(), // Timestamp when the call ended
      duration: new Date().getTime() - callStartTime.getTime(), // Duration in milliseconds
    };

    try {
      // Save call log to Firestore
      const callLogsRef = collection(db, "users", user.uid, "callLogs");
      console.log("Firestore Path:", `users/${user.uid}/callLogs`);
      console.log("Call Log Data:", callLogData);

      await addDoc(callLogsRef, callLogData);

      // Optionally, save a summary to the chat history
      const callSummary: Message = {
        text: `📞 Call Summary:\n${callHistory.join("\n")}`,
        createdAt: new Date(),
        sender: "boyfriend",
        index: messages.length + 1,
      };

      setMessages((prev) => [...prev, callSummary]);

      // Save the summary to Firestore
      const messagesRef = collection(db, "users", user.uid, "chats");
      await addDoc(messagesRef, {
        ...callSummary,
        createdAt: serverTimestamp(),
      });

      toast.success("Call log saved successfully.");
    } catch (error) {
      console.error("Error saving call log:", error);
      toast.error("Failed to save call log.");
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

        {showAudioPlayer && currentAudioUrl && (
          <AudioPlayer
            audioUrl={currentAudioUrl}
            isPlaying={audioPlaying}
            isMuted={audioMuted}
            toggleMute={toggleMute}
            onCancel={handleCancelAudio}
          />
        )}
      </div>
    </>
  );
};

export default ChatApp;
