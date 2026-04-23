import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_TC } from "next/font/google";
import { Toaster } from "sonner";
import { getLocale } from "@/lib/locale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "CareLens — 陪你一起照顧爸媽的 AI 長照助手",
  description:
    "拍下藥袋，CareLens 自動辨識藥名、檢查交互作用、通知全家人。專為華人家庭設計的多模態 AI 長照 SaaS。Snap a photo, CareLens handles the rest.",
  metadataBase: new URL("https://carelens.app"),
  openGraph: {
    title: "CareLens — AI Caregiving Copilot",
    description:
      "Family-first eldercare with multimodal AI. Built for Chinese-speaking families.",
    siteName: "CareLens",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansTC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
