import Link from "next/link";
import {
  Activity,
  HeartPulse,
  Pill,
  Plus,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireElderAccess } from "@/lib/elders";
import { getMessages } from "@/lib/locale";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateInsight } from "@/lib/claude";

const severityStyle: Record<string, string> = {
  NONE: "bg-muted text-muted-foreground border-border",
  MILD: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  MODERATE: "bg-warning/15 text-warning border-warning/30",
  SEVERE: "bg-destructive/15 text-destructive border-destructive/30",
  CRITICAL: "bg-destructive text-destructive-foreground border-destructive",
};

export default async function ElderDashboard({
  params,
}: {
  params: Promise<{ elderId: string }>;
}) {
  const { elderId } = await params;
  const { elder } = await requireElderAccess(elderId);
  const { locale, m } = await getMessages();

  // Fetch aggregate data
  const [medications, vitalsRaw, latestInteraction, activities, memberCount] =
    await Promise.all([
      prisma.medication.findMany({
        where: { elderId, endedOn: null },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.vital.findMany({
        where: { elderId },
        orderBy: { measuredAt: "desc" },
        take: 60,
      }),
      prisma.interaction.findFirst({
        where: { elderId, severity: { in: ["MODERATE", "SEVERE", "CRITICAL"] } },
        orderBy: { checkedAt: "desc" },
      }),
      prisma.activityLog.findMany({
        where: { elderId },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { actor: { select: { displayName: true } } },
      }),
      prisma.familyMember.count({ where: { elderId } }),
    ]);

  // Latest values per vital type
  const latestVitalsMap = new Map<
    string,
    { value: number; unit: string; measuredAt: Date }
  >();
  for (const v of vitalsRaw) {
    if (!latestVitalsMap.has(v.type)) {
      latestVitalsMap.set(v.type, {
        value: v.value,
        unit: v.unit,
        measuredAt: v.measuredAt,
      });
    }
  }

  // Generate insight (if we have data; non-blocking preview fallback if not)
  let insight: Awaited<ReturnType<typeof generateInsight>> | null = null;
  if (vitalsRaw.length > 0 || medications.length > 0) {
    try {
      insight = await generateInsight({
        elderName: elder.name,
        recentVitals: vitalsRaw.slice(0, 30).map((v) => ({
          type: v.type,
          value: v.value,
          unit: v.unit,
          measuredAt: v.measuredAt.toISOString(),
        })),
        medications: medications.map((x) => ({ name: x.name, dose: x.dose })),
      });
    } catch (e) {
      console.error("insight failed", e);
    }
  }

  const vitalTypes = [
    { key: "BP_SYSTOLIC", label: m.vitals.bp, unit: "mmHg", secondaryKey: "BP_DIASTOLIC" },
    { key: "HR", label: m.vitals.hr, unit: "bpm" },
    { key: "GLUCOSE", label: m.vitals.glucose, unit: "mg/dL" },
    { key: "WEIGHT", label: m.vitals.weight, unit: "kg" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{m.nav.dashboard}</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-0.5">
            {elder.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/app/elders/${elder.id}/vitals`}>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5">
              <HeartPulse className="size-4" /> {m.dashboard.addVital}
            </Button>
          </Link>
          <Link href={`/app/elders/${elder.id}/medications/new`}>
            <Button size="sm" className="rounded-full gap-1.5">
              <Plus className="size-4" /> {m.dashboard.addMed}
            </Button>
          </Link>
        </div>
      </header>

      {/* Interaction alert */}
      {latestInteraction && (
        <div
          className={cn(
            "rounded-2xl border p-4 sm:p-5",
            severityStyle[latestInteraction.severity]
          )}
        >
          <div className="flex items-start gap-3">
            <TriangleAlert className="size-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
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

      {/* AI Insight card */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-primary">
            {m.dashboard.todayInsight}
          </h2>
        </div>
        {insight ? (
          <>
            <p className="text-base sm:text-lg leading-relaxed text-pretty">
              {locale === "zh-TW" ? insight.summaryZh : insight.summary}
            </p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {insight.highlights.slice(0, 4).map((h, i) => {
                const color =
                  h.kind === "alert"
                    ? "chart-4"
                    : h.kind === "trend"
                    ? "chart-1"
                    : h.kind === "reminder"
                    ? "chart-3"
                    : "chart-2";
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-border p-3.5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ background: `var(--${color})` }}
                      />
                      <p className="text-sm font-medium">
                        {locale === "zh-TW" ? h.titleZh : h.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {locale === "zh-TW" ? h.detailZh : h.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {locale === "zh-TW"
              ? "開始記錄幾天的藥物或生命徵象，AI 會幫你整理本週摘要。"
              : "Log medications or vitals for a few days — insights appear here."}
          </p>
        )}
      </section>

      {/* Vitals snapshot */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          {m.vitals.title}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {vitalTypes.map((vt) => {
            const v = latestVitalsMap.get(vt.key);
            const vd = vt.secondaryKey ? latestVitalsMap.get(vt.secondaryKey) : null;
            return (
              <Link
                key={vt.key}
                href={`/app/elders/${elder.id}/vitals`}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-xs text-muted-foreground">{vt.label}</p>
                {v ? (
                  <>
                    <p className="text-xl sm:text-2xl font-semibold mt-1">
                      {v.value}
                      {vd ? <span className="text-muted-foreground">/{vd.value}</span> : null}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {v.unit}
                      <span className="mx-1">·</span>
                      {formatRelativeTime(v.measuredAt, locale)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {m.vitals.noData}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Medications + Recent activity */}
      <div className="grid lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {m.meds.title}
            </h2>
            <Link
              href={`/app/elders/${elder.id}/medications`}
              className="text-sm text-primary hover:underline"
            >
              {m.meds.activeCount} →
            </Link>
          </div>
          {medications.length === 0 ? (
            <EmptyState
              icon={Pill}
              title={m.meds.emptyTitle}
              body={m.meds.emptySub}
              href={`/app/elders/${elder.id}/medications/new`}
              cta={m.meds.emptyPhotoCta}
            />
          ) : (
            <ul className="divide-y divide-border">
              {medications.map((med) => (
                <li key={med.id} className="py-3 flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-accent/60 flex items-center justify-center">
                    <Pill className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {med.nameZh || med.name}{" "}
                      <span className="text-muted-foreground text-sm">· {med.dose}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {med.frequency}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {m.dashboard.recentActivity}
            </h2>
            <Link
              href={`/app/elders/${elder.id}/timeline`}
              className="text-sm text-primary hover:underline"
            >
              →
            </Link>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {m.dashboard.noActivityYet}
            </p>
          ) : (
            <ul className="space-y-3">
              {activities.slice(0, 6).map((a) => {
                const label =
                  m.timeline[
                    `action_${a.action}` as keyof typeof m.timeline
                  ] ?? a.action;
                return (
                  <li key={a.id} className="flex items-start gap-3 text-sm">
                    <div className="size-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {a.actor.displayName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-medium">{a.actor.displayName}</span>{" "}
                        <span className="text-muted-foreground">{label}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(a.createdAt, locale)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Family quick card */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 flex items-center gap-4">
        <div className="size-10 rounded-full bg-accent flex items-center justify-center">
          <Users className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">
            {memberCount + 1}{" "}
            {locale === "zh-TW" ? "位家人一起照顧" : "family members caring together"}
          </p>
          <p className="text-xs text-muted-foreground">
            {locale === "zh-TW"
              ? "邀請兄弟姊妹或看護一起幫忙記錄"
              : "Invite siblings or carers to join"}
          </p>
        </div>
        <Link href={`/app/elders/${elder.id}/family`}>
          <Button variant="outline" size="sm" className="rounded-full">
            {m.dashboard.inviteFamily}
          </Button>
        </Link>
      </section>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  href,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="text-center py-6">
      <div className="size-12 mx-auto rounded-2xl bg-accent/60 flex items-center justify-center mb-3">
        <Icon className="size-5 text-primary" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
        {body}
      </p>
      <Link href={href} className="inline-block mt-4">
        <Button size="sm" className="rounded-full">
          {cta}
        </Button>
      </Link>
    </div>
  );
}
