import { Router } from "express";
import { getCategories, createCategory, deleteCategory } from "../controllers/categories.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";

const categoryRoutes = Router();

categoryRoutes.get("/", getCategories);
categoryRoutes.post("/", [authMiddleware, adminMiddleware], createCategory);
categoryRoutes.delete("/:id", [authMiddleware, adminMiddleware], deleteCategory);

export default categoryRoutes;
