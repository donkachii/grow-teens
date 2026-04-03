import { Router } from "express";
import authMiddleware from "../middleware/auth.ts";
import adminMiddleware from "../middleware/admin.ts";
import {
  getCanvasConfig,
  saveCanvasConfig,
  getCanvasCourses,
  importCoursesFromCanvas,
  pushCourseToCanvas,
  syncEnrollments,
  getSyncLogs,
  importModules,
  importQuizzes,
  importAssignments,
  syncQuizResult,
} from "../controllers/canvas.ts";

const canvasRoutes = Router();

// All canvas routes require admin auth
canvasRoutes.use(authMiddleware, adminMiddleware);

canvasRoutes.get("/config", getCanvasConfig);
canvasRoutes.post("/config", saveCanvasConfig);

canvasRoutes.get("/courses", getCanvasCourses);

canvasRoutes.post("/sync/import", importCoursesFromCanvas);
canvasRoutes.post("/sync/push/:courseId", pushCourseToCanvas);
canvasRoutes.post("/sync/enrollments/:courseId", syncEnrollments);
canvasRoutes.post("/sync/modules/:courseId", importModules);
canvasRoutes.post("/sync/quizzes/:courseId", importQuizzes);
canvasRoutes.post("/sync/assignments/:courseId", importAssignments);
canvasRoutes.post("/sync/quiz-result/:courseId", syncQuizResult);

canvasRoutes.get("/sync/logs", getSyncLogs);

export default canvasRoutes;
