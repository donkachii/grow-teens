import nodemailer from "nodemailer";
import {
  EMAIL_FROM,
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USERNAME,
} from "../config/secrets.ts";

const emailUser = EMAIL_USERNAME;
const emailPass = EMAIL_PASSWORD;
const emailFrom = EMAIL_FROM;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    servername: EMAIL_HOST,
  },
});

let transportVerified = false;

const ensureEmailConfig = () => {
  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USERNAME and EMAIL_PASSWORD must be configured");
  }
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
    console.error("Error sending email:", error);
    throw error;
  }
};
