import type { Request, Response } from "express";
import prisma from "../prismaClient.ts";

export const createEnrollment = async (req: Request, res: Response) => {
  const { userId, courseId } = req.body;

  try {
    if ([userId, courseId].some((field) => !field)) {
      return res.status(400).json({ error: "User and course are required" });
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({ error: "User is already enrolled in this course" });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error("Error enrolling user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEnrollmentById = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const enrollment = await prisma.enrollment.findMany({
      where: { userId: +userId },
      include: { course: true },
    });

    if (!enrollment)
      return res.status(404).json({ error: "Enrollment not found" });
    res.status(200).json(enrollment);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getEnrollmentStatus = async (req: Request, res: Response) => {
  const { userId, courseId } = req.params;
  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: Number(userId),
        courseId: Number(courseId),
      },
      include: { course: true },
    });

    if (!enrollment) {
      return res.status(200).json({ enrolled: false });
    }

    return res.status(200).json({
      enrolled: true,
      enrollmentStatus: enrollment.status,
      enrolledAt: enrollment.enrollmentDate,
    });
  } catch (error) {
    console.error("Error fetching enrollment status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
