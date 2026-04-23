"use client";

import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  LayoutDashboard,
  Pill,
  HeartPulse,
  Clock,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  ChevronsUpDown,
} from "lucide-react";
import { Wordmark, LogoMark } from "@/components/brand";
import { LocaleSwitch } from "@/components/locale-switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";

type Elder = { id: string; name: string; avatarUrl: string | null };

export function AppShell({
  children,
  user,
  elders,
  locale,
  nav,
}: {
  children: React.ReactNode;
  user: { id: string; name: string; email: string };
  elders: Elder[];
  locale: "zh-TW" | "en-US";
  nav: {
    dashboard: string;
    medications: string;
    vitals: string;
    timeline: string;
    family: string;
    settings: string;
    signOut: string;
  };
}) {
  const pathname = usePathname();
  const params = useParams<{ elderId?: string }>();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, startTransition] = useTransition();

  const currentElderId = params?.elderId || elders[0]?.id;
  const currentElder = elders.find((e) => e.id === currentElderId) ?? elders[0];

  const baseHref = currentElder ? `/app/elders/${currentElder.id}` : "/app";

  const navItems = [
    { href: baseHref, label: nav.dashboard, icon: LayoutDashboard, exact: true },
    { href: `${baseHref}/medications`, label: nav.medications, icon: Pill },
    { href: `${baseHref}/vitals`, label: nav.vitals, icon: HeartPulse },
    { href: `${baseHref}/timeline`, label: nav.timeline, icon: Clock },
    { href: `${baseHref}/family`, label: nav.family, icon: Users },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/app" className="flex items-center gap-2">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitch current={locale} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="border-t border-border bg-background p-3 space-y-1">
            {currentElder ? (
              <ElderPicker elders={elders} currentId={currentElder.id} />
            ) : null}
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={isActive(item.href, item.exact)}
                onClick={() => setMobileOpen(false)}
                disabled={!currentElder}
              />
            ))}
            <div className="border-t border-border pt-3 mt-3 space-y-1">
              <NavLink
                href="/app/settings"
                label={nav.settings}
                icon={Settings}
                active={pathname.startsWith("/app/settings")}
                onClick={() => setMobileOpen(false)}
              />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <LogOut className="size-4" />
                {nav.signOut}
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col border-r border-border bg-secondary/30">
        <div className="p-4">
          <Link href="/app" className="flex items-center gap-2">
            <Wordmark />
          </Link>
        </div>

        <div className="px-3">
          {currentElder ? (
            <ElderPicker elders={elders} currentId={currentElder.id} />
          ) : (
            <Link
              href="/app/onboarding"
              className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-background transition-colors"
            >
              <Plus className="size-4" />
              <span>Add an elder</span>
            </Link>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={isActive(item.href, item.exact)}
              disabled={!currentElder}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-background transition-colors">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <ChevronsUpDown className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/settings" className="cursor-pointer">
                  <Settings className="size-4" />
                  {nav.settings}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="size-4" />
                {nav.signOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center justify-between px-1">
            <LocaleSwitch current={locale} />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
  disabled,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/40 cursor-not-allowed">
        <Icon className="size-4" />
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:bg-background hover:text-foreground"
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function ElderPicker({
  elders,
  currentId,
}: {
  elders: Elder[];
  currentId: string;
}) {
  const router = useRouter();
  const current = elders.find((e) => e.id === currentId);
  if (!current) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 hover:border-primary/40 transition-colors">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs font-semibold bg-accent text-accent-foreground">
              {current.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium truncate">{current.name}</p>
            <p className="text-xs text-muted-foreground">
              {elders.length > 1 ? `${elders.length} elders` : "Active elder"}
            </p>
          </div>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch elder</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {elders.map((e) => (
          <DropdownMenuItem
            key={e.id}
            onClick={() => router.push(`/app/elders/${e.id}`)}
            className="cursor-pointer"
          >
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px] font-semibold bg-accent text-accent-foreground">
                {e.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {e.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/onboarding" className="cursor-pointer">
            <Plus className="size-4" />
            Add elder
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
