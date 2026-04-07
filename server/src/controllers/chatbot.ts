import type { Request, Response } from "express";
import prisma from "../prismaClient.ts";

// Create or retrieve a session
export const getOrCreateSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.query;

    let session;

    if (sessionId) {
      // Get existing session
      session = await prisma.chatbotSession.findUnique({
        where: { id: Number(sessionId), userId },
        include: { messages: { orderBy: { timestamp: "asc" } } },
      });

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
    } else {
      // Create new session
      session = await prisma.chatbotSession.create({
        data: {
          userId,
          title: "New Conversation",
        },
        include: { messages: true },
      });
    }

    res.json({
      message: "Session retrieved successfully",
      data: session
    });
  } catch (error) {
    console.error("Error with chatbot session:", error);
    res.status(500).json({ message: "Failed to manage chatbot session" });
  }
};

// Save messages from frontend (both user and AI messages)
export const saveMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      sessionId,
      userMessage,
      assistantMessage,
      aiModel
    } = req.body;

    if (!sessionId || !userMessage?.trim() || !assistantMessage?.trim()) {
      return res.status(400).json({ message: "sessionId, userMessage, and assistantMessage are required" });
    }

    // Verify session ownership
    const session = await prisma.chatbotSession.findUnique({
      where: { id: Number(sessionId), userId },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Save user message
    const savedUserMessage = await prisma.chatbotMessage.create({
      data: {
        sessionId: Number(sessionId),
        content: userMessage,
        role: "USER",
      },
    });

    // Save assistant message
    const savedAssistantMessage = await prisma.chatbotMessage.create({
      data: {
        sessionId: Number(sessionId),
        content: assistantMessage,
        role: "ASSISTANT",
        model: aiModel
      },
    });

    res.json({ 
      message: "Messages saved successfully",
      data: {
        userMessage: savedUserMessage,
        assistantMessage: savedAssistantMessage
      }
    });
  } catch (error) {
    console.error("Error saving messages:", error);
    res.status(500).json({ message: "Failed to save messages" });
  }
};

// Helper function to update session analytics
async function updateSessionAnalytics(sessionId: number) {
  try {
    // Get all messages for the session
    const messages = await prisma.chatbotMessage.findMany({
      where: { sessionId }
    });

    // Calculate analytics
    const userMessages = messages.filter(msg => msg.role === "USER");
    const aiMessages = messages.filter(msg => msg.role === "ASSISTANT");
    
    const averageUserMessageLength = userMessages.length > 0 
      ? Math.round(userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length) 
      : 0;
    
    const averageAiResponseLength = aiMessages.length > 0 
      ? Math.round(aiMessages.reduce((sum, msg) => sum + msg.content.length, 0) / aiMessages.length) 
      : 0;

    // Update or create analytics record
    await prisma.chatbotSessionAnalytics.upsert({
      where: { sessionId },
      update: {
        messageCount: messages.length,
        userMessageCount: userMessages.length,
        aiMessageCount: aiMessages.length,
        averageUserMessageLength,
        averageAiResponseLength
      },
      create: {
        sessionId,
        messageCount: messages.length,
        userMessageCount: userMessages.length,
        aiMessageCount: aiMessages.length,
        averageUserMessageLength,
        averageAiResponseLength
      }
    });
  } catch (error) {
    console.error("Error updating session analytics:", error);
  }
}

// Submit feedback for a chatbot message
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { messageId } = req.params;
    const { rating, feedback } = req.body;

    // Verify message is from a session owned by the user
    const message = await prisma.chatbotMessage.findUnique({
      where: { id: Number(messageId) },
      include: { session: true },
    });

    if (!message || message.session.userId !== userId) {
      return res.status(403).json({ message: "Message not found or access denied" });
    }

    // Create or update feedback
    const chatbotFeedback = await prisma.chatbotFeedback.upsert({
      where: { messageId: Number(messageId) },
      update: { rating, feedback },
      create: {
        messageId: Number(messageId),
        userId,
        rating,
        feedback,
      },
    });

    res.json({
      message: "Feedback submitted successfully",
      data: chatbotFeedback
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
};

// List user's chatbot sessions
export const listSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const sessions = await prisma.chatbotSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
    
    res.json({
      message: "Sessions retrieved successfully",
      data: sessions
    });
  } catch (error) {
    console.error("Error listing sessions:", error);
    res.status(500).json({ message: "Failed to list sessions" });
  }
};

// Delete a session
export const deleteSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    
    // Verify session ownership
    const session = await prisma.chatbotSession.findUnique({
      where: { id: Number(sessionId), userId }
    });
    
    if (!session) {
      return res.status(404).json({ message: "Session not found or access denied" });
    }
    
    // Delete related records (analytics, messages, feedback)
    await prisma.$transaction([
      // Delete analytics first
      prisma.chatbotSessionAnalytics.deleteMany({
        where: { sessionId: Number(sessionId) }
      }),
      
      // Delete message feedback
      prisma.chatbotFeedback.deleteMany({
        where: { 
          message: { 
            sessionId: Number(sessionId) 
          } 
        }
      }),
      
      // Delete messages
      prisma.chatbotMessage.deleteMany({
        where: { sessionId: Number(sessionId) }
      }),
      
      // Finally delete the session
      prisma.chatbotSession.delete({
        where: { id: Number(sessionId) }
      })
    ]);
    
    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ message: "Failed to delete session" });
  }
};

// Update session title
export const updateSessionTitle = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    const { title } = req.body;

    // Verify session ownership
    const session = await prisma.chatbotSession.findUnique({
      where: { id: Number(sessionId), userId },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Update title
    const updatedSession = await prisma.chatbotSession.update({
      where: { id: Number(sessionId) },
      data: { title }
    });

    res.json({
      message: "Session title updated successfully",
      data: updatedSession
    });
  } catch (error) {
    console.error("Error updating session title:", error);
    res.status(500).json({ message: "Failed to update session title" });
  }
};