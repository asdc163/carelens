import { requireElderAccess } from "@/lib/elders";
import { getMessages } from "@/lib/locale";
import { NewMedForm } from "./new-med-form";

export default async function NewMedPage({
  params,
}: {
  params: Promise<{ elderId: string }>;
}) {
  const { elderId } = await params;
  const { elder } = await requireElderAccess(elderId);
  const { locale, m } = await getMessages();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">{elder.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-0.5">
          {m.meds.addNew}
        </h1>
      </header>

      <NewMedForm
        elderId={elder.id}
        locale={locale}
        labels={{
          photoTab: m.meds.photoTab,
          manualTab: m.meds.manualTab,
          uploadHint: m.meds.uploadHint,
          analyzing: m.meds.analyzing,
          reviewTitle: m.meds.reviewTitle,
          reviewHint: m.meds.reviewHint,
          name: m.meds.name,
          nameZh: m.meds.nameZh,
          dose: m.meds.dose,
          frequency: m.meds.frequency,
          purpose: m.meds.purpose,
          notes: m.meds.notes,
          save: m.meds.save,
          saving: m.meds.saving,
          confHigh: m.meds.confHigh,
          confMed: m.meds.confMed,
          confLow: m.meds.confLow,
          cancel: m.common.cancel,
        }}
      />
    </div>
  );
}
