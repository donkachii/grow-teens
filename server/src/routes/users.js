import { Router } from "express";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from "../controllers/users.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";

const userRoutes = Router();

userRoutes.get("/", [authMiddleware, adminMiddleware], getAllUsers);
userRoutes.patch(
  "/:userId/status",
  [authMiddleware, adminMiddleware],
  updateUserStatus
);
userRoutes.patch(
  "/:userId/role",
  [authMiddleware, adminMiddleware],
  updateUserRole
);

export default userRoutes;
