import Link from "next/link";
import {
  ArrowRight,
  Camera,
  HeartPulse,
  Users,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  ScanLine,
  TriangleAlert,
} from "lucide-react";
import { getMessages } from "@/lib/locale";
import { Wordmark, LogoMark } from "@/components/brand";
import { LocaleSwitch } from "@/components/locale-switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function LandingPage() {
  const { locale, m } = await getMessages();

  return (
    <>
      <SiteHeader locale={locale} signIn={m.nav.signIn} tryItFree={m.nav.tryItFree} />
      <main className="flex-1">
        <Hero
          title={m.landing.heroTitle}
          sub={m.landing.heroSub}
          primaryCta={m.landing.primaryCta}
          secondaryCta={m.landing.secondaryCta}
        />
        <ProblemSection m={m} />
        <FeatureSection m={m} />
        <DemoFlowSection m={m} />
        <FinalCtaSection m={m} />
      </main>
      <SiteFooter m={m} />
    </>
  );
}

/* ---------------------- Header ---------------------- */

function SiteHeader({
  locale,
  signIn,
  tryItFree,
}: {
  locale: "zh-TW" | "en-US";
  signIn: string;
  tryItFree: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitch current={locale} />
          <Link
            href="/auth"
            className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-colors"
          >
            {signIn}
          </Link>
          <Link href="/auth?mode=signup">
            <Button size="sm" className="rounded-full px-4">
              {tryItFree}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------------------- Hero ---------------------- */

function Hero({
  title,
  sub,
  primaryCta,
  secondaryCta,
}: {
  title: string;
  sub: string;
  primaryCta: string;
  secondaryCta: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--primary) 22%, transparent) 0%, transparent 60%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-3">
            <Badge
              variant="secondary"
              className="mb-5 rounded-full gap-1.5 px-3 py-1 font-medium"
            >
              <Sparkles className="size-3.5" />
              Multimodal AI · 繁中原生
            </Badge>
            <h1 className="text-pretty text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
              {title}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-muted-foreground max-w-2xl text-pretty">
              {sub}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
              <Link href="/auth?mode=signup">
                <Button size="lg" className="rounded-full px-6 h-12 text-base gap-1.5 w-full sm:w-auto">
                  {primaryCta}
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full h-12 px-6 text-base font-medium hover:bg-secondary transition-colors"
              >
                {secondaryCta}
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                <span>Free · No credit card</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-border" />
                <span>Data isolated per family</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto max-w-sm lg:max-w-none">
      <div className="relative rounded-[28px] border border-border bg-card shadow-[0_30px_80px_-20px_rgba(14,116,144,0.25)] overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-2 text-[11px] text-muted-foreground">
          <span className="font-medium">9:41</span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-1 rounded-full bg-current" />
            <span className="inline-block size-1 rounded-full bg-current" />
            <span className="inline-block size-1 rounded-full bg-current" />
          </span>
        </div>

        <div className="px-5 pt-2 pb-5 space-y-4">
          <div className="flex items-center gap-2">
            <LogoMark className="size-6 text-primary" />
            <span className="font-semibold text-sm">CareLens</span>
            <span className="ml-auto text-xs text-muted-foreground">媽媽</span>
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="size-4 mt-0.5 text-primary shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-primary">今日摘要</p>
                <p className="text-sm leading-relaxed">
                  血壓 128/82，略高於上週平均。睡眠偏少，建議今晚早點休息。
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3.5">
            <div className="flex items-start gap-2">
              <TriangleAlert className="size-4 mt-0.5 text-destructive shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-destructive">
                  交互作用警告 · 重度
                </p>
                <p className="text-xs leading-snug text-foreground/80">
                  Warfarin 與 Aspirin 併用會增加出血風險
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "血壓", v: "128/82", u: "mmHg" },
              { l: "心率", v: "72", u: "bpm" },
              { l: "血糖", v: "96", u: "mg/dL" },
            ].map((x) => (
              <div key={x.l} className="rounded-lg border border-border p-2.5">
                <p className="text-[10px] text-muted-foreground">{x.l}</p>
                <p className="text-sm font-semibold leading-tight mt-0.5">
                  {x.v}
                </p>
                <p className="text-[10px] text-muted-foreground">{x.u}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-secondary/60 p-3 flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {["M", "J", "K"].map((c, i) => (
                <div
                  key={i}
                  className="size-6 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center ring-2 ring-card"
                >
                  {c}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              3 位家人一起照顧
            </p>
          </div>
        </div>
      </div>
      <div className="absolute -right-2 top-16 hidden lg:flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium shadow-md">
        <ScanLine className="size-3.5 text-primary" />
        OCR ready
      </div>
      <div className="absolute -left-4 bottom-10 hidden lg:flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium shadow-md">
        <HeartPulse className="size-3.5 text-primary" />
        Real-time insight
      </div>
    </div>
  );
}

/* ---------------------- Problem ---------------------- */

function ProblemSection({ m }: { m: Awaited<ReturnType<typeof getMessages>>["m"] }) {
  const items = [
    { t: m.landing.problem1Title, b: m.landing.problem1Body },
    { t: m.landing.problem2Title, b: m.landing.problem2Body },
    { t: m.landing.problem3Title, b: m.landing.problem3Body },
  ];
  return (
    <section className="border-y border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-pretty text-3xl sm:text-4xl font-semibold tracking-tight text-center">
          {m.landing.problemTitle}
        </h2>
        <div className="mt-12 grid md:grid-cols-3 gap-4 sm:gap-6">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="size-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center font-semibold">
                {idx + 1}
              </div>
              <h3 className="mt-4 font-semibold text-lg">{it.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {it.b}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Features ---------------------- */

function FeatureSection({
  m,
}: {
  m: Awaited<ReturnType<typeof getMessages>>["m"];
}) {
  const features = [
    {
      icon: Camera,
      title: m.landing.feat1Title,
      body: m.landing.feat1Body,
      accent: "chart-1",
    },
    {
      icon: TriangleAlert,
      title: m.landing.feat2Title,
      body: m.landing.feat2Body,
      accent: "chart-4",
    },
    {
      icon: Users,
      title: m.landing.feat3Title,
      body: m.landing.feat3Body,
      accent: "chart-2",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
      <h2 className="text-center text-pretty text-3xl sm:text-4xl font-semibold tracking-tight">
        {m.landing.featuresTitle}
      </h2>
      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {features.map(({ icon: Icon, title, body, accent }) => (
          <div
            key={title}
            className="group relative rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:border-primary/30"
          >
            <div
              className="size-10 rounded-lg flex items-center justify-center text-primary"
              style={{
                background: `color-mix(in oklch, var(--${accent}) 15%, transparent)`,
              }}
            >
              <Icon className="size-5" />
            </div>
            <h3 className="mt-5 font-semibold text-lg">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------- Demo flow ---------------------- */

function DemoFlowSection({
  m,
}: {
  m: Awaited<ReturnType<typeof getMessages>>["m"];
}) {
  const steps = [
    { n: "1", label: m.meds.photoTab, hint: m.meds.uploadHint },
    { n: "2", label: m.meds.analyzing, hint: "Claude Vision · 2-4s" },
    { n: "3", label: m.meds.reviewTitle, hint: m.meds.reviewHint },
    {
      n: "4",
      label: m.meds.interactionWarning,
      hint: m.landing.feat2Body.slice(0, 40) + "…",
    },
  ];
  return (
    <section className="bg-secondary/30 border-y border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2">
            <h2 className="text-pretty text-3xl sm:text-4xl font-semibold tracking-tight">
              {m.landing.feat1Title}
            </h2>
            <p className="mt-4 text-muted-foreground text-pretty">
              {m.landing.feat1Body}
            </p>
          </div>
          <div className="lg:col-span-3">
            <ol className="space-y-3">
              {steps.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <div className="size-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {s.n}
                  </div>
                  <div>
                    <p className="font-medium">{s.label}</p>
                    <p className="text-sm text-muted-foreground">{s.hint}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Final CTA ---------------------- */

function FinalCtaSection({
  m,
}: {
  m: Awaited<ReturnType<typeof getMessages>>["m"];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
      <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 100%, color-mix(in oklch, var(--primary) 25%, transparent) 0%, transparent 70%)",
          }}
        />
        <h2 className="text-pretty text-3xl sm:text-4xl font-semibold tracking-tight">
          {m.landing.ctaTitle}
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-pretty">
          {m.landing.ctaBody}
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/auth?mode=signup">
            <Button size="lg" className="rounded-full px-7 h-12 text-base gap-1.5">
              {m.landing.primaryCta}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
        <p className="mt-8 text-xs text-muted-foreground max-w-xl mx-auto">
          {m.landing.disclaimer}
        </p>
      </div>
    </section>
  );
}

/* ---------------------- Footer ---------------------- */

function SiteFooter({
  m,
}: {
  m: Awaited<ReturnType<typeof getMessages>>["m"];
}) {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wordmark />
          <span className="text-sm text-muted-foreground hidden sm:inline">
            · {m.landing.footerMade}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href="https://github.com/asdc163"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <ExternalLink className="size-4" />
            GitHub
          </a>
          <span>© {new Date().getFullYear()} CareLens</span>
        </div>
      </div>
    </footer>
  );
}
