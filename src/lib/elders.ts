import "server-only";
import { prisma } from "./db";
import { getCurrentUser } from "./auth";

export type ElderRole = "OWNER" | "CAREGIVER" | "VIEWER";

/**
 * List elders the current user has access to (owned + joined via membership).
 * Deduped, sorted by createdAt desc. Returns [] if unauthenticated.
 */
export async function listMyElders() {
  const user = await getCurrentUser();
  if (!user) return [];

  const owned = await prisma.elder.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const memberships = await prisma.familyMember.findMany({
    where: { userId: user.id },
    include: { elder: true },
  });

  const seen = new Set(owned.map((e) => e.id));
  const shared = memberships
    .filter((mem) => !seen.has(mem.elderId))
    .map((mem) => mem.elder);

  return [...owned, ...shared];
}

export async function hasAccessToElder(elderId: string, userId?: string) {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) return null;

  const elder = await prisma.elder.findUnique({
    where: { id: elderId },
  });
  if (!elder) return null;

  if (elder.ownerId === user.id) return { elder, role: "OWNER" as ElderRole };

  const membership = await prisma.familyMember.findUnique({
    where: { elderId_userId: { elderId, userId: user.id } },
  });
  if (!membership) return null;

  return { elder, role: membership.role as ElderRole };
}

export async function requireElderAccess(elderId: string) {
  const result = await hasAccessToElder(elderId);
  if (!result) throw new Error("FORBIDDEN");
  return result;
}

export async function canWrite(role: ElderRole) {
  return role === "OWNER" || role === "CAREGIVER";
}

export function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
