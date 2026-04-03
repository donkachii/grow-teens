import type { Request, Response, NextFunction } from "express";

const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user || user.role !== "ADMIN") {
    return res.status(401).json({ message: "Unauthorized" });
  } else {
    next();
  }
};

export default adminMiddleware;
