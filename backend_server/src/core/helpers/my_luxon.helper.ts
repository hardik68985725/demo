import { DateTime } from "luxon";

export const myUTC = (date?: Date | string) => {
  if (!date) {
    return DateTime.utc();
  }

  if (date instanceof Date) {
    return DateTime.fromJSDate(date).toUTC();
  }

  return DateTime.fromISO(date).toUTC();
};
