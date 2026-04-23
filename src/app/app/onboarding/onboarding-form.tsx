"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createElder } from "@/app/actions/elders";

export function OnboardingForm({
  labels,
}: {
  labels: {
    elderName: string;
    elderNamePlaceholder: string;
    birthdate: string;
    conditions: string;
    conditionsPlaceholder: string;
    allergies: string;
    allergiesPlaceholder: string;
    submit: string;
  };
}) {
  const [pending, startTransition] = useTransition();

  const submit = async (formData: FormData) => {
    startTransition(async () => {
      await createElder(formData);
    });
  };

  return (
    <form action={submit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">{labels.elderName}</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder={labels.elderNamePlaceholder}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="birthdate">{labels.birthdate}</Label>
        <Input
          id="birthdate"
          name="birthdate"
          type="date"
          required
          defaultValue="1950-01-01"
          max="2020-12-31"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="conditions">{labels.conditions}</Label>
        <Input
          id="conditions"
          name="conditions"
          placeholder={labels.conditionsPlaceholder}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="allergies">{labels.allergies}</Label>
        <Input
          id="allergies"
          name="allergies"
          placeholder={labels.allergiesPlaceholder}
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full h-11 rounded-full"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {labels.submit}
      </Button>
    </form>
  );
}
