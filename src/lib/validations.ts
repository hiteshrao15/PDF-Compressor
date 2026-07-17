import { z } from "zod";

export const compressionLevelSchema = z.enum(["low", "auto", "high"]);

export const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().max(50 * 1024 * 1024), // 50MB max
  compressionLevel: compressionLevelSchema.default("auto"),
});

export const deleteSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["uploadDate", "fileName", "compressionPercentage", "originalSize"]).default("uploadDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CompressionLevel = z.infer<typeof compressionLevelSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
export type HistoryQuery = z.infer<typeof historyQuerySchema>;
