import { Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireElderAccess } from "@/lib/elders";
import { getMessages } from "@/lib/locale";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ elderId: string }>;
}) {
  const { elderId } = await params;
  const { elder } = await requireElderAccess(elderId);
  const { locale, m } = await getMessages();

  const activities = await prisma.activityLog.findMany({
    where: { elderId },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { actor: { select: { displayName: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">{elder.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-0.5">
          {m.timeline.title}
        </h1>
      </header>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Clock className="size-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{m.timeline.empty}</p>
        </div>
      ) : (
        <ol className="relative border-l border-border pl-6 ml-3 space-y-5">
          {activities.map((a) => {
            const label =
              m.timeline[
                `action_${a.action}` as keyof typeof m.timeline
              ] ?? a.action;
            let payload: Record<string, unknown> = {};
            try {
              payload = JSON.parse(a.payload);
            } catch {
              /* ignore */
            }
            return (
              <li key={a.id} className="relative">
                <span className="absolute -left-[30px] top-1 size-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                        {a.actor.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm">
                      <span className="font-medium">{a.actor.displayName}</span>{" "}
                      <span className="text-muted-foreground">{label as string}</span>
                    </p>
                    <p className="ml-auto text-xs text-muted-foreground">
                      {formatRelativeTime(a.createdAt, locale)}
                    </p>
                  </div>
                  {payloadLabel(payload) && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {payloadLabel(payload)}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function payloadLabel(payload: Record<string, unknown>): string | null {
  if (typeof payload.name === "string" && typeof payload.dose === "string") {
    return `${payload.name} · ${payload.dose}`;
  }
  if (payload.type === "BP" && typeof payload.sys === "number") {
    return `${payload.sys}/${payload.dia} mmHg`;
  }
  if (typeof payload.type === "string" && typeof payload.value === "number") {
    return `${payload.type}: ${payload.value} ${payload.unit ?? ""}`;
  }
  if (typeof payload.severity === "string") {
    return `Severity: ${payload.severity}`;
  }
  return null;
}
