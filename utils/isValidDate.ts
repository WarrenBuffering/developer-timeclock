export function isValidDate(str: string): boolean {
  const date = new Date(str);
  return isNaN(date.getTime()) ? false : true;
}
