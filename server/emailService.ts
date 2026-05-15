import type { Express, Request, Response } from "express";
import nodemailer from "nodemailer";
import { z } from "zod";
import { emailConfig } from "./emailConfig";

type SendEmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

const TEST_EMAIL_INPUT = z.object({
  to: z.string().trim().email().max(320),
});

function createTransporter() {
  return nodemailer.createTransport({
    host: emailConfig.smtpHost,
    port: emailConfig.smtpPort,
    secure: emailConfig.smtpPort === 465,
    auth: {
      user: emailConfig.smtpUser,
      pass: emailConfig.smtpPass,
    },
    tls: {
      servername: emailConfig.smtpHost,
    },
  });
}

export async function sendTestEmail(to: string): Promise<SendEmailResult> {
  try {
    if (!emailConfig.smtpHost || !emailConfig.smtpPort || !emailConfig.smtpUser || !emailConfig.smtpPass) {
      return {
        success: false,
        error: "SMTP configuration is incomplete",
      };
    }

    const info = await createTransporter().sendMail({
      from: emailConfig.emailFrom,
      to,
      subject: "Test Email GTC",
      text: "General Tech Consult\n\nVotre système email GTC fonctionne correctement.",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h1 style="margin: 0 0 16px; color: #0f172a;">General Tech Consult</h1>
          <p>Votre système email GTC fonctionne correctement.</p>
        </div>
      `,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email sending failed",
    };
  }
}

export function registerEmailRoutes(app: Express) {
  app.post("/api/email/test", async (req: Request, res: Response) => {
    try {
      const input = TEST_EMAIL_INPUT.parse(req.body);
      const result = await sendTestEmail(input.to);
      if (result.success) {
        console.log(`[email.test] Email sent to ${input.to}. messageId=${result.messageId ?? "unknown"}`);
      } else {
        console.error(`[email.test] SMTP error for ${input.to}: ${result.error ?? "unknown error"}`);
      }
      return res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Invalid email input",
          issues: error.issues,
        });
      }

      console.error("[email.test]", error);
      return res.status(500).json({ success: false, error: "Email test failed" });
    }
  });
}
