import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
