import { Router } from "express";
import multer from "multer";

import { uploadToCloudinary } from "../middleware/upload.js";
import { createProgram, updateProgram, deleteProgram, getProgramById, getPrograms, addCourseToProgram, removeCourseFromProgram } from "../controllers/programs.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const programRoutes = Router();

programRoutes.post(
  "/",
  [authMiddleware, adminMiddleware],
  upload.single("image"),
  uploadToCloudinary,
  createProgram
);

programRoutes.put(
  "/:id",
  [authMiddleware, adminMiddleware],
  upload.single("image"),
  uploadToCloudinary,
  updateProgram
);

programRoutes.delete("/:id", [authMiddleware, adminMiddleware], deleteProgram);

programRoutes.get("/:id", [authMiddleware], getProgramById);

programRoutes.get("/", [authMiddleware], getPrograms);

programRoutes.post("/:id/courses", [authMiddleware, adminMiddleware], addCourseToProgram);
programRoutes.delete("/:id/courses/:courseId", [authMiddleware, adminMiddleware], removeCourseFromProgram);

export default programRoutes;
