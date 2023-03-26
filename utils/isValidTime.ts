export function isValidTime(timeString: string): boolean {
  // check if string matches "hh:mm" format
  const timeRegex = /^([0-1][0-9]|[2][0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(timeString)) {
    return false;
  }

  // validate time using Date object
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(+hours);
  date.setMinutes(+minutes);

  return (
    date.getHours() === Number(hours) && date.getMinutes() === Number(minutes)
  );
}
