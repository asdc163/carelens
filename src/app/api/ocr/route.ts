import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requireElderAccess } from "@/lib/elders";
import { ocrPillBottle } from "@/lib/claude";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const elderId = String(form.get("elderId") ?? "");
    if (!elderId) {
      return NextResponse.json({ error: "elderId required" }, { status: 400 });
    }

    const access = await requireElderAccess(elderId);
    if (access.role === "VIEWER") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const file = form.get("photo");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "photo required" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }
    if (!/^image\/(png|jpeg|jpg|webp)$/.test(file.type)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString("base64");

    const result = await ocrPillBottle(base64, file.type);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    console.error("OCR error", e);
    return NextResponse.json(
      { error: "OCR failed. Please retry or enter manually." },
      { status: 500 }
    );
  }
}
