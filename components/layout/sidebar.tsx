"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  GitBranch,
  GitPullRequest,
  MessageCircle,
  Settings,
  Zap,
  Heart,
  Lightbulb,
  Users,
  Cog,
  Workflow,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/repositories", label: "Repositories", icon: GitBranch },
  { href: "/ai-generator", label: "AI Generator", icon: Zap },
  { href: "/issues", label: "Issues", icon: MessageCircle },
  { href: "/pull-requests", label: "Pull Requests", icon: GitPullRequest },
];

const enterpriseItems = [
  { href: "/health", label: "Health Center", icon: Heart },
  { href: "/insights", label: "AI Insights", icon: Lightbulb },
  { href: "/contributors", label: "Contributors", icon: Users },
  { href: "/automation", label: "Automation", icon: Cog },
  { href: "/github-app", label: "GitHub App", icon: Workflow },
  { href: "/activity", label: "Activity", icon: Clock },
];

const settingsItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar pt-6 flex flex-col">
      {/* Logo */}
      <div className="px-6 pb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">MaintainerAI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Enterprise Section */}
        <div>
          <p className="text-xs font-semibold text-sidebar-foreground opacity-60 px-3 mb-2 uppercase">Enterprise</p>
          <div className="space-y-2">
            {enterpriseItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <div className="space-y-2">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground opacity-60">
          MaintainerAI v1.0
        </p>
      </div>
    </aside>
  );
}
