import { notFound } from "next/navigation";
import { requireElderAccess } from "@/lib/elders";

export default async function ElderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ elderId: string }>;
}) {
  const { elderId } = await params;
  const access = await requireElderAccess(elderId).catch(() => null);
  if (!access) notFound();

  return <>{children}</>;
}
