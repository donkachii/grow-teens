import { Router } from "express";
import { getAdminDashboard } from "../controllers/admin/admin.ts";

const adminRoutes = Router();

adminRoutes.get("/dashboard", getAdminDashboard);

export default adminRoutes;