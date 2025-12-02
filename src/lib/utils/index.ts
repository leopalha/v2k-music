export { cn } from "./cn";
export { exportTransactionsToPDF } from "./export-pdf";

/**
 * Format currency to BRL
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Format percentage with sign
 */
export function formatPercentage(value: number | null | undefined, showSign = true): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0,0%";
  }
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);

  if (showSign && value > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

/**
 * Format large numbers with abbreviation
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string | null | undefined, chars = 4): string {
  if (!address) {
    return "";
  }
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format date to localized string
 */
export function formatDate(date: Date | string, format: "short" | "long" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "long") {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
