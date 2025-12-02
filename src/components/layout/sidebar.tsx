"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  PieChart,
  Heart,
  User,
  TrendingUp,
  Music,
  Trophy,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { UserAvatar, Logo } from "@/components/ui";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { label: "Discover", href: "/marketplace", icon: Search },
  { label: "Portfolio", href: "/portfolio", icon: PieChart },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Trending", href: "/trending", icon: TrendingUp },
];

const secondaryNavItems: NavItem[] = [
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "My Tracks", href: "/artist/dashboard", icon: Music },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/marketplace") {
      return pathname === "/marketplace" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "w-64 bg-bg-secondary border-r border-border-default flex flex-col h-screen sticky top-0",
        className
      )}
    >
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center">
          <Logo width={240} height={80} />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive(item.href)
                  ? "bg-primary-400 text-white shadow-lg shadow-primary-400/30"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-border-subtle" />

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {secondaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive(item.href)
                  ? "bg-primary-400 text-white shadow-lg shadow-primary-400/30"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border-subtle">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
            isActive("/profile")
              ? "bg-primary-400 text-white"
              : "hover:bg-bg-elevated"
          )}
        >
          <UserAvatar name="User" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              Minha Conta
            </p>
            <p className="text-xs text-text-tertiary truncate">Ver perfil</p>
          </div>
          <Settings className="w-4 h-4 text-text-tertiary" />
        </Link>
      </div>
    </aside>
  );
}
