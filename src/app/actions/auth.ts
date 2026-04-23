"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
  getCurrentUser,
} from "@/lib/auth";

const EmailSchema = z.string().trim().toLowerCase().email();
const PasswordSchema = z.string().min(8).max(200);
const NameSchema = z.string().trim().min(1).max(80);

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const emailRaw = formData.get("email");
  const passwordRaw = formData.get("password");
  const nameRaw = formData.get("displayName");

  const parsed = z
    .object({
      email: EmailSchema,
      password: PasswordSchema,
      displayName: NameSchema,
    })
    .safeParse({
      email: emailRaw,
      password: passwordRaw,
      displayName: nameRaw,
    });

  if (!parsed.success) {
    return { ok: false, error: "Please check your email, password (≥8 chars), and name." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  await createSession(user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const email = EmailSchema.safeParse(formData.get("email"));
  const password = PasswordSchema.safeParse(formData.get("password"));

  if (!email.success || !password.success) {
    return { ok: false, error: "Invalid email or password." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.data },
  });
  if (!user?.passwordHash) {
    return { ok: false, error: "Invalid email or password." };
  }
  const ok = await verifyPassword(password.data, user.passwordHash);
  if (!ok) {
    return { ok: false, error: "Invalid email or password." };
  }

  await createSession(user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOut() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInAsDemo(): Promise<AuthActionResult> {
  // Demo account — pre-seeded with realistic eldercare data for judges to explore
  const demoEmail = "demo@carelens.app";
  let user = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        displayName: "Tommy",
        passwordHash: await hashPassword("demo-only-not-used"),
        locale: "zh-TW",
      },
    });
  }

  await createSession(user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function me() {
  return getCurrentUser();
}
