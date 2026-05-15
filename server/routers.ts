import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  clearAdminSessionCookie,
  createAdminSessionToken,
  isValidAdminCredentials,
  setAdminSessionCookie,
} from "./adminAuth";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createCertificate,
  createLead,
  deleteCertificate,
  deleteFile,
  getFileById,
  incrementDownloadCount,
  listCertificates,
  listFiles,
  listLeads,
  updateCertificate,
  updateLeadStatus,
  verifyCertificateByCertId,
} from "./db";
import { storageGetSignedUrl } from "./storage";

const FILE_CATEGORY = z.enum(["ebook", "guide", "training", "template", "other"]);
const LEAD_STATUS = z.enum(["new", "contacted", "converted", "archived"]);
const FORM_TYPE = z.enum(["software", "training", "data", "contact", "lead_magnet", "other"]);
const CERTIFICATE_STATUS = z.enum(["Valid", "Revoked", "Expired", "Valide", "Reussi"]);
const CERTIFICATE_LEVEL = z.enum([
  "Beginner / Debutant",
  "Intermediate / Intermediaire",
  "Advanced / Avance",
  "Expert",
  "Mastery / Maitrise",
]);
const CERTIFICATE_INPUT = z.object({
  fullName: z.string().min(2).max(256),
  email: z.string().email().max(320).optional().nullable(),
  phone: z.string().max(64).optional().nullable(),
  trainingName: z.string().min(2).max(256),
  level: CERTIFICATE_LEVEL,
  documentType: z.literal("Certificate of Completion").default("Certificate of Completion"),
  status: CERTIFICATE_STATUS.default("Valide"),
  score: z.number().int().min(0).max(100).optional().nullable(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  participantImageUrl: z.string().max(1024).optional().nullable(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    adminLogin: publicProcedure
      .input(
        z.object({
          username: z.string().min(1).max(64),
          password: z.string().min(1).max(128),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        if (!isValidAdminCredentials(input.username, input.password)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Identifiants admin invalides" });
        }

        const token = await createAdminSessionToken();
        setAdminSessionCookie(ctx.req, ctx.res, token);
        return { success: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      clearAdminSessionCookie(ctx.req, ctx.res);
      return { success: true } as const;
    }),
  }),

  // ===================================================================
  // FILES — e-books, guides, ressources téléchargeables
  // ===================================================================
  files: router({
    /** Liste des fichiers publics (page Products) */
    list: publicProcedure
      .input(z.object({ category: FILE_CATEGORY.optional() }).optional())
      .query(async ({ input }) => {
        const rows = await listFiles({ onlyPublic: true, category: input?.category });
        // Ne pas exposer fileKey au public
        return rows.map(({ fileKey, ...rest }) => rest);
      }),

    /** Liste complète pour admin */
    adminList: adminProcedure.query(async () => {
      return await listFiles();
    }),

    /** Générer une URL signée et incrémenter le compteur */
    download: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const file = await getFileById(input.id);
        if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "Fichier introuvable" });
        if (!file.isPublic) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Ce fichier n'est pas téléchargeable" });
        }
        await incrementDownloadCount(input.id);
        const signedUrl = await storageGetSignedUrl(file.fileKey);
        return { url: signedUrl, filename: file.filename };
      }),

    /** Supprimer un fichier (admin) */
    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteFile(input.id);
        return { success: true } as const;
      }),
  }),

  // ===================================================================
  // LEADS — soumissions de formulaires
  // ===================================================================
  leads: router({
    /** Soumettre un nouveau lead depuis un formulaire public */
    submit: publicProcedure
      .input(
        z.object({
          formType: FORM_TYPE,
          name: z.string().min(1).max(256),
          email: z.string().email().max(320).optional().nullable(),
          phone: z.string().max(64).optional().nullable(),
          payload: z.record(z.string(), z.any()).optional(),
          source: z.string().max(256).optional().nullable(),
        }),
      )
      .mutation(async ({ input }) => {
        const id = await createLead({
          formType: input.formType,
          name: input.name,
          email: input.email ?? null,
          phone: input.phone ?? null,
          payload: input.payload ? JSON.stringify(input.payload) : null,
          source: input.source ?? null,
        });

        // Notification au propriétaire (non bloquante)
        try {
          const summary = [
            `Type: ${input.formType}`,
            `Nom: ${input.name}`,
            input.email ? `Email: ${input.email}` : null,
            input.phone ? `Tél: ${input.phone}` : null,
            input.source ? `Source: ${input.source}` : null,
          ]
            .filter(Boolean)
            .join("\n");

          await notifyOwner({
            title: `[GTC] Nouveau lead — ${input.formType}`,
            content:
              summary +
              (input.payload ? `\n\nDétails:\n${JSON.stringify(input.payload, null, 2)}` : ""),
          });
        } catch (err) {
          console.warn("[leads.submit] notifyOwner failed:", err);
        }

        return { success: true, id } as const;
      }),

    /** Liste des leads (admin) */
    list: adminProcedure
      .input(
        z
          .object({
            status: LEAD_STATUS.optional(),
            limit: z.number().int().min(1).max(500).optional(),
          })
          .optional(),
      )
      .query(async ({ input }) => {
        return await listLeads({ status: input?.status, limit: input?.limit });
      }),

    /** Mettre à jour le statut d'un lead (admin) */
    updateStatus: adminProcedure
      .input(z.object({ id: z.number().int().positive(), status: LEAD_STATUS }))
      .mutation(async ({ input }) => {
        await updateLeadStatus(input.id, input.status);
        return { success: true } as const;
    }),
  }),

  // ===================================================================
  // CERTIFICATIONS — vérification publique et gestion admin
  // ===================================================================
  certifications: router({
    verify: publicProcedure
      .input(z.object({ id: z.string().min(1).max(32) }))
      .query(async ({ ctx, input }) => {
        const forwardedFor = ctx.req.headers["x-forwarded-for"];
        const ipAddress = Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor?.split(",")[0]?.trim() || ctx.req.socket.remoteAddress || null;
        return await verifyCertificateByCertId(input.id, { ipAddress });
      }),

    listIds: publicProcedure.query(async () => {
      const rows = await listCertificates();
      return rows.map(cert => cert.id);
    }),

    adminList: adminProcedure.query(async () => {
      return await listCertificates();
    }),

    create: adminProcedure
      .input(CERTIFICATE_INPUT)
      .mutation(async ({ input }) => {
        return await createCertificate(input);
      }),

    update: adminProcedure
      .input(z.object({ id: z.string().min(1).max(32), data: CERTIFICATE_INPUT }))
      .mutation(async ({ input }) => {
        return await updateCertificate(input.id, input.data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string().min(1).max(32) }))
      .mutation(async ({ input }) => {
        await deleteCertificate(input.id);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
