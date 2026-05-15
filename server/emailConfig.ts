export const emailConfig = {
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "contact@generaltechconsult.com",
};

export const { smtpHost, smtpPort, smtpUser, smtpPass, emailFrom } = emailConfig;
