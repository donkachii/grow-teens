import requestClient from "@/lib/requestClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextAuthUserSession } from "@/types";


const data: NextAuthUserSession | null = await getServerSession(authOptions);

const API_URL = requestClient({token: data?.user?.token});

export interface ChatMessage {
  id: number;
  content: string;
  role: 'USER' | 'ASSISTANT';
  timestamp: Date;
}

export interface ChatSession {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
}

export const chatbotService = {
  // Get or create a session
  getOrCreateSession: async (sessionId?: number) => {
    const response = await API_URL.get('/session', { params: { sessionId } });
    return response.data;
  },

  // Send a message and get a response
  sendMessage: async (data: { 
    sessionId: number; 
    message: string; 
    programId?: number; 
    moduleId?: number 
  }) => {
    const response = await API_URL.post('/message', data);
    return response.data;
  },

  // Submit feedback for a message
  submitFeedback: async (messageId: number, data: { rating?: number; feedback?: string }) => {
    const response = await API_URL.post(`/feedback/${messageId}`, data);
    return response.data;
  },

  // List all sessions
  listSessions: async () => {
    const response = await API_URL.get('/sessions');
    return response.data;
  },
};