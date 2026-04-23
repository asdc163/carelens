import { prisma } from "@/lib/db";
import { requireElderAccess } from "@/lib/elders";
import { getMessages } from "@/lib/locale";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { VitalsForm } from "./vitals-form";

type VitalRow = { type: string; value: number; unit: string; measuredAt: Date };

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" className="w-full h-10" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={`var(--${color})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default async function VitalsPage({
  params,
}: {
  params: Promise<{ elderId: string }>;
}) {
  const { elderId } = await params;
  const { elder } = await requireElderAccess(elderId);
  const { locale, m } = await getMessages();

  const vitals: VitalRow[] = await prisma.vital.findMany({
    where: { elderId },
    orderBy: { measuredAt: "desc" },
    take: 200,
  });

  // Group by type
  const byType = new Map<string, VitalRow[]>();
  for (const v of vitals) {
    const arr = byType.get(v.type) ?? [];
    arr.push(v);
    byType.set(v.type, arr);
  }

  const cards = [
    {
      key: "BP_SYSTOLIC",
      label: m.vitals.bp,
      color: "chart-1",
      secondaryKey: "BP_DIASTOLIC",
    },
    { key: "HR", label: m.vitals.hr, color: "chart-2" },
    { key: "GLUCOSE", label: m.vitals.glucose, color: "chart-3" },
    { key: "WEIGHT", label: m.vitals.weight, color: "chart-4" },
    { key: "SPO2", label: m.vitals.spo2, color: "chart-5" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">{elder.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-0.5">
          {m.vitals.title}
        </h1>
      </header>

      <VitalsForm
        elderId={elder.id}
        labels={{
          logVital: m.vitals.logVital,
          systolic: m.vitals.systolic,
          diastolic: m.vitals.diastolic,
          hr: m.vitals.hr,
          glucose: m.vitals.glucose,
          weight: m.vitals.weight,
          spo2: m.vitals.spo2,
          bp: m.vitals.bp,
          submit: m.vitals.logSubmit,
          logToday: m.vitals.logToday,
          cancel: m.common.cancel,
        }}
      />

      <section className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => {
          const rows = byType.get(c.key) ?? [];
          const secondaryRows = c.secondaryKey ? byType.get(c.secondaryKey) ?? [] : [];
          const latest = rows[0];
          const latestSecondary = secondaryRows[0];
          const sparkValues = rows
            .slice(0, 14)
            .map((r) => r.value)
            .reverse();
          return (
            <div
              key={c.key}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </p>
                {latest && (
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(latest.measuredAt, locale)}
                  </p>
                )}
              </div>
              {latest ? (
                <>
                  <p className="mt-2 text-3xl font-semibold">
                    {latest.value}
                    {latestSecondary ? (
                      <span className="text-muted-foreground">
                        /{latestSecondary.value}
                      </span>
                    ) : null}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      {latest.unit}
                    </span>
                  </p>
                  <div className="mt-3">
                    <Sparkline values={sparkValues} color={c.color} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  {m.vitals.noData}
                </p>
              )}
            </div>
          );
        })}
      </section>

      {vitals.length > 0 && (
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-5 pb-3 border-b border-border">
            <h2 className="font-semibold">
              {locale === "zh-TW" ? "所有記錄" : "All readings"}
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {vitals.slice(0, 30).map((v) => (
              <li
                key={`${v.type}-${v.measuredAt.toISOString()}`}
                className="px-5 py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium">
                    {typeToLabel(v.type, m)}{" "}
                    <span className="text-muted-foreground font-normal">
                      {v.value} {v.unit}
                    </span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(v.measuredAt, locale)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function typeToLabel(type: string, m: Awaited<ReturnType<typeof getMessages>>["m"]) {
  switch (type) {
    case "BP_SYSTOLIC":
      return m.vitals.systolic;
    case "BP_DIASTOLIC":
      return m.vitals.diastolic;
    case "HR":
      return m.vitals.hr;
    case "GLUCOSE":
      return m.vitals.glucose;
    case "WEIGHT":
      return m.vitals.weight;
    case "SPO2":
      return m.vitals.spo2;
    case "TEMP":
      return m.vitals.temp;
    default:
      return type;
  }
}
