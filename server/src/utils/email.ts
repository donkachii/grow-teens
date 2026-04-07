import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USERNAME;
const emailPass = process.env.EMAIL_PASSWORD;
const emailFrom = process.env.EMAIL_FROM ?? emailUser;

const transporter = nodemailer.createTransport({
  service: "Gmail",
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
};

export const verifyEmailTransport = async () => {
  ensureEmailConfig();

  if (transportVerified) {
    return;
  }

  await transporter.verify();
  transportVerified = true;
  console.log("Email SMTP transport verified");
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
