import { NextRequest, NextResponse } from "next/server";
import { getPdfHistoryCollection } from "@/lib/mongodb";
import { historyQuerySchema } from "@/lib/validations";

// Rate limiting (simple in-memory for demo; use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = historyQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, { status: 400 });
  }

  const { page, limit, search, sortBy, sortOrder } = parsed.data;
  const skip = (page - 1) * limit;

  try {
    const collection = await getPdfHistoryCollection();
    const where = search
      ? { fileName: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
      : {};

    const [items, total] = await Promise.all([
      collection
        .find(where)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(where),
    ]);

    return NextResponse.json({
      items: items.map((item) => ({
        id: item._id.toString(),
        fileName: item.fileName,
        originalSize: item.originalSize,
        compressedSize: item.compressedSize,
        compressionPercentage: item.compressionPercentage,
        storageSaved: item.storageSaved,
        uploadDate: item.uploadDate?.toISOString?.() ?? new Date(item.uploadDate).toISOString(),
        downloadUrl: item.downloadUrl,
        compressionLevel: item.compressionLevel,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.warn("[GET /api/history] Falling back to empty history", error);
    return NextResponse.json({
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    });
  }
}
