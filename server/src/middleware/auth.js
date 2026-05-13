import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.startsWith("token ")
    ? authHeader.slice(6).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

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
