import type { Express, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "./prisma";

const MOCK_PAYMENT_INPUT = z.object({
  orderId: z.string().min(1).max(128),
  providerRef: z.string().trim().min(1).max(256),
  amount: z.coerce.number().positive(),
});

export function registerMockPaymentRoutes(app: Express) {
  app.post("/api/payments/mock-success", async (req: Request, res: Response) => {
    try {
      const input = MOCK_PAYMENT_INPUT.parse(req.body);
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
        select: {
          id: true,
          amount: true,
          currency: true,
        },
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.amount.toString() !== input.amount.toString()) {
        return res.status(400).json({ error: "Payment amount does not match order amount" });
      }

      const result = await prisma.$transaction(async tx => {
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            provider: "mock",
            providerRef: input.providerRef,
            amount: input.amount,
            currency: order.currency,
            status: "paid",
            rawPayload: input,
          },
          select: {
            id: true,
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { status: "paid" },
        });

        return payment;
      });

      return res.status(201).json({
        orderId: order.id,
        paymentId: result.id,
        status: "paid",
        message: "Paiement simulé avec succès",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid payment input",
          issues: error.issues,
        });
      }

      console.error("[payments.mock-success]", error);
      return res.status(500).json({ error: "Mock payment failed" });
    }
  });
}
