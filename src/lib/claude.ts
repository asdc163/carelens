import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const apiKey = process.env.ANTHROPIC_API_KEY;

const client = apiKey ? new Anthropic({ apiKey }) : null;

const MODEL = "claude-sonnet-4-5";

/**
 * If no ANTHROPIC_API_KEY is configured, we return deterministic mock responses
 * so the product is fully demo-able. In production the real Claude API runs.
 */
export const hasClaude = () => !!client;

// ---- OCR: pill bottle ---------------------------------------------------

const OcrResultSchema = z.object({
  name: z.string().nullable(),
  nameZh: z.string().nullable(),
  dose: z.string().nullable(),
  frequency: z.string().nullable(),
  quantity: z.string().nullable(),
  purpose: z.string().nullable(),
  warnings: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
});

export type OcrResult = z.infer<typeof OcrResultSchema>;

export async function ocrPillBottle(imageBase64: string, mime: string): Promise<OcrResult> {
  if (!client) {
    return {
      name: "Amlodipine",
      nameZh: "脈優錠",
      dose: "5 mg",
      frequency: "每日一次",
      quantity: "30 錠",
      purpose: "高血壓",
      warnings: ["避免葡萄柚汁", "起身時緩慢以免頭暈"],
      confidence: "high",
    };
  }

  const prompt = `You are extracting medication info from a photo of a pill bottle or prescription slip.
Return ONLY valid JSON matching this schema (no prose, no code fences):
{
  "name": string | null,          // generic drug name in English if identifiable
  "nameZh": string | null,        // Traditional Chinese name if visible or translatable
  "dose": string | null,          // e.g. "5 mg", "500 mg"
  "frequency": string | null,     // e.g. "每日一次", "BID", "Twice daily"
  "quantity": string | null,      // pack size if visible
  "purpose": string | null,       // indication if printed, else null
  "warnings": string[],           // any printed cautions, short strings
  "confidence": "high" | "medium" | "low"  // "low" if handwritten or blurry
}
Rules: never hallucinate drug names. If unsure, set name to null and confidence to "low".`;

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mime as "image/png", data: imageBase64 },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const raw = resp.content[0];
  if (raw.type !== "text") throw new Error("Unexpected Claude response");
  const parsed = JSON.parse(raw.text);
  return OcrResultSchema.parse(parsed);
}

// ---- Drug interaction check -------------------------------------------

const InteractionPairSchema = z.object({
  medA: z.string(),
  medB: z.string(),
  severity: z.enum(["NONE", "MILD", "MODERATE", "SEVERE", "CRITICAL"]),
  summary: z.string(),
  summaryZh: z.string(),
  mechanism: z.string().optional(),
  recommendation: z.string(),
});

const InteractionReportSchema = z.object({
  overallSeverity: z.enum(["NONE", "MILD", "MODERATE", "SEVERE", "CRITICAL"]),
  pairs: z.array(InteractionPairSchema),
  generalNotes: z.string(),
  generalNotesZh: z.string(),
});

export type InteractionReport = z.infer<typeof InteractionReportSchema>;

export async function checkInteractions(meds: Array<{ id: string; name: string; nameZh?: string | null; dose: string }>): Promise<InteractionReport> {
  if (meds.length < 2) {
    return {
      overallSeverity: "NONE",
      pairs: [],
      generalNotes: "Only one medication on record; no interactions to check.",
      generalNotesZh: "目前只有一種藥物，無需交互作用分析。",
    };
  }

  if (!client) {
    // Deterministic mock for demo
    const hasWarfarin = meds.some((m) => /warfarin|華法林|可邁丁/i.test(m.name + (m.nameZh ?? "")));
    const hasAspirin = meds.some((m) => /aspirin|阿斯匹靈|阿司匹林/i.test(m.name + (m.nameZh ?? "")));
    if (hasWarfarin && hasAspirin) {
      return {
        overallSeverity: "SEVERE",
        pairs: [
          {
            medA: "Warfarin",
            medB: "Aspirin",
            severity: "SEVERE",
            summary: "Combining Warfarin with Aspirin substantially increases bleeding risk.",
            summaryZh: "Warfarin 與 Aspirin 併用會明顯提高出血風險。",
            mechanism: "Additive antiplatelet + anticoagulant effect",
            recommendation: "Consult prescribing physician before continuing this combination.",
          },
        ],
        generalNotes: "One SEVERE interaction detected. Discuss with the doctor at the next visit.",
        generalNotesZh: "偵測到一組「重度」交互作用。建議下次回診時與醫師確認。",
      };
    }
    return {
      overallSeverity: "NONE",
      pairs: [],
      generalNotes: "No significant interactions detected among the current medication list.",
      generalNotesZh: "目前藥物清單中未偵測到顯著交互作用。",
    };
  }

  const list = meds.map((m) => `- ${m.name}${m.nameZh ? ` (${m.nameZh})` : ""} ${m.dose}`).join("\n");
  const prompt = `You are a clinical pharmacology assistant.
Given the following list of medications an elderly patient is taking, identify any drug-drug interactions.
For each pair with a non-NONE interaction, produce an entry.
Return ONLY valid JSON:
{
  "overallSeverity": "NONE"|"MILD"|"MODERATE"|"SEVERE"|"CRITICAL",
  "pairs": [
    {
      "medA": string, "medB": string,
      "severity": "NONE"|"MILD"|"MODERATE"|"SEVERE"|"CRITICAL",
      "summary": string (English, 1-2 sentences),
      "summaryZh": string (繁體中文, 1-2 句),
      "mechanism": string (optional, brief),
      "recommendation": string (what the family should do)
    }
  ],
  "generalNotes": string, "generalNotesZh": string
}
Be conservative but actionable. Never recommend stopping a medication; always defer to the prescribing physician.

Medication list:
${list}`;

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = resp.content[0];
  if (raw.type !== "text") throw new Error("Unexpected Claude response");
  const parsed = JSON.parse(raw.text);
  return InteractionReportSchema.parse(parsed);
}

// ---- Daily insight ----------------------------------------------------

const InsightSchema = z.object({
  summary: z.string(),
  summaryZh: z.string(),
  highlights: z.array(
    z.object({
      kind: z.enum(["trend", "alert", "reminder", "good"]),
      title: z.string(),
      titleZh: z.string(),
      detail: z.string(),
      detailZh: z.string(),
    })
  ),
});

export type DailyInsight = z.infer<typeof InsightSchema>;

export async function generateInsight(context: {
  elderName: string;
  recentVitals: Array<{ type: string; value: number; unit: string; measuredAt: string }>;
  medications: Array<{ name: string; dose: string }>;
}): Promise<DailyInsight> {
  if (!client) {
    return {
      summary: `${context.elderName}'s vitals this week are within normal range. Blood pressure trended slightly up on two days, worth noting if it persists.`,
      summaryZh: `${context.elderName} 這週生命徵象大致平穩，有兩天血壓稍高，若持續建議記錄下來與醫師討論。`,
      highlights: [
        {
          kind: "trend",
          title: "BP trending slightly up",
          titleZh: "血壓小幅上升",
          detail: "Average 128/82 vs last week's 122/78.",
          detailZh: "平均 128/82，上週為 122/78。",
        },
        {
          kind: "good",
          title: "Consistent HR",
          titleZh: "心率穩定",
          detail: "Resting HR stable around 72 bpm.",
          detailZh: "靜止心率穩定在 72 bpm 左右。",
        },
        {
          kind: "reminder",
          title: "Log glucose today",
          titleZh: "記得量血糖",
          detail: "Last glucose reading was 3 days ago.",
          detailZh: "上次量血糖是 3 天前。",
        },
      ],
    };
  }

  const vitalsStr = context.recentVitals
    .slice(-30)
    .map((v) => `${v.measuredAt.split("T")[0]} ${v.type}=${v.value}${v.unit}`)
    .join("; ");
  const medsStr = context.medications.map((m) => `${m.name} ${m.dose}`).join(", ");

  const prompt = `You are a caring family health assistant (not a doctor).
Generate a short daily-briefing insight for family members about their elder's recent health.
Patient: ${context.elderName}
Medications: ${medsStr || "none on record"}
Recent vitals: ${vitalsStr || "none on record"}

Return ONLY JSON:
{
  "summary": string (English, 2-3 sentences, friendly and factual),
  "summaryZh": string (繁體中文, 2-3 句, 語氣溫暖但客觀),
  "highlights": [
    {
      "kind": "trend"|"alert"|"reminder"|"good",
      "title": string, "titleZh": string,
      "detail": string, "detailZh": string
    }
  ]
}
Include 2-4 highlights. Flag concerning trends but never diagnose. Always suggest "consult the doctor" for anything alarming.`;

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = resp.content[0];
  if (raw.type !== "text") throw new Error("Unexpected Claude response");
  const parsed = JSON.parse(raw.text);
  return InsightSchema.parse(parsed);
}
