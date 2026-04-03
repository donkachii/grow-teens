import prisma from "../../prismaClient.ts";
import type { Request, Response } from "express";

const handleError = (err: Error & { code?: string }, res: Response, defaultMessage = "Service unavailable") => {
  console.error("Admin dashboard error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    code: err.code,
  });
  return res.status(503).json({ error: defaultMessage });
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalCourses, totalPrograms, totalEnrollments, totalCourseReviews] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.program.count(),
      prisma.enrollment.count(),
      prisma.courseReview.count(),
    ]);
    res.status(200).json({ totalUsers, totalCourses, totalPrograms, totalEnrollments, totalCourseReviews });
  } catch (error) {
    handleError(error as Error & { code?: string }, res, "Failed to get admin dashboard");
  }
};