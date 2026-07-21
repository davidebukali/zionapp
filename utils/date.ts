import {
  differenceInSeconds,
  formatDistanceToNowStrict,
  isValid,
  parseISO,
} from "date-fns";
import { enUS } from "date-fns/locale";
import type { FormatDistanceFn, FormatDistanceToken } from "date-fns/locale";

type RelativeTimeInput = Date | string;

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
    return "just now";
  }

  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: compactEnglishLocale,
  });
};
