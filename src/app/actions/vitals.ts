"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireElderAccess, canWrite } from "@/lib/elders";

const VitalTypeEnum = z.enum([
  "BP_SYSTOLIC",
  "BP_DIASTOLIC",
  "HR",
  "GLUCOSE",
  "WEIGHT",
  "SPO2",
  "TEMP",
]);

export async function logVital(elderId: string, formData: FormData) {
  const user = await requireUser();
  const access = await requireElderAccess(elderId);
  if (!(await canWrite(access.role))) {
    return { ok: false as const, error: "Insufficient permissions." };
  }

  const type = VitalTypeEnum.safeParse(formData.get("type"));
  const value = z
    .preprocess((v) => (v === "" ? undefined : Number(v)), z.number().finite())
    .safeParse(formData.get("value"));
  const unit = z.string().trim().min(1).max(16).safeParse(formData.get("unit"));

  if (!type.success || !value.success || !unit.success) {
    return { ok: false as const, error: "Invalid input." };
  }

  await prisma.vital.create({
    data: {
      elderId,
      type: type.data,
      value: value.data,
      unit: unit.data,
      loggedById: user.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      elderId,
      actorId: user.id,
      action: "VITAL_LOGGED",
      payload: JSON.stringify({ type: type.data, value: value.data, unit: unit.data }),
    },
  });

  revalidatePath(`/app/elders/${elderId}`, "layout");
  return { ok: true as const };
}

export async function logBP(elderId: string, formData: FormData) {
  const user = await requireUser();
  const access = await requireElderAccess(elderId);
  if (!(await canWrite(access.role))) {
    return { ok: false as const, error: "Insufficient permissions." };
  }

  const sys = Number(formData.get("systolic"));
  const dia = Number(formData.get("diastolic"));
  if (!Number.isFinite(sys) || !Number.isFinite(dia)) {
    return { ok: false as const, error: "Invalid BP values." };
  }

  const measuredAt = new Date();
  await prisma.vital.createMany({
    data: [
      {
        elderId,
        type: "BP_SYSTOLIC",
        value: sys,
        unit: "mmHg",
        loggedById: user.id,
        measuredAt,
      },
      {
        elderId,
        type: "BP_DIASTOLIC",
        value: dia,
        unit: "mmHg",
        loggedById: user.id,
        measuredAt,
      },
    ],
  });

  await prisma.activityLog.create({
    data: {
      elderId,
      actorId: user.id,
      action: "VITAL_LOGGED",
      payload: JSON.stringify({ type: "BP", sys, dia }),
    },
  });

  revalidatePath(`/app/elders/${elderId}`, "layout");
  return { ok: true as const };
}
