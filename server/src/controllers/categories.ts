import type { Request, Response } from "express";
import prisma from "../prismaClient.ts";

const slugify = (name: string): string =>
  String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id: +id } });
    res.status(204).end();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(500).json({ error: "Failed to delete category" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, description, icon } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Category name is required" });
  }
  try {
    const category = await prisma.category.create({
      data: {
        name: String(name).trim(),
        slug: slugify(name),
        description: description ? String(description).trim() : null,
        icon: icon || null,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "P2002") {
      return res.status(409).json({ error: "A category with this name already exists" });
    }
    res.status(500).json({ error: "Failed to create category" });
  }
};
