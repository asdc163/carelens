"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import {
  Camera,
  Edit,
  Loader2,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { addMedication } from "@/app/actions/medications";

type Labels = {
  photoTab: string;
  manualTab: string;
  uploadHint: string;
  analyzing: string;
  reviewTitle: string;
  reviewHint: string;
  name: string;
  nameZh: string;
  dose: string;
  frequency: string;
  purpose: string;
  notes: string;
  save: string;
  saving: string;
  confHigh: string;
  confMed: string;
  confLow: string;
  cancel: string;
};

type OcrShape = {
  name: string | null;
  nameZh: string | null;
  dose: string | null;
  frequency: string | null;
  quantity: string | null;
  purpose: string | null;
  warnings: string[];
  confidence: "high" | "medium" | "low";
};

export function NewMedForm({
  elderId,
  locale,
  labels,
}: {
  elderId: string;
  locale: "zh-TW" | "en-US";
  labels: Labels;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [extracted, setExtracted] = useState<OcrShape | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const handleFile = async (file: File) => {
    setErr(null);
    setPhotoPreview(URL.createObjectURL(file));
    setAnalyzing(true);
    try {
      const form = new FormData();
      form.append("elderId", elderId);
      form.append("photo", file);
      const resp = await fetch("/api/ocr", { method: "POST", body: form });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error ?? "OCR failed");
      setExtracted(data.result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMed = (formData: FormData) => {
    startSaving(async () => {
      const result = await addMedication(elderId, formData);
      if (result && "ok" in result && !result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(locale === "zh-TW" ? "已新增藥物" : "Medication saved");
    });
  };

  const confLabel: Record<string, string> = {
    high: labels.confHigh,
    medium: labels.confMed,
    low: labels.confLow,
  };
  const confStyle: Record<string, string> = {
    high: "bg-success/15 text-success border-success/30",
    medium: "bg-warning/15 text-warning border-warning/30",
    low: "bg-destructive/15 text-destructive border-destructive/30",
  };

  return (
    <Tabs defaultValue="photo" className="space-y-6">
      <TabsList className="grid grid-cols-2 w-full sm:w-auto">
        <TabsTrigger value="photo" className="gap-1.5">
          <Camera className="size-4" />
          {labels.photoTab}
        </TabsTrigger>
        <TabsTrigger value="manual" className="gap-1.5">
          <Edit className="size-4" />
          {labels.manualTab}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="photo" className="space-y-5">
        {!extracted && !analyzing && (
          <label
            htmlFor="photo"
            className={cn(
              "block rounded-2xl border-2 border-dashed border-border bg-card",
              "p-10 text-center cursor-pointer",
              "hover:border-primary/40 hover:bg-accent/20 transition-colors"
            )}
          >
            <div className="size-14 mx-auto rounded-2xl bg-accent/60 flex items-center justify-center mb-3">
              <Upload className="size-6 text-primary" />
            </div>
            <p className="font-medium">{labels.uploadHint}</p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, or WebP · under 8 MB
            </p>
            <input
              ref={fileInputRef}
              id="photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        )}

        {analyzing && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="size-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <Loader2 className="size-6 text-primary animate-spin" />
            </div>
            <p className="font-medium">{labels.analyzing}</p>
            <p className="text-xs text-muted-foreground mt-1">Claude Vision</p>
          </div>
        )}

        {err && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2">
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {extracted && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <p className="font-semibold">{labels.reviewTitle}</p>
                <Badge
                  variant="outline"
                  className={cn("ml-auto text-xs font-semibold", confStyle[extracted.confidence])}
                >
                  {confLabel[extracted.confidence]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{labels.reviewHint}</p>
            </div>

            <form action={saveMed} className="space-y-4 rounded-2xl border border-border bg-card p-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{labels.name}</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={extracted.name ?? ""}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nameZh">{labels.nameZh}</Label>
                  <Input
                    id="nameZh"
                    name="nameZh"
                    defaultValue={extracted.nameZh ?? ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dose">{labels.dose}</Label>
                  <Input
                    id="dose"
                    name="dose"
                    defaultValue={extracted.dose ?? ""}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="frequency">{labels.frequency}</Label>
                  <Input
                    id="frequency"
                    name="frequency"
                    defaultValue={extracted.frequency ?? ""}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="purpose">{labels.purpose}</Label>
                  <Input
                    id="purpose"
                    name="purpose"
                    defaultValue={extracted.purpose ?? ""}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="notes">{labels.notes}</Label>
                  <Textarea id="notes" name="notes" rows={2} />
                </div>
              </div>

              {extracted.warnings.length > 0 && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
                  <p className="text-xs font-semibold text-warning mb-1">
                    {locale === "zh-TW" ? "藥袋警語" : "Label warnings"}
                  </p>
                  <ul className="text-xs text-warning/90 list-disc pl-4 space-y-0.5">
                    {extracted.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setExtracted(null);
                    setPhotoPreview(null);
                    setErr(null);
                  }}
                >
                  {labels.cancel}
                </Button>
                <Button type="submit" disabled={saving} className="gap-1.5 rounded-full">
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {labels.saving}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      {labels.save}
                    </>
                  )}
                </Button>
              </div>
            </form>

            {photoPreview && (
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  {locale === "zh-TW" ? "原始照片" : "Original photo"}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Pill bottle"
                  className="rounded-lg max-h-60 mx-auto"
                />
              </div>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="manual">
        <form action={saveMed} className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="m-name">{labels.name}</Label>
              <Input id="m-name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-nameZh">{labels.nameZh}</Label>
              <Input id="m-nameZh" name="nameZh" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-dose">{labels.dose}</Label>
              <Input id="m-dose" name="dose" required placeholder="5 mg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-frequency">{labels.frequency}</Label>
              <Input
                id="m-frequency"
                name="frequency"
                required
                placeholder={locale === "zh-TW" ? "每日兩次" : "Twice daily"}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="m-purpose">{labels.purpose}</Label>
              <Input id="m-purpose" name="purpose" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="m-notes">{labels.notes}</Label>
              <Textarea id="m-notes" name="notes" rows={2} />
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={saving} className="gap-1.5 rounded-full">
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {labels.saving}
                </>
              ) : (
                labels.save
              )}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}
