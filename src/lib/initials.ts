// "আব্দুল করিম" -> "আক": the first letter of the first and last name, for the avatar.
export const initials = (firstName: string, lastName: string) => [firstName, lastName].map((part) => Array.from(part.trim())[0] ?? "").join("");
