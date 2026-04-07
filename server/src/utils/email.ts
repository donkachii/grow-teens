import fetch from "node-fetch";
import { BREVO_API_KEY, EMAIL_FROM } from "../config/secrets.ts";

export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: EMAIL_FROM },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${response.status}`);
  }

  console.log("Email sent successfully");
};
