import { NextRequest, NextResponse } from "next/server";
import { getPdfHistoryCollection } from "@/lib/mongodb";

function emptyStats() {
  return {
    totalCompressed: 0,
    totalStorageSaved: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    avgCompressionPercentage: 0,
    recentActivity: [],
  };
}

export async function GET(req: NextRequest) {
  try {
    const collection = await getPdfHistoryCollection();

    const [totalCount, allRecords] = await Promise.all([
      collection.countDocuments(),
      collection
        .find({}, { projection: { originalSize: 1, compressedSize: 1, storageSaved: 1 } })
        .toArray(),
    ]);

    const totalOriginalSize = allRecords.reduce((sum, r) => sum + r.originalSize, 0);
    const totalCompressedSize = allRecords.reduce((sum, r) => sum + r.compressedSize, 0);
    const totalStorageSaved = allRecords.reduce((sum, r) => sum + r.storageSaved, 0);
    const avgCompression =
      totalCount > 0
        ? Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)
        : 0;

    const recentActivity = await collection
      .find({}, {
        projection: {
          fileName: 1,
          compressionPercentage: 1,
          uploadDate: 1,
          originalSize: 1,
          compressedSize: 1,
        },
      })
      .sort({ uploadDate: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      totalCompressed: totalCount,
      totalStorageSaved,
      totalOriginalSize,
      totalCompressedSize,
      avgCompressionPercentage: avgCompression,
      recentActivity: recentActivity.map((item) => ({
        id: item._id.toString(),
        fileName: item.fileName,
        compressionPercentage: item.compressionPercentage,
        uploadDate: item.uploadDate?.toISOString?.() ?? new Date(item.uploadDate).toISOString(),
        originalSize: item.originalSize,
        compressedSize: item.compressedSize,
      })),
    });
  } catch (error) {
    console.warn("[GET /api/stats] Falling back to empty stats", error);
    return NextResponse.json(emptyStats());
  }
}
