import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import prisma from "../prismaClient.ts";
import crypto from "crypto";
import { sendEmail } from "../utils/email.ts";

type PrismaError = Error & { code?: string };

const handleError = (err: PrismaError, res: Response, defaultMessage = "Service unavailable") => {
  console.error("Authentication Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    code: err.code,
  });

  if (err.code === "P2025") {
    return res.status(404).json({ error: "Resource not found" });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ error: "Duplicate entry" });
  }

  return res.status(503).json({ error: defaultMessage });
};

const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a6cf7;">Welcome to GrowTeens!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        <p>This verification link will expire in 10 minutes.</p>
        <p>If you did not create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The GrowTeens Team</p>
      </div>
    `;

  await sendEmail(email, "Verify Your GrowTeens Account", "", html);
};

export const registerUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, role, age } = req.body as {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    age?: number;
  };

  try {
    const requiredFields = { firstName, lastName, email, password, role };
    const missingFields = Object.entries(requiredFields)
      .filter(
        ([, value]) =>
          !value || (typeof value === "string" && value.trim() === "")
      )
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        fields: missingFields,
        code: "MISSING_FIELDS",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        code: "INVALID_EMAIL",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long",
        code: "WEAK_PASSWORD",
      });
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists",
        code: "EMAIL_EXISTS",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: role as import("@prisma/client").UserRole,
          age,
          emailVerified: false,
          verificationToken,
          verificationExpires,
        },
      });

      await sendVerificationEmail(user.email, verificationToken);

      return res.status(201).json({
        message:
          "Registration successful. Please check your email to verify your account.",
        userId: user.id,
      });
    } catch (dbError) {
      if ((dbError as PrismaError).code === "P2002") {
        return res.status(409).json({
          error: "An account with this email already exists",
          code: "EMAIL_EXISTS",
        });
      }
      throw dbError;
    }
  } catch (err) {
    return handleError(err as PrismaError, res, "Unable to complete registration");
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
        code: "MISSING_CREDENTIALS",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Email not verified",
        message: "Please verify your email before logging in",
        code: "EMAIL_NOT_VERIFIED",
        needsVerification: true,
        email: user.email,
      });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "24h",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: userWithoutPassword,
      accessToken,
      message: "Login successful",
    });
  } catch (err) {
    return handleError(err as PrismaError, res, "Login failed");
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    if (!token) {
      return res.status(400).json({
        error: "Invalid verification token",
        code: "INVALID_TOKEN",
        status: "invalid",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      const expiredUser = await prisma.user.findFirst({
        where: { verificationToken: token },
      });

      console.log("Expired user:", expiredUser);

      if (expiredUser) {
        return res.status(410).json({
          error: "Verification link has expired",
          code: "TOKEN_EXPIRED",
          status: "expired",
          email: expiredUser.email,
        });
      }

      return res.status(404).json({
        error: "Invalid verification token",
        code: "INVALID_TOKEN",
        status: "invalid",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    return res.status(200).json({
      message: "Email verification successful",
      status: "success",
      email: user.email,
      userId: user.id,
    });
  } catch (err) {
    console.error("Email verification error:", {
      error: (err as Error).message,
      token: token?.substring(0, 6) + "...",
      stack: process.env.NODE_ENV === "development" ? (err as Error).stack : undefined,
    });

    return res.status(500).json({
      error: "Failed to verify email",
      code: "VERIFICATION_ERROR",
      status: "error",
    });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };

  try {
    if (!email) {
      return res.status(400).json({
        error: "Email is required",
        code: "MISSING_EMAIL",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(200).json({
        message:
          "If a user with this email exists, a verification email has been sent.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        error: "Email already verified",
        code: "ALREADY_VERIFIED",
      });
    }

    const lastSent = user.verificationExpires;
    const cooldownPeriod = 2 * 60 * 1000;

    if (lastSent && new Date().getTime() - new Date(lastSent).getTime() < cooldownPeriod) {
      const waitSeconds = Math.ceil(
        (cooldownPeriod - (new Date().getTime() - new Date(lastSent).getTime())) / 1000
      );
      return res.status(429).json({
        error: `Please wait ${waitSeconds} seconds before requesting another email`,
        code: "RATE_LIMITED",
        retryAfter: waitSeconds,
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationExpires },
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return res.status(500).json({
        error: "Failed to send verification email. Please try again later.",
        code: "EMAIL_SEND_FAILED",
      });
    }

    return res.json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (err) {
    return handleError(err as PrismaError, res, "Failed to process verification request");
  }
};
