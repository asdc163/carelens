"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireElderAccess, canWrite } from "@/lib/elders";

const CreateElderSchema = z.object({
  name: z.string().trim().min(1).max(80),
  birthdate: z.string().transform((v) => new Date(v)),
  conditions: z.array(z.string()).optional().default([]),
  allergies: z.array(z.string()).optional().default([]),
});

export async function createElder(formData: FormData) {
  const user = await requireUser();
  const rawConditions = String(formData.get("conditions") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const rawAllergies = String(formData.get("allergies") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = CreateElderSchema.safeParse({
    name: formData.get("name"),
    birthdate: formData.get("birthdate"),
    conditions: rawConditions,
    allergies: rawAllergies,
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Please check the form fields." };
  }

  const elder = await prisma.elder.create({
    data: {
      ownerId: user.id,
      name: parsed.data.name,
      birthdate: parsed.data.birthdate,
      conditions: JSON.stringify(parsed.data.conditions),
      allergies: JSON.stringify(parsed.data.allergies),
    },
  });

  await prisma.activityLog.create({
    data: {
      elderId: elder.id,
      actorId: user.id,
      action: "ELDER_CREATED",
      payload: JSON.stringify({ name: elder.name }),
    },
  });

  revalidatePath("/app", "layout");
  redirect(`/app/elders/${elder.id}`);
}

export async function updateElder(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("elderId") ?? "");
  const access = await requireElderAccess(id);
  if (!(await canWrite(access.role))) {
    return { ok: false as const, error: "Insufficient permissions." };
  }

  const conditions = String(formData.get("conditions") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allergies = String(formData.get("allergies") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.elder.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? access.elder.name),
      conditions: JSON.stringify(conditions),
      allergies: JSON.stringify(allergies),
      notes: String(formData.get("notes") ?? ""),
    },
  });

  await prisma.activityLog.create({
    data: {
      elderId: id,
      actorId: user.id,
      action: "ELDER_UPDATED",
      payload: JSON.stringify({}),
    },
  });

  revalidatePath(`/app/elders/${id}`, "layout");
  return { ok: true as const };
}
