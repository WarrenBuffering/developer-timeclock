export function isYesOrNo(str: string) {
  const lcStr = str.toLowerCase();
  return lcStr === 'y' || lcStr === 'n';
}
