"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Input, UserAvatar } from "@/components/ui";
import { ConnectWallet } from "@/components/web3";
import { SearchDropdown } from "@/components/search";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useNotifications } from "@/hooks/useNotifications";

interface NavBarProps {
  className?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function NavBar({
  className,
  onMenuClick,
  showMenuButton = false,
}: NavBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Real notifications data
  const { unreadCount } = useNotifications();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle",
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        {/* Left side - Menu button (mobile) + Search */}
        <div className="flex items-center gap-4 flex-1">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-bg-elevated transition-colors"
            >
              <Menu className="w-5 h-5 text-text-secondary" />
            </button>
          )}

          {/* Desktop Search */}
          <div className="hidden md:block w-full max-w-md relative">
            <Input
              placeholder="Buscar músicas, artistas..."
              value={searchQuery}
              onChange={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              icon={<Search className="w-4 h-4" />}
              iconPosition="left"
              className="bg-bg-elevated border-transparent focus:border-primary-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchFocused(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-bg-secondary rounded-full transition-colors"
                aria-label="Limpar busca"
              >
                <XCircle className="w-4 h-4 text-text-tertiary hover:text-text-primary" />
              </button>
            )}
            <SearchDropdown
              query={searchQuery}
              isOpen={isSearchFocused}
              onClose={() => setIsSearchFocused(false)}
            />
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            {showMobileSearch ? (
              <X className="w-5 h-5 text-text-secondary" />
            ) : (
              <Search className="w-5 h-5 text-text-secondary" />
            )}
          </button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Wallet */}
          <div className="hidden sm:block">
            <ConnectWallet />
          </div>

          {/* Notifications */}
          <NotificationBell unreadCount={unreadCount} />

          {/* User Avatar (mobile only - desktop shows in sidebar) */}
          <Link
            href="/profile"
            className="lg:hidden p-1 rounded-full hover:ring-2 hover:ring-primary-400/50 transition-all"
            data-testid="user-menu"
          >
            <UserAvatar name="User" size="sm" />
          </Link>
        </div>
      </div>

      {/* Mobile Search Expanded */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-4 relative">
          <div className="relative">
            <Input
              placeholder="Buscar músicas, artistas..."
              value={searchQuery}
              onChange={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              icon={<Search className="w-4 h-4" />}
              iconPosition="left"
              className="bg-bg-elevated border-transparent focus:border-primary-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchFocused(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-bg-secondary rounded-full transition-colors"
                aria-label="Limpar busca"
              >
                <XCircle className="w-4 h-4 text-text-tertiary hover:text-text-primary" />
              </button>
            )}
          </div>
          <SearchDropdown
            query={searchQuery}
            isOpen={isSearchFocused}
            onClose={() => setIsSearchFocused(false)}
          />
        </div>
      )}
    </header>
  );
}
