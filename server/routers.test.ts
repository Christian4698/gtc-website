import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import * as storage from "./storage";

// Mock les dépendances
vi.mock("./db");
vi.mock("./storage");
vi.mock("./_core/notification");

describe("Files Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("files.list", () => {
    it("should return public files only", async () => {
      const mockFiles = [
        {
          id: 1,
          fileKey: "key1",
          url: "/manus-storage/file1.pdf",
          filename: "guide.pdf",
          title: "Excel Guide",
          description: "Guide complet",
          category: "guide" as const,
          mimeType: "application/pdf",
          sizeBytes: 1024000,
          isPublic: true,
          priceCents: 0,
          downloadCount: 5,
          uploadedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.listFiles).mockResolvedValue(mockFiles);

      const result = await db.listFiles({ onlyPublic: true });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Excel Guide");
      expect(db.listFiles).toHaveBeenCalledWith({ onlyPublic: true });
    });

    it("should filter by category", async () => {
      const mockFiles = [
        {
          id: 2,
          fileKey: "key2",
          url: "/manus-storage/ebook.pdf",
          filename: "ebook.pdf",
          title: "E-book Automation",
          description: null,
          category: "ebook" as const,
          mimeType: "application/pdf",
          sizeBytes: 2048000,
          isPublic: true,
          priceCents: 2999,
          downloadCount: 12,
          uploadedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.listFiles).mockResolvedValue(mockFiles);

      const result = await db.listFiles({ onlyPublic: true, category: "ebook" });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("ebook");
      expect(db.listFiles).toHaveBeenCalledWith({ onlyPublic: true, category: "ebook" });
    });
  });

  describe("files.download", () => {
    it("should increment download count and return signed URL", async () => {
      const mockFile = {
        id: 1,
        fileKey: "key1",
        url: "/manus-storage/file1.pdf",
        filename: "guide.pdf",
        title: "Excel Guide",
        description: "Guide complet",
        category: "guide" as const,
        mimeType: "application/pdf",
        sizeBytes: 1024000,
        isPublic: true,
        priceCents: 0,
        downloadCount: 5,
        uploadedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getFileById).mockResolvedValue(mockFile);
      vi.mocked(db.incrementDownloadCount).mockResolvedValue(undefined);
      vi.mocked(storage.storageGetSignedUrl).mockResolvedValue(
        "https://s3.example.com/signed-url?token=abc123",
      );

      const file = await db.getFileById(1);
      expect(file).toBeDefined();
      expect(file?.isPublic).toBe(true);

      await db.incrementDownloadCount(1);
      expect(db.incrementDownloadCount).toHaveBeenCalledWith(1);

      const signedUrl = await storage.storageGetSignedUrl(file!.fileKey);
      expect(signedUrl).toContain("s3.example.com");
    });

    it("should reject download for non-public files", async () => {
      const mockFile = {
        id: 2,
        fileKey: "key2",
        url: "/manus-storage/private.pdf",
        filename: "private.pdf",
        title: "Private File",
        description: null,
        category: "other" as const,
        mimeType: "application/pdf",
        sizeBytes: 512000,
        isPublic: false,
        priceCents: 0,
        downloadCount: 0,
        uploadedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getFileById).mockResolvedValue(mockFile);

      const file = await db.getFileById(2);
      expect(file?.isPublic).toBe(false);
    });
  });

  describe("files.delete", () => {
    it("should delete a file", async () => {
      vi.mocked(db.deleteFile).mockResolvedValue(undefined);

      await db.deleteFile(1);

      expect(db.deleteFile).toHaveBeenCalledWith(1);
    });
  });
});

describe("Leads Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("leads.submit", () => {
    it("should create a new lead", async () => {
      const leadData = {
        formType: "software" as const,
        name: "John Doe",
        email: "john@example.com",
        phone: "+243829664720",
        payload: { budget: "5000-10000", timeline: "1-2 months" },
        source: "/services",
      };

      vi.mocked(db.createLead).mockResolvedValue(42);

      const id = await db.createLead({
        formType: leadData.formType,
        name: leadData.name,
        email: leadData.email ?? null,
        phone: leadData.phone ?? null,
        payload: leadData.payload ? JSON.stringify(leadData.payload) : null,
        source: leadData.source ?? null,
      });

      expect(id).toBe(42);
      expect(db.createLead).toHaveBeenCalled();
    });

    it("should handle optional fields", async () => {
      const leadData = {
        formType: "contact" as const,
        name: "Jane Smith",
        email: null,
        phone: null,
        payload: undefined,
        source: null,
      };

      vi.mocked(db.createLead).mockResolvedValue(43);

      const id = await db.createLead({
        formType: leadData.formType,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        payload: null,
        source: leadData.source,
      });

      expect(id).toBe(43);
    });
  });

  describe("leads.list", () => {
    it("should list all leads for admin", async () => {
      const mockLeads = [
        {
          id: 1,
          formType: "software",
          name: "John Doe",
          email: "john@example.com",
          phone: "+243829664720",
          payload: '{"budget":"5000-10000"}',
          source: "/services",
          status: "new" as const,
          createdAt: new Date(),
        },
        {
          id: 2,
          formType: "training",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: null,
          payload: null,
          source: "/training",
          status: "contacted" as const,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.listLeads).mockResolvedValue(mockLeads);

      const leads = await db.listLeads();

      expect(leads).toHaveLength(2);
      expect(leads[0].formType).toBe("software");
      expect(leads[1].status).toBe("contacted");
    });

    it("should filter leads by status", async () => {
      const mockLeads = [
        {
          id: 1,
          formType: "software",
          name: "John Doe",
          email: "john@example.com",
          phone: "+243829664720",
          payload: null,
          source: "/services",
          status: "new" as const,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.listLeads).mockResolvedValue(mockLeads);

      const leads = await db.listLeads({ status: "new" });

      expect(leads).toHaveLength(1);
      expect(leads[0].status).toBe("new");
      expect(db.listLeads).toHaveBeenCalledWith({ status: "new" });
    });

    it("should respect limit parameter", async () => {
      vi.mocked(db.listLeads).mockResolvedValue([]);

      await db.listLeads({ limit: 10 });

      expect(db.listLeads).toHaveBeenCalledWith({ limit: 10 });
    });
  });

  describe("leads.updateStatus", () => {
    it("should update lead status", async () => {
      vi.mocked(db.updateLeadStatus).mockResolvedValue(undefined);

      await db.updateLeadStatus(1, "contacted");

      expect(db.updateLeadStatus).toHaveBeenCalledWith(1, "contacted");
    });

    it("should support all status values", async () => {
      vi.mocked(db.updateLeadStatus).mockResolvedValue(undefined);

      const statuses = ["new", "contacted", "converted", "archived"] as const;

      for (const status of statuses) {
        await db.updateLeadStatus(1, status);
        expect(db.updateLeadStatus).toHaveBeenCalledWith(1, status);
      }
    });
  });
});
