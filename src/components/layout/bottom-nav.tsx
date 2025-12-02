"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, PieChart, Heart, User, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Discover", href: "/marketplace", icon: Search },
  { label: "Trending", href: "/trending", icon: TrendingUp },
  { label: "Portfolio", href: "/portfolio", icon: PieChart },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Profile", href: "/profile", icon: User },
];

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/marketplace") {
      return pathname === "/marketplace" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary/95 backdrop-blur-xl border-t border-border-default safe-area-pb",
        className
      )}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-4 py-2 min-w-[64px]"
          >
            <item.icon
              className={cn(
                "w-6 h-6 transition-colors",
                isActive(item.href) ? "text-primary-400" : "text-text-tertiary"
              )}
            />
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                isActive(item.href) ? "text-primary-400" : "text-text-tertiary"
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
