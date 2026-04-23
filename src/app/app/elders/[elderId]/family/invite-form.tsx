"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Copy, Check } from "lucide-react";
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
import { inviteFamilyMember } from "@/app/actions/family";

export function InviteForm({
  elderId,
  labels,
}: {
  elderId: string;
  labels: {
    placeholder: string;
    roleLabel: string;
    submit: string;
    sent: string;
    caregiver: string;
    viewer: string;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const result = await inviteFamilyMember(elderId, formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(labels.sent);
      setInviteUrl(
        typeof window !== "undefined"
          ? `${window.location.origin}${result.inviteUrl}`
          : result.inviteUrl
      );
    });
  };

  const copy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <form action={submit} className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder={labels.placeholder}
          />
        </div>
        <div className="w-full sm:w-40 space-y-1.5">
          <Label htmlFor="invite-role">{labels.roleLabel}</Label>
          <Select name="role" defaultValue="CAREGIVER">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CAREGIVER">{labels.caregiver}</SelectItem>
              <SelectItem value="VIEWER">{labels.viewer}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={pending} className="rounded-full sm:self-end">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {labels.submit}
        </Button>
      </form>

      {inviteUrl && (
        <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center gap-2 text-sm">
          <code className="flex-1 truncate text-xs">{inviteUrl}</code>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={copy}
          >
            {copied ? (
              <>
                <Check className="size-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" /> Copy link
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
