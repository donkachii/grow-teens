import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

const VERIFICATION_TOKEN_TTL_MS = 10 * 60 * 1000;
const VERIFICATION_RESEND_COOLDOWN_MS = 2 * 60 * 1000;

// Helper function for standardized error handling
const handleError = (err, res, defaultMessage = "Service unavailable") => {
  console.error("Authentication Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    code: err.code,
  });

  // Handle specific types of errors
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Resource not found" });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ error: "Duplicate entry" });
  }

  // Default error response
  return res.status(503).json({ error: defaultMessage });
};

const sendVerificationEmail = async (email, token) => {
  // Create verification URL with token
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

  sendEmail(email, "Verify Your GrowTeens Account", "", html);
};

// Improve registerUser with better error handling
export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, role, age } = req.body;

  try {
    // Input validation
    const requiredFields = { firstName, lastName, email, password, role };
    const missingFields = Object.entries(requiredFields)
      .filter(
        ([_, value]) =>
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

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        code: "INVALID_EMAIL",
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long",
        code: "WEAK_PASSWORD",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists",
        code: "EMAIL_EXISTS",
      });
    }

    // Generate verification token and set expiration
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(
      Date.now() + VERIFICATION_TOKEN_TTL_MS
    );

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      // Create user
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role,
          age,
          emailVerified: false,
          verificationToken,
          verificationExpires,
        },
      });

      // Send verification email
      await sendVerificationEmail(user.email, verificationToken);

      return res.status(201).json({
        message:
          "Registration successful. Please check your email to verify your account.",
        userId: user.id,
      });
    } catch (dbError) {
      // Handle database-specific errors
      if (dbError.code === "P2002") {
        return res.status(409).json({
          error: "An account with this email already exists",
          code: "EMAIL_EXISTS",
        });
      }
      throw dbError; // Re-throw for the outer catch block
    }
  } catch (err) {
    return handleError(err, res, "Unable to complete registration");
  }
};

// Improve loginUser with better error handling
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
        code: "MISSING_CREDENTIALS",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if the email exists or not - security best practice
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // For unverified users, we can offer to resend verification
      return res.status(403).json({
        error: "Email not verified",
        message: "Please verify your email before logging in",
        code: "EMAIL_NOT_VERIFIED",
        needsVerification: true,
        email: user.email, // Safe to include since we're confirming they know this email
      });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Update last active timestamp
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    // Successful login
    const { password: _, ...userWithoutPassword } = updatedUser;
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set secure cookie
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
    return handleError(err, res, "Login failed");
  }
};

// Update verifyEmail to return JSON responses instead of redirects
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    if (!token) {
      return res.status(400).json({
        error: "Invalid verification token",
        code: "INVALID_TOKEN",
        status: "invalid"
      });
    }

    // Find user with this token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      // Check if token exists but expired
      const expiredUser = await prisma.user.findFirst({
        where: { verificationToken: token },
      });

      console.log("Expired user:", expiredUser);

      if (expiredUser) {
        return res.status(410).json({
          error: "Verification link has expired",
          code: "TOKEN_EXPIRED",
          status: "expired",
          email: expiredUser.email
        });
      }

      // Token doesn't exist at all
      return res.status(404).json({
        error: "Invalid verification token",
        code: "INVALID_TOKEN",
        status: "invalid"
      });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    // Return success JSON response
    return res.status(200).json({
      message: "Email verification successful",
      status: "success",
      email: user.email,
      userId: user.id
    });
  } catch (err) {
    // Log error details but don't expose them to the user
    console.error("Email verification error:", {
      error: err.message,
      token: token?.substring(0, 6) + "...",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });

    return res.status(500).json({
      error: "Failed to verify email",
      code: "VERIFICATION_ERROR",
      status: "error"
    });
  }
};

// Improved resendVerification with better error handling
export const resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if a user exists or not for security
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

    // Check if we've sent too many emails recently
    const lastSent = user.verificationExpires;
    const tokenLifetime = VERIFICATION_TOKEN_TTL_MS;
    const cooldownPeriod = VERIFICATION_RESEND_COOLDOWN_MS;
    const lastSentAt = lastSent
      ? new Date(new Date(lastSent).getTime() - tokenLifetime)
      : null;

    if (lastSentAt && new Date() - lastSentAt < cooldownPeriod) {
      const waitSeconds = Math.ceil(
        (cooldownPeriod - (new Date() - lastSentAt)) / 1000
      );
      return res.status(429).json({
        error: `Please wait ${waitSeconds} seconds before requesting another email`,
        code: "RATE_LIMITED",
        retryAfter: waitSeconds,
      });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(
      Date.now() + VERIFICATION_TOKEN_TTL_MS
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
      },
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
    return handleError(err, res, "Failed to process verification request");
  }
};
