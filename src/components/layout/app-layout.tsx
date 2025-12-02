"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { NavBar } from "./navbar";
import { BottomNav } from "./bottom-nav";
import { cn } from "@/lib/utils/cn";

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function AppLayout({
  children,
  showSidebar = true,
  className,
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bg-primary">
      {/* Desktop Sidebar */}
      {showSidebar && <Sidebar className="hidden lg:flex" />}

      {/* Mobile Sidebar Overlay */}
      {showSidebar && mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <Sidebar className="fixed inset-y-0 left-0 z-50 lg:hidden" />
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <NavBar
          showMenuButton={showSidebar}
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Page Content */}
        <div className={cn("flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8", className)}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav className="lg:hidden" />
    </div>
  );
}
