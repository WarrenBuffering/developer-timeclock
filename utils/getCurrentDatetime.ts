import dayjs from 'dayjs';

export function getCurrentDatetime(): string {
  return dayjs().toISOString();
}
