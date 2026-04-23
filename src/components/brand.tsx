import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <LogoMark className="size-7 text-primary" />
      <span className="tracking-tight text-foreground">CareLens</span>
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="cl-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        fill="url(#cl-grad)"
        opacity="0.14"
      />
      {/* Lens/eye shape + heart pulse line */}
      <path
        d="M8 20c3-6 8-9 12-9s9 3 12 9c-3 6-8 9-12 9s-9-3-12-9z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M14 20h2.5l1.5-3 2.5 6 2-4 1.5 2H26"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
