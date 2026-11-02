// The registration form's strength meter (design board RegisterStates):
// 0 empty, 1 weak (fails the rule), 2 medium (8+ with letters and digits),
// 3 strong (also 12+ characters, a symbol, or mixed case).
export type PasswordStrength = 0 | 1 | 2 | 3;

export const passwordStrength = (password: string): PasswordStrength => {
  if (!password) return 0;
  const meetsRule = password.length >= 8 && /\p{L}/u.test(password) && /\p{N}/u.test(password);
  if (!meetsRule) return 1;
  const extra = password.length >= 12 || /[^\p{L}\p{N}]/u.test(password) || (/[a-z]/.test(password) && /[A-Z]/.test(password));
  return extra ? 3 : 2;
};
