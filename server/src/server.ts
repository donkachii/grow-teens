import express from "express";
import cors from "cors";
// import bodyParser from "body-parser";
import { v2 as cloudinary } from "cloudinary";

import { connectToDB } from "./prismaClient.ts";

import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  PORT,
} from "./config/secrets.ts";
import { verifyEmailTransport } from "./utils/email.ts";

import rootRouter from "./routes/index.ts";

const app = express();

// TODO: Migrate to Typescript

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/api/v1", rootRouter);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

connectToDB();

verifyEmailTransport().catch((error) => {
  console.error("Email SMTP verification failed:", error);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
