"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  IconMenu2,
  IconFolder,
  IconClipboardList,
  IconUsers,
  IconSettings,
  IconLogout,
  IconShieldCheck,
  IconUser,
  IconLoader2,
} from "@tabler/icons-react";
import { SiSpacemacs } from "react-icons/si";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  {
    label: "Projects Dashboard",
    href: "/projects",
    icon: IconFolder,
    exactPrefix: "/projects",
  },
  {
    label: "My Task Queue",
    href: "/tasks",
    icon: IconClipboardList,
    exactPrefix: "/tasks",
  },
  {
    label: "Team Directory",
    href: "/team",
    icon: IconUsers,
    exactPrefix: "/team",
  },
  {
    label: "Workspace Settings",
    href: "/settings",
    icon: IconSettings,
    exactPrefix: "/settings",
  },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { data: user, isLoading: isUserLoading } = useUser();
  const logoutMutation = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-card">
      <div className="space-y-4 py-4">
        {/* Brand Emblem & Theme Toggle Bar */}
        <div className="px-5 py-2 flex items-center justify-between gap-2">
          <Link
            href="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 font-semibold tracking-tight text-xl text-foreground hover:opacity-90 transition-opacity"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <SiSpacemacs className="h-5 w-5" />
            </span>
            <span className="font-bold">TMS</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="px-5 -mt-2">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            Task Management System
          </p>
        </div>
        <Separator />

        {/* Expanded Navigation Sidebar */}
        <div className="px-3">
          <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation Menu
          </h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.exactPrefix}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Session & Logout Footer */}
      <div className="p-3">
        <Separator className="mb-3" />
        {isUserLoading ? (
          <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground">
            <IconLoader2 className="h-4 w-4 animate-spin shrink-0" />
            <span className="text-xs">Loading profile...</span>
          </div>
        ) : user ? (
          <div className="flex flex-col gap-2.5 rounded-lg bg-muted/40 p-3 border border-border/70 shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="h-8 w-8 border border-border shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-xs font-bold text-foreground">
                  {user.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <Badge
                variant="outline"
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider ${
                  user.role === "Admin"
                    ? "border-indigo-500/40 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                    : "border-slate-400/40 bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {user.role === "Admin" ? (
                  <IconShieldCheck className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <IconUser className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                )}
                <span>{user.role}</span>
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                title="Sign out of workspace"
                className="h-6 px-2 text-[11px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-1"
              >
                <IconLogout className="h-3.5 w-3.5" />
                <span>Exit</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            Session disconnected
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar (RTL logical boundary rules) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:inset-s-0 md:border-e md:border-border md:z-30 shadow-xs">
        {navContent}
      </aside>

      {/* Mobile Sticky Top Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-2.5 md:hidden shadow-xs">
        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger className="inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted h-8 w-8 transition-colors shadow-2xs focus-visible:outline-hidden">
              <IconMenu2 className="h-4 w-4 text-foreground" />
              <span className="sr-only">Open Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              {navContent}
            </SheetContent>
          </Sheet>
          <Link
            href="/projects"
            className="flex items-center gap-2 font-semibold tracking-tight text-base text-foreground"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
              <SiSpacemacs className="h-4 w-4" />
            </span>
            <span className="font-bold">TMS</span>
          </Link>
        </div>

        {/* Theme Toggle directly accessible in Mobile Header */}
        <ThemeToggle />
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 md:ms-64 min-h-screen flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
