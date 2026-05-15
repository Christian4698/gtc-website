import type { Express, Request, Response } from "express";
import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { ENV } from "./_core/env";
import { createPaymentRecord, updatePaymentStatus } from "./db";

const PAYMENT_INPUT = z.object({
  fullName: z.string().min(2).max(256),
  email: z.string().email().max(320),
  phone: z.string().min(5).max(64),
  productType: z.enum(["E-book (PDF personnalisé, non partageable)", "Format papier"]),
  deliveryMode: z.enum(["Email", "WhatsApp"]),
  address: z.string().max(512).optional().nullable(),
});

type PaymentProvider = "flutterwave" | "cinetpay";

function getPaymentProvider(): PaymentProvider {
  const provider = ENV.paymentProvider.toLowerCase();
  if (provider === "flutterwave" || provider === "cinetpay") return provider;
  throw new Error("PAYMENT_PROVIDER must be flutterwave or cinetpay");
}

function getProductPrice(productType: z.infer<typeof PAYMENT_INPUT>["productType"]) {
  if (productType === "Format papier") {
    return { amount: 31.5, currency: "USD", deliveryAmountCdf: 6000 };
  }
  return { amount: 17.5, currency: "USD", deliveryAmountCdf: 0 };
}

function getBaseUrl(req: Request) {
  const proto = req.headers["x-forwarded-proto"]?.toString().split(",")[0] || req.protocol || "https";
  return `${proto}://${req.headers.host}`;
}

function getCallbackUrl(req: Request, transactionId: string) {
  const base = ENV.paymentCallbackUrl || `${getBaseUrl(req)}/products`;
  const url = new URL(base);
  url.searchParams.set("payment", "callback");
  url.searchParams.set("tx_ref", transactionId);
  return url.toString();
}

async function createFlutterwavePayment(req: Request, input: z.infer<typeof PAYMENT_INPUT>, txRef: string) {
  if (!ENV.flutterwaveSecretKey || !ENV.flutterwavePublicKey) {
    throw new Error("Flutterwave keys are not configured");
  }

  const price = getProductPrice(input.productType);
  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.flutterwaveSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount: price.amount,
      currency: price.currency,
      redirect_url: getCallbackUrl(req, txRef),
      payment_options: "mobilemoney,card",
      customer: {
        email: input.email,
        phonenumber: input.phone,
        name: input.fullName,
      },
      customizations: {
        title: "General Tech Consult",
        description: `Commande GTC - ${input.productType}`,
      },
      meta: {
        product: input.productType,
        deliveryMode: input.deliveryMode,
        deliveryAmountCdf: price.deliveryAmountCdf,
        address: input.address ?? "",
      },
    }),
  });

  const data = await response.json();
  if (!response.ok || data.status !== "success" || !data.data?.link) {
    throw new Error(data.message || "Unable to initialize Flutterwave payment");
  }
  return { paymentUrl: data.data.link as string, providerReference: data.data.id?.toString() ?? null, price };
}

async function createCinetPayPayment(req: Request, input: z.infer<typeof PAYMENT_INPUT>, txRef: string) {
  if (!ENV.cinetpayApiKey || !ENV.cinetpaySiteId) {
    throw new Error("CinetPay keys are not configured");
  }

  const price = getProductPrice(input.productType);
  const response = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: ENV.cinetpayApiKey,
      site_id: ENV.cinetpaySiteId,
      transaction_id: txRef,
      amount: price.amount,
      currency: price.currency,
      description: `Commande GTC - ${input.productType}`,
      return_url: getCallbackUrl(req, txRef),
      notify_url: `${getBaseUrl(req)}/api/payment/webhook`,
      customer_name: input.fullName,
      customer_surname: input.fullName,
      customer_email: input.email,
      customer_phone_number: input.phone,
      channels: "MOBILE_MONEY",
      metadata: JSON.stringify({
        product: input.productType,
        deliveryMode: input.deliveryMode,
        deliveryAmountCdf: price.deliveryAmountCdf,
        address: input.address ?? "",
      }),
    }),
  });

  const data = await response.json();
  if (!response.ok || data.code !== "201" || !data.data?.payment_url) {
    throw new Error(data.message || "Unable to initialize CinetPay payment");
  }
  return { paymentUrl: data.data.payment_url as string, providerReference: null, price };
}

function verifyWebhookSignature(req: Request) {
  if (!ENV.paymentWebhookSecret) return true;
  const signature =
    req.headers["verif-hash"]?.toString() ||
    req.headers["x-gtc-payment-signature"]?.toString();
  if (!signature) return false;
  if (signature === ENV.paymentWebhookSecret) return true;

  const expected = createHmac("sha256", ENV.paymentWebhookSecret).update(JSON.stringify(req.body)).digest("hex");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

async function verifyFlutterwaveTransaction(transactionId: string) {
  if (!ENV.flutterwaveSecretKey) throw new Error("Flutterwave secret key is not configured");
  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
    headers: { Authorization: `Bearer ${ENV.flutterwaveSecretKey}` },
  });
  const data = await response.json();
  const status = data.status === "success" && data.data?.status === "successful" ? "successful" : "failed";
  return { status: status as "successful" | "failed", providerReference: data.data?.id?.toString() ?? transactionId, data };
}

async function verifyCinetPayTransaction(transactionId: string) {
  if (!ENV.cinetpayApiKey || !ENV.cinetpaySiteId) throw new Error("CinetPay keys are not configured");
  const response = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: ENV.cinetpayApiKey,
      site_id: ENV.cinetpaySiteId,
      transaction_id: transactionId,
    }),
  });
  const data = await response.json();
  const isAccepted = data.code === "00" || data.data?.status === "ACCEPTED";
  return { status: isAccepted ? "successful" as const : "failed" as const, providerReference: transactionId, data };
}

export function registerPaymentRoutes(app: Express) {
  app.post("/api/payment/create", async (req: Request, res: Response) => {
    try {
      const input = PAYMENT_INPUT.parse(req.body);
      const provider = getPaymentProvider();
      const txRef = `GTC-${Date.now()}-${randomUUID().slice(0, 8)}`;
      const result =
        provider === "flutterwave"
          ? await createFlutterwavePayment(req, input, txRef)
          : await createCinetPayPayment(req, input, txRef);

      await createPaymentRecord({
        transactionId: txRef,
        provider,
        status: "pending",
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        product: input.productType,
        deliveryMode: input.deliveryMode,
        amount: String(result.price.amount),
        currency: result.price.currency,
        deliveryAmountCdf: result.price.deliveryAmountCdf,
        providerReference: result.providerReference,
        paymentUrl: result.paymentUrl,
      });

      return res.json({
        paymentUrl: result.paymentUrl,
        transactionId: txRef,
        amount: result.price.amount,
        currency: result.price.currency,
        deliveryAmountCdf: result.price.deliveryAmountCdf,
      });
    } catch (error) {
      console.error("[payment.create]", error);
      return res.status(400).json({ error: error instanceof Error ? error.message : "Payment initialization failed" });
    }
  });

  app.post("/api/payment/webhook", async (req: Request, res: Response) => {
    try {
      if (!verifyWebhookSignature(req)) {
        return res.status(401).json({ error: "Invalid payment webhook signature" });
      }

      const provider = getPaymentProvider();
      const transactionId =
        req.body?.tx_ref ||
        req.body?.transaction_id ||
        req.body?.cpm_trans_id ||
        req.body?.data?.tx_ref ||
        req.body?.data?.transaction_id;

      if (!transactionId) return res.status(400).json({ error: "Missing transaction id" });

      const verification =
        provider === "flutterwave"
          ? await verifyFlutterwaveTransaction(req.body?.id?.toString() || req.body?.data?.id?.toString() || transactionId)
          : await verifyCinetPayTransaction(transactionId);

      await updatePaymentStatus(transactionId, verification.status, {
        providerReference: verification.providerReference,
        rawPayload: JSON.stringify({ webhook: req.body, verification: verification.data }),
      });

      if (verification.status === "successful") {
        console.log(`[payment.webhook] Paiement réussi ${transactionId}. Merci pour votre achat GTC.`);
      }

      return res.json({ received: true, status: verification.status });
    } catch (error) {
      console.error("[payment.webhook]", error);
      return res.status(500).json({ error: "Payment webhook failed" });
    }
  });
}
