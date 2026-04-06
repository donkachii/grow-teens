import { Router } from "express";
import { getAllUsers, updateUserStatus, updateUserRole } from "../controllers/users.ts";
import authMiddleware from "../middleware/auth.ts";
import adminMiddleware from "../middleware/admin.ts";

const userRoutes = Router();

userRoutes.get("/", [authMiddleware, adminMiddleware], getAllUsers);
userRoutes.patch("/:userId/status", [authMiddleware, adminMiddleware], updateUserStatus);
userRoutes.patch("/:userId/role", [authMiddleware, adminMiddleware], updateUserRole);

export default userRoutes;
