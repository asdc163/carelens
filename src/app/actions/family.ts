"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireElderAccess } from "@/lib/elders";

const INVITE_EXPIRES_DAYS = 14;

export async function inviteFamilyMember(elderId: string, formData: FormData) {
  const user = await requireUser();
  const access = await requireElderAccess(elderId);
  if (access.role !== "OWNER") {
    return { ok: false as const, error: "Only the owner can invite family." };
  }

  const email = z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .safeParse(formData.get("email"));
  const role = z
    .enum(["CAREGIVER", "VIEWER"])
    .safeParse(formData.get("role"));

  if (!email.success || !role.success) {
    return { ok: false as const, error: "Invalid email or role." };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRES_DAYS);

  const token = randomBytes(24).toString("hex");

  await prisma.familyInvite.create({
    data: {
      elderId,
      email: email.data,
      role: role.data,
      token,
      invitedById: user.id,
      expiresAt,
    },
  });

  await prisma.activityLog.create({
    data: {
      elderId,
      actorId: user.id,
      action: "MEMBER_INVITED",
      payload: JSON.stringify({ email: email.data, role: role.data }),
    },
  });

  revalidatePath(`/app/elders/${elderId}/family`);
  return {
    ok: true as const,
    inviteUrl: `/invite/${token}`,
  };
}

export async function cancelInvite(inviteId: string) {
  const user = await requireUser();
  const invite = await prisma.familyInvite.findUnique({
    where: { id: inviteId },
  });
  if (!invite) return { ok: false as const, error: "Invite not found." };
  const access = await requireElderAccess(invite.elderId);
  if (access.role !== "OWNER") {
    return { ok: false as const, error: "Only the owner can cancel invites." };
  }

  await prisma.familyInvite.delete({ where: { id: inviteId } });
  revalidatePath(`/app/elders/${invite.elderId}/family`);
  return { ok: true as const };
}

export async function acceptInvite(token: string) {
  const user = await requireUser();
  const invite = await prisma.familyInvite.findUnique({ where: { token } });
  if (!invite) return { ok: false as const, error: "Invite not found or already used." };
  if (invite.acceptedAt) return { ok: false as const, error: "Invite already used." };
  if (invite.expiresAt < new Date())
    return { ok: false as const, error: "Invite expired." };

  // Prevent duplicate membership
  const existing = await prisma.familyMember.findUnique({
    where: { elderId_userId: { elderId: invite.elderId, userId: user.id } },
  });
  if (!existing) {
    await prisma.familyMember.create({
      data: {
        elderId: invite.elderId,
        userId: user.id,
        role: invite.role,
      },
    });
  }

  await prisma.familyInvite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });

  await prisma.activityLog.create({
    data: {
      elderId: invite.elderId,
      actorId: user.id,
      action: "MEMBER_JOINED",
      payload: JSON.stringify({ role: invite.role }),
    },
  });

  revalidatePath(`/app/elders/${invite.elderId}`, "layout");
  return { ok: true as const, elderId: invite.elderId };
}
