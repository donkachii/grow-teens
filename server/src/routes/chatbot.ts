import express from "express";
import { 
  getOrCreateSession, 
  saveMessages, 
  submitFeedback, 
  listSessions,
  deleteSession,
  updateSessionTitle
} from "../controllers/chatbot.ts";
import authMiddleware from "../middleware/auth.ts";

const router = express.Router();

// Session management
router.get("/sessions", authMiddleware, listSessions);
router.get("/session", authMiddleware, getOrCreateSession);
router.put("/session/:sessionId", authMiddleware, updateSessionTitle);
router.delete("/session/:sessionId", authMiddleware, deleteSession);

// Message handling
router.post("/messages", authMiddleware, saveMessages);
router.post("/feedback/:messageId", authMiddleware, submitFeedback);

export default router;
