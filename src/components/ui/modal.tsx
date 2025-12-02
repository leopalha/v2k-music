"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true,
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />

        <Dialog.Content
          className={cn(
            "fixed z-50 bg-bg-secondary border border-border-default rounded-2xl shadow-2xl",
            "w-full max-h-[90vh] overflow-auto",
            "animate-fade-in animate-scale-in",
            // Desktop: centered modal
            "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            // Size variants
            size === "sm" && "max-w-md",
            size === "md" && "max-w-lg",
            size === "lg" && "max-w-2xl",
            size === "full" && "max-w-4xl",
            // Mobile: nearly full width with margin
            "mx-4 lg:mx-0"
          )}
          onPointerDownOutside={(e) => {
            if (!closeOnOverlayClick) {
              e.preventDefault();
            }
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-subtle">
            <div>
              <Dialog.Title className="text-2xl font-display font-bold text-text-primary">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-text-secondary mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>

            {showCloseButton && (
              <Dialog.Close className="p-2 rounded-lg hover:bg-bg-elevated transition-colors">
                <X className="w-5 h-5 text-text-tertiary" />
              </Dialog.Close>
            )}
          </div>

          {/* Body */}
          <div className="p-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Compound components for flexible modal structure
export const ModalFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center justify-end gap-3 pt-6 mt-6 border-t border-border-subtle",
      className
    )}
  >
    {children}
  </div>
);
