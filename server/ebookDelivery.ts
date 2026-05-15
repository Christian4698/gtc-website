import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000;

export function hashDownloadToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createEbookDelivery(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      customerEmail: true,
      status: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "paid") {
    throw new Error("Order must be paid before ebook delivery");
  }

  const token = randomBytes(TOKEN_BYTES).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  const delivery = await prisma.ebookDelivery.create({
    data: {
      orderId: order.id,
      email: order.customerEmail,
      downloadTokenHash: hashDownloadToken(token),
      expiresAt,
      status: "pending",
    },
    select: {
      id: true,
      email: true,
      expiresAt: true,
    },
  });

  return {
    deliveryId: delivery.id,
    downloadUrl: `/api/download/${token}?email=${encodeURIComponent(delivery.email)}`,
    expiresAt: delivery.expiresAt,
  };
}
