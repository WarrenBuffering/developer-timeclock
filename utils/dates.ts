// Import dayjs library
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

/**
 * Converts a local ISO timestamp to a GMT ISO timestamp.
 *
 * @param {string} localISOTimestamp - The local ISO timestamp.
 * @returns {string | null} - The GMT ISO timestamp, or null if the provided date is invalid.
 */
export function convertLocalToGMT(localISOTimestamp: string): string {
  return dayjs(localISOTimestamp).utc().toISOString();
}

export function getCurrentDatetime(): string {
  return dayjs().utc().toISOString();
}
