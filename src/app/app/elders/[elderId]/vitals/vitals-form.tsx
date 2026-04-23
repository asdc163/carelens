"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { HeartPulse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logBP, logVital } from "@/app/actions/vitals";

type Labels = {
  logVital: string;
  systolic: string;
  diastolic: string;
  hr: string;
  glucose: string;
  weight: string;
  spo2: string;
  bp: string;
  submit: string;
  logToday: string;
  cancel: string;
};

const simpleVitals = [
  { key: "HR", label: "hr", unit: "bpm", step: 1 },
  { key: "GLUCOSE", label: "glucose", unit: "mg/dL", step: 1 },
  { key: "WEIGHT", label: "weight", unit: "kg", step: 0.1 },
  { key: "SPO2", label: "spo2", unit: "%", step: 1 },
] as const;

export function VitalsForm({
  elderId,
  labels,
}: {
  elderId: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [type, setType] = useState<string>("BP");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const result =
        type === "BP"
          ? await logBP(elderId, formData)
          : await logVital(elderId, formData);
      if (result && "ok" in result && !result.ok) {
        toast.error(result.error ?? "Failed to log");
        return;
      }
      toast.success("Saved");
      setOpen(false);
      router.refresh();
    });
  };

  const activeUnit =
    type === "BP"
      ? "mmHg"
      : simpleVitals.find((v) => v.key === type)?.unit ?? "";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="lg" className="gap-1.5 rounded-full">
          <HeartPulse className="size-4" />
          {labels.logToday}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="sm:max-w-lg sm:mx-auto sm:rounded-t-2xl">
        <SheetHeader className="sm:text-left">
          <SheetTitle>{labels.logVital}</SheetTitle>
        </SheetHeader>
        <form action={submit} className="space-y-4 p-6">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BP">{labels.bp}</SelectItem>
                <SelectItem value="HR">{labels.hr}</SelectItem>
                <SelectItem value="GLUCOSE">{labels.glucose}</SelectItem>
                <SelectItem value="WEIGHT">{labels.weight}</SelectItem>
                <SelectItem value="SPO2">{labels.spo2}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "BP" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="systolic">{labels.systolic}</Label>
                <Input
                  id="systolic"
                  name="systolic"
                  type="number"
                  required
                  inputMode="numeric"
                  min={40}
                  max={260}
                  placeholder="120"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="diastolic">{labels.diastolic}</Label>
                <Input
                  id="diastolic"
                  name="diastolic"
                  type="number"
                  required
                  inputMode="numeric"
                  min={30}
                  max={160}
                  placeholder="80"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="value">
                {labels[
                  (simpleVitals.find((v) => v.key === type)?.label ?? "hr") as keyof Labels
                ] as string}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="value"
                  name="value"
                  type="number"
                  required
                  inputMode="decimal"
                  step={simpleVitals.find((v) => v.key === type)?.step ?? 1}
                  className="flex-1"
                />
                <input type="hidden" name="type" value={type} />
                <input type="hidden" name="unit" value={activeUnit} />
                <span className="self-center text-sm text-muted-foreground w-16">
                  {activeUnit}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={pending} className="rounded-full gap-1.5">
              {pending && <Loader2 className="size-4 animate-spin" />}
              {labels.submit}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
