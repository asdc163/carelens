import { UserPlus } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireElderAccess } from "@/lib/elders";
import { getMessages } from "@/lib/locale";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { InviteForm } from "./invite-form";

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ elderId: string }>;
}) {
  const { elderId } = await params;
  const { elder, role } = await requireElderAccess(elderId);
  const { locale, m } = await getMessages();

  const [owner, members, pending] = await Promise.all([
    prisma.user.findUnique({
      where: { id: elder.ownerId },
      select: { id: true, displayName: true, email: true },
    }),
    prisma.familyMember.findMany({
      where: { elderId },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
      },
      orderBy: { joinedAt: "asc" },
    }),
    prisma.familyInvite.findMany({
      where: { elderId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">{elder.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-0.5">
          {m.family.title}
        </h1>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-4">
          {locale === "zh-TW" ? "目前成員" : "Current members"}
        </h2>
        <ul className="divide-y divide-border -mx-5">
          {owner && (
            <MemberRow
              key="owner"
              name={owner.displayName}
              email={owner.email}
              role="OWNER"
              joinedLabel=""
              roleLabel={m.family.role_OWNER}
            />
          )}
          {members.map((m2) => (
            <MemberRow
              key={m2.id}
              name={m2.user.displayName}
              email={m2.user.email}
              role={m2.role as "CAREGIVER" | "VIEWER"}
              joinedLabel={`${m.family.joinedOn} ${formatDate(m2.joinedAt, locale)}`}
              roleLabel={
                m2.role === "CAREGIVER" ? m.family.role_CAREGIVER : m.family.role_VIEWER
              }
            />
          ))}
        </ul>
      </section>

      {role === "OWNER" && (
        <>
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-1 flex items-center gap-2">
              <UserPlus className="size-4 text-primary" />
              {m.family.inviteCta}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {locale === "zh-TW"
                ? "輸入家人的 Email，寄送邀請連結。對方登入後即可加入。"
                : "Enter your family member's email. They'll get a link to join after signing in."}
            </p>
            <InviteForm
              elderId={elder.id}
              labels={{
                placeholder: m.family.invitePlaceholder,
                roleLabel: m.family.inviteRoleLabel,
                submit: m.family.inviteSubmit,
                sent: m.family.inviteSent,
                caregiver: m.family.role_CAREGIVER,
                viewer: m.family.role_VIEWER,
              }}
            />
          </section>

          {pending.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold mb-4">{m.family.pendingInvites}</h2>
              <ul className="space-y-3">
                {pending.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {locale === "zh-TW" ? "寄出於" : "Sent"}{" "}
                        {formatRelativeTime(p.createdAt, locale)} ·{" "}
                        <Badge variant="outline" className="text-xs font-medium">
                          {p.role === "CAREGIVER"
                            ? m.family.role_CAREGIVER
                            : m.family.role_VIEWER}
                        </Badge>
                      </p>
                    </div>
                    <code className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      /invite/{p.token.slice(0, 10)}…
                    </code>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function MemberRow({
  name,
  email,
  role,
  joinedLabel,
  roleLabel,
}: {
  name: string;
  email: string;
  role: "OWNER" | "CAREGIVER" | "VIEWER";
  joinedLabel: string;
  roleLabel: string;
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <Avatar>
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
      <div className="text-right">
        <Badge
          variant={role === "OWNER" ? "default" : "outline"}
          className="text-xs font-semibold"
        >
          {roleLabel}
        </Badge>
        {joinedLabel && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {joinedLabel}
          </p>
        )}
      </div>
    </li>
  );
}
