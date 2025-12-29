import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";

/**
 * Formats a date for API submission, preserving the selected date regardless of timezone.
 *
 * Extracts the year, month, and day from the local date and creates a UTC date at midnight
 * to ensure the date sent to the API matches what the user selected.
 *
 * @param date - The date object selected by the user (in local timezone)
 * @returns ISO string of the date at midnight UTC, preserving the selected date
 *
 * @example
 * // User selects December 25, 2024 in GMT+1 timezone
 * // Input: 2024-12-25T00:00:00.000 (local)
 * // Output: "2024-12-25T00:00:00.000Z" (UTC, same date)
 */
export function formatDateForAPI(date: Date): string {
  // Extract year, month, and day from the local date
  // This preserves the date the user actually selected
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Create a UTC date at midnight using the local date's components
  // This ensures the date sent to the API matches what the user selected
  const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

  return utcDate.toISOString();
}

/**
 * Capitalizes the first letter of a string
 */
function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a date with day name, day number, and optionally month name.
 * Format: "Day, date Month" (e.g., "Wednesday, 24 December" / "Mercredi, 24 Décembre")
 *
 * @param date - The date to format
 * @param language - The language code ("en" or "fr")
 * @param includeMonth - Whether to include the month name (default: true)
 * @returns Formatted date string
 *
 * @example
 * // English: "Wednesday, 24 December"
 * // French: "Mercredi, 24 Décembre"
 */
export function formatDateWithDayName(
  date: Date,
  language: string = "en",
  includeMonth: boolean = true
): string {
  const locale = language === "fr" ? fr : enUS;

  if (includeMonth) {
    // Format: "Wednesday, 24 December" / "Mercredi, 24 Décembre"
    const dayName = format(date, "EEEE", { locale });
    const dayNumber = format(date, "d", { locale });
    const monthName = format(date, "MMMM", { locale });

    if (language === "fr") {
      // French format: "Mercredi, 24 Décembre"
      return `${capitalizeFirst(dayName)}, ${dayNumber} ${capitalizeFirst(
        monthName
      )}`;
    } else {
      // English format: "Wednesday, 24 December"
      return `${dayName}, ${dayNumber} ${monthName}`;
    }
  } else {
    // Format: "Wednesday, 24" / "Mercredi, 24"
    const dayName = format(date, "EEEE", { locale });
    const dayNumber = format(date, "d", { locale });

    if (language === "fr") {
      return `${capitalizeFirst(dayName)}, ${dayNumber}`;
    } else {
      return `${dayName}, ${dayNumber}`;
    }
  }
}

/**
 * Formats a month range for display with proper localization
 *
 * @param startDate - The start date
 * @param endDate - The end date (optional)
 * @param language - The language code ("en" or "fr")
 * @returns Formatted month range string
 *
 * @example
 * // Single month: "December 2025" / "Décembre 2025"
 * // Range: "December 2025 - January 2026" / "Décembre 2025 - Janvier 2026"
 */
export function formatMonthRange(
  startDate: Date,
  endDate?: Date,
  language: string = "en"
): string {
  const locale = language === "fr" ? fr : enUS;

  // Check if endDate exists and if it's in a different month/year
  if (!endDate) {
    const formatted = format(startDate, "MMMM yyyy", { locale });
    return capitalizeFirst(formatted);
  }

  // Check if both dates are in the same month and year
  const startMonth = startDate.getMonth();
  const startYear = startDate.getFullYear();
  const endMonth = endDate.getMonth();
  const endYear = endDate.getFullYear();

  if (startMonth === endMonth && startYear === endYear) {
    // Same month and year - show only once
    const formatted = format(startDate, "MMMM yyyy", { locale });
    return capitalizeFirst(formatted);
  }

  // Different months - show range
  const start = format(startDate, "MMMM yyyy", { locale });
  const end = format(endDate, "MMMM yyyy", { locale });
  return `${capitalizeFirst(start)} - ${capitalizeFirst(end)}`;
}
