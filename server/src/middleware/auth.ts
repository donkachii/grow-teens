import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient.ts";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Support both "Bearer <token>" and "token <token>" formats
  let token: string;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (authHeader.startsWith("token ")) {
    token = authHeader.slice(6).trim();
  } else {
    token = authHeader.trim();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };

    const user = await prisma.user.findFirst({
      where: { id: payload.id },
      include: {
        enrollments: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach the user to the request object for later use
    const { password: _, ...userWithoutPassword } = user;

    prisma.user
      .update({
        where: { id: user.id },
        data: { lastActive: new Date() },
      })
      .catch((err) => console.error("Failed to update lastActive:", err));

    req.user = userWithoutPassword;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
