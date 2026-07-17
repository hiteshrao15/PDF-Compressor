import { PDFDocument } from "pdf-lib";
import { CompressionLevel } from "./validations";

export interface CompressionResult {
  compressedBuffer: Uint8Array;
  originalSize: number;
  compressedSize: number;
  compressionPercentage: number;
  storageSaved: number;
  processingTime: number;
}

const COMPRESSION_OPTIONS: Record<"low" | "balanced" | "high", { objectsToRemove: boolean; useObjectStreams: boolean }> = {
  low: { objectsToRemove: false, useObjectStreams: false },
  balanced: { objectsToRemove: true, useObjectStreams: false },
  high: { objectsToRemove: true, useObjectStreams: true },
};

function resolveAutoLevel(fileSizeBytes: number, pageCount: number): "low" | "balanced" | "high" {
  if (fileSizeBytes <= 1.5 * 1024 * 1024 && pageCount <= 10) {
    return "low";
  }

  if (fileSizeBytes <= 8 * 1024 * 1024 && pageCount <= 40) {
    return "balanced";
  }

  return "high";
}

export async function compressPdf(
  fileBuffer: ArrayBuffer,
  level: CompressionLevel = "auto"
): Promise<CompressionResult> {
  const start = Date.now();
  const originalSize = fileBuffer.byteLength;

  const pdfDoc = await PDFDocument.load(fileBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  const effectiveLevel: "low" | "balanced" | "high" =
    level === "auto" ? resolveAutoLevel(originalSize, pdfDoc.getPageCount()) : level;

  const options = COMPRESSION_OPTIONS[effectiveLevel];

  // Remove metadata to reduce file size
  if (options.objectsToRemove) {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("PDF Compressor");
    pdfDoc.setCreator("PDF Compressor");
  }

  const compressedBuffer = await pdfDoc.save({
    useObjectStreams: options.useObjectStreams,
    addDefaultPage: false,
    objectsPerTick: 50,
  });

  const compressedSize = compressedBuffer.byteLength;
  const storageSaved = Math.max(0, originalSize - compressedSize);
  const compressionPercentage =
    originalSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100 * 10) / 10)
      : 0;
  const processingTime = Date.now() - start;

  return {
    compressedBuffer,
    originalSize,
    compressedSize,
    compressionPercentage,
    storageSaved,
    processingTime,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
