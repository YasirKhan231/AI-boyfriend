// Define types for messages
export interface Message {
  id?: string
  text: string
  createdAt?: any // Firestore timestamp
  sender: "user" | "boyfriend"
  index: number // Index to track the order of messages
}

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

