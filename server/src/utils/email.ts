import nodemailer from "nodemailer";
import {
  EMAIL_CONNECTION_TIMEOUT_MS,
  EMAIL_DEBUG,
  EMAIL_FROM,
  EMAIL_GREETING_TIMEOUT_MS,
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_SOCKET_TIMEOUT_MS,
  EMAIL_USERNAME,
} from "../config/secrets.ts";

const emailUser = EMAIL_USERNAME;
const emailPass = EMAIL_PASSWORD;
const emailFrom = EMAIL_FROM;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  requireTLS: !EMAIL_SECURE, // enforce TLS upgrade on port 587
  connectionTimeout: EMAIL_CONNECTION_TIMEOUT_MS,
  greetingTimeout: EMAIL_GREETING_TIMEOUT_MS,
  socketTimeout: EMAIL_SOCKET_TIMEOUT_MS,
  logger: EMAIL_DEBUG,
  debug: EMAIL_DEBUG,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

let transportVerified = false;

const ensureEmailConfig = () => {
  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USERNAME and EMAIL_PASSWORD must be configured");
  }

  if (!EMAIL_HOST) {
    throw new Error("EMAIL_HOST must be configured");
  }

  if (!Number.isFinite(EMAIL_PORT) || EMAIL_PORT <= 0) {
    throw new Error("EMAIL_PORT must be a valid positive number");
  }
};

const annotateTransportError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return error;
  }

  const transportError = error as Error & { code?: string; command?: string };

  if (transportError.code === "ETIMEDOUT" && transportError.command === "CONN") {
    transportError.message = [
      `Connection timeout while reaching SMTP server ${EMAIL_HOST}:${EMAIL_PORT}.`,
      "This usually means the SMTP host/port is unreachable from the deployed server.",
      "On Render, confirm the provider allows SMTP access from your service and that the chosen port is open.",
      "If you are using Gmail, prefer an App Password and verify EMAIL_PORT/EMAIL_SECURE are paired correctly: 465/true or 587/false.",
    ].join(" ");
  }

  return transportError;
};

export const verifyEmailTransport = async () => {
  ensureEmailConfig();

  if (transportVerified) {
    return;
  }

  await transporter.verify();
  transportVerified = true;
  console.log(
    `Email SMTP transport verified (${EMAIL_HOST}:${EMAIL_PORT}, secure=${String(
      EMAIL_SECURE
    )})`
  );
};

export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  try {
    await verifyEmailTransport();

    const mailOptions = {
      from: emailFrom,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    const annotatedError = annotateTransportError(error);
    console.error("Error sending email:", annotatedError);
    throw annotatedError;
  }
};
