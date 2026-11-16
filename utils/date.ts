import {
  differenceInSeconds,
  format,
  formatDistanceToNowStrict,
  isValid,
  parseISO,
} from "date-fns";
import { enUS } from "date-fns/locale";
import type { FormatDistanceFn, FormatDistanceToken } from "date-fns/locale";

export type RelativeTimeInput = Date | string;

const unitByToken: Record<FormatDistanceToken, string> = {
  lessThanXSeconds: "s",
  xSeconds: "s",
  halfAMinute: "m",
  lessThanXMinutes: "m",
  xMinutes: "m",
  aboutXHours: "h",
  xHours: "h",
  xDays: "d",
  aboutXWeeks: "w",
  xWeeks: "w",
  aboutXMonths: "mo",
  xMonths: "mo",
  aboutXYears: "y",
  xYears: "y",
  overXYears: "y",
  almostXYears: "y",
};

const formatCompactDistance: FormatDistanceFn = (token, count, options) => {
  const distance = `${count}${unitByToken[token]}`;

  if (!options?.addSuffix) {
    return distance;
  }

  return options.comparison === 1 ? `in ${distance}` : `${distance} ago`;
};

const compactEnglishLocale = {
  ...enUS,
  formatDistance: formatCompactDistance,
};

/** Formats an ISO timestamp or Date as compact, relative English text. */
export const formatRelativeTime = (value: RelativeTimeInput): string => {
  const date = typeof value === "string" ? parseISO(value) : value;

  if (!isValid(date)) {
    return "";
  }

  if (Math.abs(differenceInSeconds(date, new Date())) < 60) {
    return "Just now";
  }

  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: compactEnglishLocale,
  });
};

/**
 * Formats an ISO timestamp or Date into 12-hour AM/PM time (e.g. "6:16 AM").
 * Preserves already-formatted time strings (e.g. "6:16 AM" or "9:12").
 */
export const formatMessageTime = (value?: RelativeTimeInput | null): string => {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{1,2}:\d{2}(\s?[AP]M)?$/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }
  }

  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) {
    return "";
  }

  return format(date, "h:mm a");
};

/**
 * Formats an ISO timestamp or Date into a calendar date label (e.g. "May 21, 2026").
 */
export const formatMessageDateHeader = (
  value?: RelativeTimeInput | null
): string => {
  if (!value) return "";

  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) {
    return "";
  }

  return format(date, "MMM d, yyyy");
};

/**
 * Returns a local calendar day key ("yyyy-MM-dd") for grouping messages by day.
 */
export const getDateGroupKey = (value?: RelativeTimeInput | null): string => {
  if (!value) return "";

  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) {
    return "";
  }

  return format(date, "yyyy-MM-dd");
};
