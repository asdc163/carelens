import Link from "next/link";
import { redirect } from "next/navigation";
import { getMessages } from "@/lib/locale";
import { getCurrentUser } from "@/lib/auth";
import { Wordmark } from "@/components/brand";
import { LocaleSwitch } from "@/components/locale-switch";
import { AuthForm } from "./auth-form";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; next?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";
  const next = params.next ?? "/app";

  const user = await getCurrentUser();
  if (user) redirect(next);

  const { locale, m } = await getMessages();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Wordmark />
          </Link>
          <LocaleSwitch current={locale} />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {mode === "signup" ? m.auth.signUpTitle : m.auth.signInTitle}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signup" ? m.auth.signUpSub : m.auth.signInSub}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <AuthForm
              mode={mode as "signin" | "signup"}
              next={next}
              labels={{
                email: m.auth.email,
                password: m.auth.password,
                displayName: m.auth.displayName,
                submitSignIn: m.auth.submitSignIn,
                submitSignUp: m.auth.submitSignUp,
                toggleToSignUp: m.auth.toggleToSignUp,
                toggleToSignIn: m.auth.toggleToSignIn,
                tryDemo: m.auth.tryDemo,
                demoHint: m.auth.demoHint,
              }}
            />
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground px-2">
            {m.landing.disclaimer}
          </p>
        </div>
      </main>
    </div>
  );
}
