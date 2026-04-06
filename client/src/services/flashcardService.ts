import requestClient from "@/lib/requestClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextAuthUserSession } from "@/types";


const data: NextAuthUserSession | null = await getServerSession(authOptions);

const API_URL = requestClient({token: data?.user?.token});

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  tags?: string;
  difficultyLevel: number;
  timesReviewed: number;
  lastReviewed?: Date;
}

export interface FlashcardCollection {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
}

export const flashcardService = {
  // Generate flashcards for a module
  generateFlashcards: async (moduleId: number, count = 5) => {
    const response = await API_URL.post('/generate', { moduleId, count });
    return response.data;
  },

  // Get user's flashcards with filters
  getUserFlashcards: async (filters: { moduleId?: number; programId?: number; collectionId?: number }) => {
    const response = await API_URL.get('/', { params: filters });
    return response.data;
  },

  // Record interaction with a flashcard
  recordInteraction: async (flashcardId: number, data: { correct: boolean; responseTime?: number }) => {
    const response = await API_URL.post(`/${flashcardId}/interaction`, data);
    return response.data;
  },

  // Create a new collection
  createCollection: async (data: { name: string; description?: string; isPublic?: boolean }) => {
    const response = await API_URL.post('/collections', data);
    return response.data;
  },

  // Add flashcard to collection
  addToCollection: async (collectionId: number, flashcardId: number) => {
    const response = await API_URL.post('/collections/add', { collectionId, flashcardId });
    return response.data;
  },
};