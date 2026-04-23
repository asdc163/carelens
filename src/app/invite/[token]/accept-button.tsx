"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/app/actions/family";

export function AcceptButton({
  token,
  label,
}: {
  token: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleAccept = () => {
    startTransition(async () => {
      const result = await acceptInvite(token);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Welcome to the care team");
      router.push(`/app/elders/${result.elderId}`);
    });
  };

  return (
    <Button
      onClick={handleAccept}
      disabled={pending}
      size="lg"
      className="rounded-full gap-1.5"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {label}
    </Button>
  );
}
