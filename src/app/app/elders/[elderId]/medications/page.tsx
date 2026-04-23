import Link from "next/link";
import { Plus, Pill, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireElderAccess } from "@/lib/elders";
import { getMessages } from "@/lib/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

const severityStyle: Record<string, string> = {
  NONE: "",
  MILD: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  MODERATE: "border-warning/40 bg-warning/10 text-warning",
  SEVERE: "border-destructive/40 bg-destructive/10 text-destructive",
  CRITICAL: "bg-destructive text-destructive-foreground",
};

export default async function MedsPage({
  params,
}: {
  params: Promise<{ elderId: string }>;
}) {
  const { elderId } = await params;
  const { elder } = await requireElderAccess(elderId);
  const { locale, m } = await getMessages();

  const [medications, latestInteraction] = await Promise.all([
    prisma.medication.findMany({
      where: { elderId, endedOn: null },
      orderBy: { createdAt: "desc" },
      include: { addedBy: { select: { displayName: true } } },
    }),
    prisma.interaction.findFirst({
      where: { elderId },
      orderBy: { checkedAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{elder.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-0.5">
            {m.meds.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {m.meds.activeCount}: <span className="font-semibold text-foreground">{medications.length}</span>
          </p>
        </div>
        <Link href={`/app/elders/${elder.id}/medications/new`}>
          <Button className="rounded-full gap-1.5">
            <Plus className="size-4" /> {m.meds.addNew}
          </Button>
        </Link>
      </header>

      {latestInteraction && latestInteraction.severity !== "NONE" && (
        <div
          className={cn(
            "rounded-2xl border p-4 sm:p-5",
            severityStyle[latestInteraction.severity]
          )}
        >
          <div className="flex items-start gap-3">
            <TriangleAlert className="size-5 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{m.meds.interactionWarning}</p>
                <Badge variant="outline" className="text-xs font-semibold">
                  {m.severity[latestInteraction.severity as keyof typeof m.severity]}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed">
                {locale === "zh-TW"
                  ? latestInteraction.summaryZh ?? latestInteraction.summary
                  : latestInteraction.summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {medications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="size-14 mx-auto rounded-2xl bg-accent/60 flex items-center justify-center mb-3">
            <Pill className="size-6 text-primary" />
          </div>
          <p className="font-semibold text-lg">{m.meds.emptyTitle}</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs mx-auto">
            {m.meds.emptySub}
          </p>
          <Link href={`/app/elders/${elder.id}/medications/new`}>
            <Button className="rounded-full gap-1.5">
              {m.meds.emptyPhotoCta}
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {medications.map((med) => (
            <li
              key={med.id}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex items-start gap-4"
            >
              <div className="size-11 rounded-xl bg-accent/60 flex items-center justify-center shrink-0">
                <Pill className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg">
                  {med.nameZh || med.name}
                </p>
                {med.nameZh && med.name && (
                  <p className="text-sm text-muted-foreground">{med.name}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm">
                  <span className="font-medium">{med.dose}</span>
                  <span className="text-muted-foreground">· {med.frequency}</span>
                  {med.purpose && (
                    <span className="text-muted-foreground">· {med.purpose}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {m.meds.since} {formatDate(med.startedOn, locale)} ·{" "}
                  {m.meds.addedBy} {med.addedBy.displayName}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
