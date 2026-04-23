"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireElderAccess, canWrite } from "@/lib/elders";
import { checkInteractions } from "@/lib/claude";

const MedSchema = z.object({
  name: z.string().trim().min(1).max(120),
  nameZh: z.string().trim().max(120).optional().nullable(),
  dose: z.string().trim().min(1).max(60),
  frequency: z.string().trim().min(1).max(120),
  purpose: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export async function addMedication(elderId: string, formData: FormData) {
  const user = await requireUser();
  const access = await requireElderAccess(elderId);
  if (!(await canWrite(access.role))) {
    return { ok: false as const, error: "Insufficient permissions." };
  }

  const parsed = MedSchema.safeParse({
    name: formData.get("name"),
    nameZh: formData.get("nameZh") || null,
    dose: formData.get("dose"),
    frequency: formData.get("frequency"),
    purpose: formData.get("purpose") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Please fill in drug name, dose, and frequency." };
  }

  const med = await prisma.medication.create({
    data: {
      elderId,
      name: parsed.data.name,
      nameZh: parsed.data.nameZh || null,
      dose: parsed.data.dose,
      frequency: parsed.data.frequency,
      purpose: parsed.data.purpose || null,
      notes: parsed.data.notes || null,
      photoUrl: (formData.get("photoUrl") as string) || null,
      addedById: user.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      elderId,
      actorId: user.id,
      action: "MED_ADDED",
      payload: JSON.stringify({ name: med.name, dose: med.dose }),
    },
  });

  // Run interaction check across all active meds for this elder
  const activeMeds = await prisma.medication.findMany({
    where: { elderId, endedOn: null },
  });
  if (activeMeds.length >= 2) {
    try {
      const report = await checkInteractions(
        activeMeds.map((x) => ({
          id: x.id,
          name: x.name,
          nameZh: x.nameZh,
          dose: x.dose,
        }))
      );
      await prisma.interaction.create({
        data: {
          elderId,
          medIds: JSON.stringify(activeMeds.map((x) => x.id)),
          severity: report.overallSeverity,
          summary: report.pairs[0]?.summary ?? report.generalNotes,
          summaryZh: report.pairs[0]?.summaryZh ?? report.generalNotesZh,
          details: JSON.stringify(report),
        },
      });
      await prisma.activityLog.create({
        data: {
          elderId,
          actorId: user.id,
          action: "INTERACTION_CHECKED",
          payload: JSON.stringify({ severity: report.overallSeverity }),
        },
      });
    } catch (e) {
      console.error("Interaction check failed", e);
    }
  }

  revalidatePath(`/app/elders/${elderId}`, "layout");
  redirect(`/app/elders/${elderId}/medications`);
}

export async function stopMedication(elderId: string, medId: string) {
  const user = await requireUser();
  const access = await requireElderAccess(elderId);
  if (!(await canWrite(access.role))) {
    return { ok: false as const, error: "Insufficient permissions." };
  }

  await prisma.medication.update({
    where: { id: medId },
    data: { endedOn: new Date() },
  });

  await prisma.activityLog.create({
    data: {
      elderId,
      actorId: user.id,
      action: "MED_STOPPED",
      payload: JSON.stringify({ medId }),
    },
  });

  revalidatePath(`/app/elders/${elderId}`, "layout");
  return { ok: true as const };
}
