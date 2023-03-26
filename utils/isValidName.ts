export function isValidName(name: string): boolean {
  return /^[A-Za-z\s]+$/.test(name);
}
