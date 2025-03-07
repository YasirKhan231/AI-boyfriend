// Define types for messages
 export type Message = {
  id?: string; // Optional, as Firestore will generate this
  text: string;
  createdAt: Date;
  sender: "user" | "boyfriend";
  index?: number; // This is the missing property
};

export interface Voice {
  id: string
  name: string
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

export interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

export interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  length: number
  isFinal: boolean
}

export interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

