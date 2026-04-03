import { Router } from "express";
import multer from "multer";

import { uploadToCloudinary } from "../middleware/upload.ts";
import {
  // Course endpoints
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,

  // Module endpoints
  createModule,
  updateModule,
  deleteModule,
  getModuleById,
  getModules,

  // Content unit endpoints
  createContentUnit,
  getContentUnitsByModule,
  getContentUnitById,
  updateContentUnit,
  deleteContentUnit,

  // Enrollment endpoints
  enrollInCourse,
  unenrollFromCourse,
  getEnrolledCourses,

  // Progress tracking
  updateUnitProgress,

  // Admin endpoints
  getAdminCourses,
  toggleCoursePublish,
} from "../controllers/courses.ts";

import authMiddleware from "../middleware/auth.ts";
import adminMiddleware from "../middleware/admin.ts";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const courseRoutes = Router();

// Course routes
courseRoutes.post(
  "/",
  [authMiddleware, adminMiddleware],
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  uploadToCloudinary,
  createCourse
);

courseRoutes.get("/view", getCourses);
courseRoutes.get("/view/:id", getCourseById);

courseRoutes.put(
  "/:id",
  [authMiddleware, adminMiddleware],
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  uploadToCloudinary,
  updateCourse
);

courseRoutes.delete("/:id", [authMiddleware, adminMiddleware], deleteCourse);

// Module routes — no image upload (thumbnail removed from CourseModule)
courseRoutes.post("/modules", [authMiddleware, adminMiddleware], createModule);
courseRoutes.put("/modules/:id", [authMiddleware, adminMiddleware], updateModule);
courseRoutes.delete("/modules/:id", [authMiddleware, adminMiddleware], deleteModule);
courseRoutes.get("/modules/:id", getModuleById);
courseRoutes.get("/modules", getModules);

// Content unit routes
courseRoutes.post(
  "/units",
  [authMiddleware, adminMiddleware],
  upload.single("file"),
  uploadToCloudinary,
  createContentUnit
);
courseRoutes.get("/modules/:moduleId/units", authMiddleware, getContentUnitsByModule);
courseRoutes.get("/units/:id", authMiddleware, getContentUnitById);
courseRoutes.put("/units/:id", [authMiddleware, adminMiddleware], updateContentUnit);
courseRoutes.delete("/units/:id", [authMiddleware, adminMiddleware], deleteContentUnit);

// Enrollment routes
courseRoutes.post("/enroll", authMiddleware, enrollInCourse);
courseRoutes.post("/unenroll", authMiddleware, unenrollFromCourse);
courseRoutes.get("/enrolled", authMiddleware, getEnrolledCourses);

// Progress tracking
courseRoutes.post("/progress/unit", authMiddleware, updateUnitProgress);

// Admin routes
courseRoutes.get("/admin/view", [authMiddleware, adminMiddleware], getAdminCourses);
courseRoutes.patch("/:id/publish", [authMiddleware, adminMiddleware], toggleCoursePublish);

export default courseRoutes;
