/**
 * Client-safe billing formatters. Fixed locale + timezone so output is
 * deterministic across server and client (no hydration mismatch).
 */

/** Format a minor-unit amount for a currency, e.g. (499, "USD") → "$4.99". */
export function formatMoney(amountMinor: number, currency: string): string {
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    });
    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(amountMinor / 10 ** digits);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }
}

/** Format an ISO date as e.g. "Jul 27, 2026". */
export function formatBillingDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
