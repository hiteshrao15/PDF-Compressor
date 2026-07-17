import { NextRequest, NextResponse } from "next/server";
import { compressPdf } from "@/lib/compress";
import { getPdfHistoryCollection } from "@/lib/mongodb";
import { compressionLevelSchema } from "@/lib/validations";

export const runtime = "nodejs";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const levelRaw = formData.get("compressionLevel");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be under 50MB" }, { status: 400 });
    }

    const levelParsed = compressionLevelSchema.safeParse(levelRaw);
    const compressionLevel = levelParsed.success ? levelParsed.data : "auto";

    const arrayBuffer = await file.arrayBuffer();
    const result = await compressPdf(arrayBuffer, compressionLevel);

    // Convert compressed buffer to base64 for client download
    const base64 = Buffer.from(result.compressedBuffer).toString("base64");
    const downloadUrl = `data:application/pdf;base64,${base64}`;

    let recordId = "";
    try {
      const collection = await getPdfHistoryCollection();
      const insertResult = await collection.insertOne({
        fileName: file.name,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionPercentage: result.compressionPercentage,
        storageSaved: result.storageSaved,
        downloadUrl,
        compressionLevel,
        processingTime: result.processingTime,
        uploadDate: new Date(),
      });
      recordId = insertResult.insertedId.toHexString();
    } catch (dbError) {
      console.warn("[POST /api/compress] Failed to save history record", dbError);
    }

    return NextResponse.json({
      id: recordId,
      fileName: file.name,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionPercentage: result.compressionPercentage,
      storageSaved: result.storageSaved,
      processingTime: result.processingTime,
      downloadUrl,
      compressionLevel,
    });
  } catch (error) {
    console.error("[POST /api/compress]", error);
    return NextResponse.json({ error: "Compression failed. Please try again." }, { status: 500 });
  }
}
