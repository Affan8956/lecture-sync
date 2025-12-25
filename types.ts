
export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
}

export interface LectureData {
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  title: string;
  timestamp: number;
  id: string;
  fileType: 'pdf' | 'audio';
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  SUMMARIZING = 'SUMMARIZING',
  GENERATING_CARDS = 'GENERATING_CARDS',
  GENERATING_QUIZ = 'GENERATING_QUIZ',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
