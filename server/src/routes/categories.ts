import { Router } from "express";
import { getCategories, createCategory, deleteCategory } from "../controllers/categories.ts";
import authMiddleware from "../middleware/auth.ts";
import adminMiddleware from "../middleware/admin.ts";

const categoryRoutes = Router();

categoryRoutes.get("/", getCategories);
categoryRoutes.post("/", [authMiddleware, adminMiddleware], createCategory);
categoryRoutes.delete("/:id", [authMiddleware, adminMiddleware], deleteCategory);

export default categoryRoutes;
