import { redirect } from "next/navigation";
import { listMyElders } from "@/lib/elders";

export default async function AppIndexPage() {
  const elders = await listMyElders();
  if (elders.length === 0) {
    redirect("/app/onboarding");
  }
  redirect(`/app/elders/${elders[0].id}`);
}
