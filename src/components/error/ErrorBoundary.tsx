"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-bg-secondary rounded-2xl p-8 border border-border-default">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-accent-red" />
              </div>

              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Algo deu errado
              </h2>

              <p className="text-text-secondary mb-6">
                Ocorreu um erro inesperado. Por favor, tente novamente.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="w-full mb-4 p-4 bg-bg-tertiary rounded-lg text-left">
                  <p className="text-xs font-mono text-accent-red overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/"}
                  className="flex-1"
                >
                  Ir para Home
                </Button>
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
