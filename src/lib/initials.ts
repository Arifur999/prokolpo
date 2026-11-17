// "আব্দুল করিম" -> "আক": the first letters of the first two words of the person's name, for
// the avatar. A name may sit all in the first name (the owner's single name field).
const letters = new Intl.Segmenter("bn", { granularity: "grapheme" });

// "সোহেল রানা" -> "সো": the first letter of a name with its vowel sign, for a one-letter avatar.
export const firstLetter = (name: string) => letters.segment(name.trim())[Symbol.iterator]().next().value?.segment ?? "";

export const initials = (firstName: string, lastName = "") =>
  `${firstName} ${lastName}`
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("");
