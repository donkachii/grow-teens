import { Router } from "express";

import {
  createEnrollment,
  getEnrollmentById,
  getEnrollmentStatus,
} from "../controllers/enrollments.ts";
import authMiddleware from "../middleware/auth.ts";
import adminMiddleware from "../middleware/admin.ts";

const enrollRoutes = Router();

enrollRoutes.post("/", [authMiddleware], createEnrollment);

enrollRoutes.get("/:userId", [authMiddleware], getEnrollmentById);

enrollRoutes.get("/:userId/:courseId", [authMiddleware], getEnrollmentStatus);

export default enrollRoutes;
