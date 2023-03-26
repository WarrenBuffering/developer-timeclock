import dayjs from 'dayjs';

export function createNewTimeOnDate(datetime: string, newTime: string) {
  const prevDate = dayjs(datetime).format('YYYY-MM-DD');
  return dayjs(`${prevDate} ${newTime}`).format('YYYY-MM-DDThh:mm:ss');
}
