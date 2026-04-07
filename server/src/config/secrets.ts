import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server/.env"),
];

const envPath = envPaths.find((candidate) => fs.existsSync(candidate));

dotenv.config(envPath ? { path: envPath } : undefined);

export const PORT = process.env.SERVER_PORT;
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
export const NODE_ENV = process.env.NODE_ENV as "development" | "production" | "test";
export const CANVAS_API_KEY = process.env.CANVAS_API_KEY;
export const EMAIL_FROM = process.env.EMAIL_FROM ?? process.env.EMAIL_USERNAME;
export const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (
  !PORT ||
  !DATABASE_URL ||
  !JWT_SECRET ||
  !CLOUDINARY_API_KEY ||
  !CLOUDINARY_API_SECRET ||
  !CLOUDINARY_CLOUD_NAME ||
  !OPENROUTER_API_KEY ||
  !NODE_ENV ||
  !CANVAS_API_KEY ||
  !EMAIL_FROM ||
  !BREVO_API_KEY
) {
  throw new Error("Missing environment variables");
}
