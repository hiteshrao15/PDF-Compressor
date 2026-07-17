import { NextRequest, NextResponse } from "next/server";
import { getPdfHistoryCollection, ObjectId } from "@/lib/mongodb";
import { deleteSchema } from "@/lib/validations";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = deleteSchema.safeParse({ id });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const collection = await getPdfHistoryCollection();
    const objectId = new ObjectId(id);
    const record = await collection.findOne({ _id: objectId }, { projection: { _id: 1 } });
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await collection.deleteOne({ _id: objectId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.warn("[DELETE /api/history/:id] Falling back to unavailable response", error);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}
