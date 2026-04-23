/**
 * Seed script — populates a demo account with realistic data.
 * Run with: pnpm tsx prisma/seed.ts
 *
 * Idempotent: safe to run multiple times; clears demo data before seeding.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = process.env.DATABASE_URL ?? "file:./prisma/carelens.db";
const filename = url.startsWith("file:") ? url.slice(5) : url;

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: filename }),
});

const DEMO_EMAIL = "demo@carelens.app";
const SIBLING_EMAIL = "sibling@carelens.app";

async function main() {
  console.log("🌱 Seeding CareLens demo data…");

  // --- Users ---
  const hash = await bcrypt.hash("demo-seed", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { displayName: "Tommy" },
    create: {
      email: DEMO_EMAIL,
      displayName: "Tommy",
      passwordHash: hash,
      locale: "zh-TW",
    },
  });

  const sibling = await prisma.user.upsert({
    where: { email: SIBLING_EMAIL },
    update: { displayName: "姊姊 Jenny" },
    create: {
      email: SIBLING_EMAIL,
      displayName: "姊姊 Jenny",
      passwordHash: hash,
      locale: "zh-TW",
    },
  });

  // --- Wipe demo elder and related data if exists ---
  const existingElder = await prisma.elder.findFirst({
    where: { ownerId: demoUser.id, name: "媽媽" },
  });
  if (existingElder) {
    await prisma.elder.delete({ where: { id: existingElder.id } });
  }

  // --- Create elder ---
  const elder = await prisma.elder.create({
    data: {
      ownerId: demoUser.id,
      name: "媽媽",
      birthdate: new Date("1955-03-14"),
      conditions: JSON.stringify(["高血壓", "第二型糖尿病"]),
      allergies: JSON.stringify(["盤尼西林"]),
      timezone: "Asia/Taipei",
    },
  });

  // --- Family member (sibling) ---
  await prisma.familyMember.create({
    data: {
      elderId: elder.id,
      userId: sibling.id,
      role: "CAREGIVER",
    },
  });

  // --- Medications ---
  const now = new Date();
  const daysAgo = (n: number) =>
    new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const meds = await Promise.all([
    prisma.medication.create({
      data: {
        elderId: elder.id,
        name: "Amlodipine",
        nameZh: "脈優錠",
        dose: "5 mg",
        frequency: "每日一次",
        purpose: "高血壓",
        startedOn: daysAgo(60),
        addedById: demoUser.id,
      },
    }),
    prisma.medication.create({
      data: {
        elderId: elder.id,
        name: "Metformin",
        nameZh: "庫魯化錠",
        dose: "500 mg",
        frequency: "每日兩次",
        purpose: "糖尿病",
        startedOn: daysAgo(120),
        addedById: demoUser.id,
      },
    }),
    prisma.medication.create({
      data: {
        elderId: elder.id,
        name: "Aspirin",
        nameZh: "阿斯匹靈",
        dose: "100 mg",
        frequency: "每日一次",
        purpose: "心血管預防",
        startedOn: daysAgo(30),
        addedById: sibling.id,
      },
    }),
    prisma.medication.create({
      data: {
        elderId: elder.id,
        name: "Warfarin",
        nameZh: "可邁丁",
        dose: "2.5 mg",
        frequency: "每日一次",
        purpose: "抗凝血",
        startedOn: daysAgo(5),
        addedById: sibling.id,
      },
    }),
  ]);

  // --- Interaction (SEVERE because Warfarin + Aspirin) ---
  await prisma.interaction.create({
    data: {
      elderId: elder.id,
      medIds: JSON.stringify(meds.map((m) => m.id)),
      severity: "SEVERE",
      summary:
        "Combining Warfarin with Aspirin substantially increases bleeding risk.",
      summaryZh:
        "Warfarin 與 Aspirin 併用會明顯提高出血風險，建議盡快與醫師確認。",
      details: JSON.stringify({
        pairs: [
          {
            medA: "Warfarin",
            medB: "Aspirin",
            severity: "SEVERE",
            mechanism: "Additive antiplatelet + anticoagulant effect",
          },
        ],
      }),
    },
  });

  // --- Vitals: last 14 days BP + HR + glucose ---
  const vitalsData: Array<{
    type: string;
    value: number;
    unit: string;
    measuredAt: Date;
  }> = [];
  for (let i = 13; i >= 0; i--) {
    const day = daysAgo(i);
    const bpBase = 118 + Math.round(Math.sin(i * 0.6) * 6 + (i < 3 ? 6 : 0));
    const bpDia = 76 + Math.round(Math.cos(i * 0.5) * 4);
    const hr = 70 + Math.round(Math.sin(i * 0.4) * 5);
    const glucose = 105 + Math.round(Math.sin(i * 0.3) * 12);
    vitalsData.push(
      {
        type: "BP_SYSTOLIC",
        value: bpBase,
        unit: "mmHg",
        measuredAt: new Date(day.setHours(8, 15, 0, 0)),
      },
      {
        type: "BP_DIASTOLIC",
        value: bpDia,
        unit: "mmHg",
        measuredAt: new Date(day.setHours(8, 15, 0, 0)),
      },
      {
        type: "HR",
        value: hr,
        unit: "bpm",
        measuredAt: new Date(day.setHours(8, 16, 0, 0)),
      }
    );
    if (i % 2 === 0) {
      vitalsData.push({
        type: "GLUCOSE",
        value: glucose,
        unit: "mg/dL",
        measuredAt: new Date(day.setHours(8, 20, 0, 0)),
      });
    }
  }
  // Weight — weekly
  vitalsData.push(
    {
      type: "WEIGHT",
      value: 58.2,
      unit: "kg",
      measuredAt: daysAgo(14),
    },
    {
      type: "WEIGHT",
      value: 58.1,
      unit: "kg",
      measuredAt: daysAgo(7),
    },
    {
      type: "WEIGHT",
      value: 58.4,
      unit: "kg",
      measuredAt: daysAgo(1),
    }
  );

  for (const v of vitalsData) {
    await prisma.vital.create({
      data: {
        elderId: elder.id,
        loggedById:
          Math.random() > 0.5 ? demoUser.id : sibling.id,
        ...v,
      },
    });
  }

  // --- Activity log ---
  await prisma.activityLog.createMany({
    data: [
      {
        elderId: elder.id,
        actorId: demoUser.id,
        action: "ELDER_CREATED",
        payload: JSON.stringify({ name: elder.name }),
        createdAt: daysAgo(120),
      },
      {
        elderId: elder.id,
        actorId: demoUser.id,
        action: "MED_ADDED",
        payload: JSON.stringify({ name: "Metformin", dose: "500 mg" }),
        createdAt: daysAgo(120),
      },
      {
        elderId: elder.id,
        actorId: demoUser.id,
        action: "MEMBER_INVITED",
        payload: JSON.stringify({ email: SIBLING_EMAIL, role: "CAREGIVER" }),
        createdAt: daysAgo(119),
      },
      {
        elderId: elder.id,
        actorId: sibling.id,
        action: "MEMBER_JOINED",
        payload: JSON.stringify({ role: "CAREGIVER" }),
        createdAt: daysAgo(119),
      },
      {
        elderId: elder.id,
        actorId: demoUser.id,
        action: "MED_ADDED",
        payload: JSON.stringify({ name: "Amlodipine", dose: "5 mg" }),
        createdAt: daysAgo(60),
      },
      {
        elderId: elder.id,
        actorId: sibling.id,
        action: "MED_ADDED",
        payload: JSON.stringify({ name: "Aspirin", dose: "100 mg" }),
        createdAt: daysAgo(30),
      },
      {
        elderId: elder.id,
        actorId: sibling.id,
        action: "VITAL_LOGGED",
        payload: JSON.stringify({ type: "BP", sys: 128, dia: 82 }),
        createdAt: daysAgo(2),
      },
      {
        elderId: elder.id,
        actorId: sibling.id,
        action: "MED_ADDED",
        payload: JSON.stringify({ name: "Warfarin", dose: "2.5 mg" }),
        createdAt: daysAgo(5),
      },
      {
        elderId: elder.id,
        actorId: demoUser.id,
        action: "INTERACTION_CHECKED",
        payload: JSON.stringify({ severity: "SEVERE" }),
        createdAt: daysAgo(5),
      },
      {
        elderId: elder.id,
        actorId: demoUser.id,
        action: "VITAL_LOGGED",
        payload: JSON.stringify({ type: "BP", sys: 124, dia: 80 }),
        createdAt: daysAgo(1),
      },
    ],
  });

  console.log(`✅ Seeded demo account:`);
  console.log(`   Email:   ${DEMO_EMAIL}`);
  console.log(`   Elder:   ${elder.name}`);
  console.log(`   Meds:    ${meds.length}`);
  console.log(`   Vitals:  ${vitalsData.length}`);
  console.log();
  console.log(`   Tip: Click "Try with demo account" on the sign-in page.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
