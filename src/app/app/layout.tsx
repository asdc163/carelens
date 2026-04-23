import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listMyElders } from "@/lib/elders";
import { getMessages } from "@/lib/locale";
import { AppShell } from "./_components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/app");

  const elders = await listMyElders();
  const { locale, m } = await getMessages();

  return (
    <AppShell
      user={{ id: user.id, name: user.displayName, email: user.email }}
      elders={elders.map((e) => ({ id: e.id, name: e.name, avatarUrl: e.avatarUrl }))}
      locale={locale}
      nav={{
        dashboard: m.nav.dashboard,
        medications: m.nav.medications,
        vitals: m.nav.vitals,
        timeline: m.nav.timeline,
        family: m.nav.family,
        settings: m.nav.settings,
        signOut: m.nav.signOut,
      }}
    >
      {children}
    </AppShell>
  );
}
