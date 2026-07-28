/**
 * Central configuration for the legal pages (Privacy, Terms, Refund, Cookies).
 *
 * Keeping the shared, launch-time values here means updating a date or contact
 * address touches one file instead of four. These are intentionally the only
 * "editable" facts in the otherwise static legal copy.
 */
export const LEGAL = {
  /** Human-readable last-updated date. A constant string keeps SSR/CSR output
   *  identical, so there is no hydration mismatch (unlike `new Date()`). */
  lastUpdated: "July 29, 2026",
  /** Legal entity / operating name shown throughout the policies. */
  company: "HireLens",
  /** Contact address for privacy, legal, and refund enquiries. */
  contactEmail: "agrimaprajapat@gmail.com",
  /** Postal contact address shown in the Contact sections. */
  address:
    "BKBIET Campus, CEERI Road, Pilani – 333031, Dist. Jhunjhunu, Rajasthan, India",
  /** Jurisdiction whose laws govern the Terms. */
  governingLaw: "India",
} as const;
