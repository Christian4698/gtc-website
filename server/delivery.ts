import path from "node:path";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { createEbookDelivery, hashDownloadToken } from "./ebookDelivery";
import { prisma } from "./prisma";

const CREATE_DELIVERY_INPUT = z.object({
  orderId: z.string().min(1).max(128),
});

const EBOOK_FILE_PATH = path.resolve(process.cwd(), "server/ebooks/test-ebook.pdf");

export function registerDeliveryRoutes(app: Express) {
  app.post("/api/delivery/create", async (req: Request, res: Response) => {
    try {
      const input = CREATE_DELIVERY_INPUT.parse(req.body);
      const delivery = await createEbookDelivery(input.orderId);

      return res.status(201).json(delivery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid delivery input",
          issues: error.issues,
        });
      }

      if (error instanceof Error && error.message === "Order not found") {
        return res.status(404).json({ error: error.message });
      }

      if (error instanceof Error && error.message === "Order must be paid before ebook delivery") {
        return res.status(400).json({ error: error.message });
      }

      console.error("[delivery.create]", error);
      return res.status(500).json({ error: "Delivery creation failed" });
    }
  });

  app.get("/api/download/:token", async (req: Request, res: Response) => {
    try {
      const token = req.params.token;
      const email = req.query.email?.toString();

      if (!token || !email) {
        return res.status(403).json({ error: "Invalid download link" });
      }

      const delivery = await prisma.ebookDelivery.findUnique({
        where: { downloadTokenHash: hashDownloadToken(token) },
        select: {
          id: true,
          email: true,
          expiresAt: true,
        },
      });

      if (!delivery || delivery.email.toLowerCase() !== email.toLowerCase() || delivery.expiresAt <= new Date()) {
        return res.status(403).json({ error: "Invalid or expired download link" });
      }

      return res.download(EBOOK_FILE_PATH, "test-ebook.pdf");
    } catch (error) {
      console.error("[download.ebook]", error);
      return res.status(500).json({ error: "Download failed" });
    }
  });
}
