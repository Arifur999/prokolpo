// "আব্দুল করিম" -> "আক": the first letters of the first two words of the person's name, for
// the avatar. A name may sit all in the first name (the owner's single name field).
export const initials = (firstName: string, lastName = "") =>
  `${firstName} ${lastName}`
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("");
