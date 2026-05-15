import type { Express, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "./prisma";

const CREATE_ORDER_INPUT = z.object({
  customerName: z.string().trim().min(2).max(256),
  customerEmail: z.string().trim().email().max(320),
  productType: z.string().trim().min(1).max(128),
  productId: z.string().trim().min(1).max(128),
  amount: z.coerce.number().positive(),
  currency: z.string().trim().min(3).max(8).default("USD"),
});

export function registerOrderRoutes(app: Express) {
  app.post("/api/orders/create", async (req: Request, res: Response) => {
    try {
      const input = CREATE_ORDER_INPUT.parse(req.body);

      const order = await prisma.order.create({
        data: {
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          productType: input.productType,
          productId: input.productId,
          amount: input.amount,
          currency: input.currency.toUpperCase(),
          status: "pending",
        },
        select: {
          id: true,
          status: true,
        },
      });

      return res.status(201).json({
        orderId: order.id,
        status: order.status,
        message: "Commande créée avec succès",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid order input",
          issues: error.issues,
        });
      }

      console.error("[orders.create]", error);
      return res.status(500).json({ error: "Order creation failed" });
    }
  });
}
