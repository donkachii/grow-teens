import type { Request, Response, NextFunction } from "express";

const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export default adminMiddleware;
