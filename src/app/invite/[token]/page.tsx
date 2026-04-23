import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getMessages } from "@/lib/locale";
import { Wordmark } from "@/components/brand";
import { AcceptButton } from "./accept-button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { locale, m } = await getMessages();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const invite = await prisma.familyInvite.findUnique({
    where: { token },
    include: {
      elder: { select: { id: true, name: true } },
      invitedBy: { select: { displayName: true } },
    },
  });

  const now = new Date();
  const invalid =
    !invite || invite.acceptedAt || invite.expiresAt < now;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <Wordmark className="mb-6" />
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 text-center">
        {invalid ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              {locale === "zh-TW" ? "邀請已失效" : "Invite no longer valid"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {locale === "zh-TW"
                ? "此邀請連結已過期或已被使用。請聯絡邀請者重新寄送。"
                : "This invite has expired or already been used."}
            </p>
            <Link
              href="/app"
              className="inline-block mt-6 text-sm text-primary hover:underline"
            >
              {locale === "zh-TW" ? "回到應用" : "Back to app"} →
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              {locale === "zh-TW" ? "加入照護團隊" : "Join the care team"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              {locale === "zh-TW" ? (
                <>
                  <span className="font-medium text-foreground">
                    {invite!.invitedBy.displayName}
                  </span>{" "}
                  邀請您一起照顧{" "}
                  <span className="font-medium text-foreground">
                    {invite!.elder.name}
                  </span>
                  。
                </>
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {invite!.invitedBy.displayName}
                  </span>{" "}
                  invited you to help care for{" "}
                  <span className="font-medium text-foreground">
                    {invite!.elder.name}
                  </span>
                  .
                </>
              )}
            </p>
            <div className="mt-6">
              <AcceptButton
                token={token}
                label={locale === "zh-TW" ? "加入" : "Accept invite"}
              />
            </div>
          </>
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          {m.landing.disclaimer}
        </p>
      </div>
    </div>
  );
}
