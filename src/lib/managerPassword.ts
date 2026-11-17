// The "নিজে থেকে বানান" button on the new-project form: eight characters from letters and
// digits that can't be mixed up when read aloud (no i, l, o, 0, 1), always with a digit.
const LETTERS = "abcdefghjkmnpqrstuvwxyz";
const DIGITS = "23456789";
const ALL = LETTERS + DIGITS;

const pick = (from: string, random: number) => from[random % from.length] ?? "";

export const generateManagerPassword = (randoms: Uint32Array = crypto.getRandomValues(new Uint32Array(9))): string => {
  const chars = Array.from(randoms.slice(0, 8), (r) => pick(ALL, r));
  if (!chars.some((c) => DIGITS.includes(c))) chars[(randoms[8] ?? 0) % chars.length] = pick(DIGITS, randoms[8] ?? 0);
  return chars.join("");
};
