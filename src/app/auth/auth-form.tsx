"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signIn, signUp, signInAsDemo } from "@/app/actions/auth";

type Labels = {
  email: string;
  password: string;
  displayName: string;
  submitSignIn: string;
  submitSignUp: string;
  toggleToSignUp: string;
  toggleToSignIn: string;
  tryDemo: string;
  demoHint: string;
};

export function AuthForm({
  mode,
  next,
  labels,
}: {
  mode: "signin" | "signup";
  next: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [demoPending, startDemo] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setErr(null);
    startTransition(async () => {
      const action = mode === "signup" ? signUp : signIn;
      const result = await action(formData);
      if (!result.ok) {
        setErr(result.error);
        return;
      }
      toast.success(mode === "signup" ? "Welcome to CareLens" : "Welcome back");
      router.push(next);
      router.refresh();
    });
  };

  const handleDemo = () => {
    setErr(null);
    startDemo(async () => {
      const res = await signInAsDemo();
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      toast.success("Demo account ready");
      router.push("/app");
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <form action={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="displayName">{labels.displayName}</Label>
            <Input
              id="displayName"
              name="displayName"
              required
              autoComplete="name"
              placeholder="Tommy"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">{labels.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{labels.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="••••••••"
          />
        </div>

        {err && (
          <p
            role="alert"
            className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2"
          >
            {err}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full h-11 rounded-full">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {mode === "signup" ? labels.submitSignUp : labels.submitSignIn}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
          or
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 rounded-full gap-1.5"
        onClick={handleDemo}
        disabled={demoPending}
      >
        {demoPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4 text-primary" />
        )}
        {labels.tryDemo}
      </Button>
      <p className="text-center text-xs text-muted-foreground -mt-2">
        {labels.demoHint}
      </p>

      <p className="text-center text-sm text-muted-foreground pt-2">
        {mode === "signup" ? (
          <Link href={`/auth?mode=signin${next ? `&next=${encodeURIComponent(next)}` : ""}`} className="text-foreground hover:underline">
            {labels.toggleToSignIn}
          </Link>
        ) : (
          <Link href={`/auth?mode=signup${next ? `&next=${encodeURIComponent(next)}` : ""}`} className="text-foreground hover:underline">
            {labels.toggleToSignUp}
          </Link>
        )}
      </p>
    </div>
  );
}
