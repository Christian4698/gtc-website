import { Express, Request, Response } from "express";
import multer from "multer";
import { createFile } from "./db";
import { storagePut } from "./storage";
import { getAdminUserFromRequest } from "./adminAuth";
import { sdk } from "./_core/sdk";

// Configuration multer : stockage en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
  },
});

async function getAdminUser(req: Request) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (user.role === "admin") return user;
  } catch {
    // Fall through to the dedicated local admin session.
  }

  return await getAdminUserFromRequest(req);
}

/**
 * Enregistre l'endpoint POST /api/upload
 * Accepte multipart/form-data avec champs:
 *   - file: Buffer du fichier
 *   - title: Titre du fichier
 *   - category: ebook|guide|training|template|other
 *   - description: (optionnel)
 */
export function registerUploadRoute(app: Express) {
  app.post("/api/certification-image", upload.single("file"), async (req: Request, res: Response) => {
    try {
      const user = await getAdminUser(req);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized: admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ error: "Only image files are accepted" });
      }

      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
      const fileKey = `certified/${Date.now()}-${safeName}`;
      const { url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);

      return res.json({ success: true, url });
    } catch (error) {
      console.error("[certification-image] Error:", error);
      return res.status(500).json({ error: "Upload failed" });
    }
  });

  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      // Vérifier l'authentification (admin uniquement)
      const user = await getAdminUser(req);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized: admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const { title, category, description } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const validCategories = ["ebook", "guide", "training", "template", "other"];
      const fileCategory = category || "other";
      if (!validCategories.includes(fileCategory)) {
        return res.status(400).json({ error: "Invalid category" });
      }

      // Uploader vers S3
      const fileKey = `files/${Date.now()}-${req.file.originalname}`;
      const { key, url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);

      // Créer l'enregistrement en BDD
      const dbFile = await createFile({
        fileKey: key,
        url,
        filename: req.file.originalname,
        title,
        description: description || null,
        category: fileCategory as any,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        isPublic: true,
        priceCents: 0,
        uploadedBy: user.id,
      });

      return res.json({
        success: true,
        file: {
          id: dbFile?.id,
          title: dbFile?.title,
          url: dbFile?.url,
          filename: dbFile?.filename,
        },
      });
    } catch (error) {
      console.error("[upload] Error:", error);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}
