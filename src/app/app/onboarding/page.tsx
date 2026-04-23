import { getMessages } from "@/lib/locale";
import { OnboardingForm } from "./onboarding-form";
import { Wordmark } from "@/components/brand";

export default async function OnboardingPage() {
  const { m } = await getMessages();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Wordmark className="mx-auto mb-6" />
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-pretty">
            {m.onboarding.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {m.onboarding.sub}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <OnboardingForm
            labels={{
              elderName: m.onboarding.elderName,
              elderNamePlaceholder: m.onboarding.elderNamePlaceholder,
              birthdate: m.onboarding.birthdate,
              conditions: m.onboarding.conditions,
              conditionsPlaceholder: m.onboarding.conditionsPlaceholder,
              allergies: m.onboarding.allergies,
              allergiesPlaceholder: m.onboarding.allergiesPlaceholder,
              submit: m.onboarding.submit,
            }}
          />
        </div>
      </div>
    </div>
  );
}
