// Platform roles from the access token. Project roles (owner, manager, viewer) are per project.
export const USER_ROLES = ["user", "staff"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const STAFF_ROLES = ["super_admin", "support", "billing"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

// prokolpo-backend's UserView.
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  companyName: string | null;
  phone: string;
  email: string | null;
  locale: "bn" | "en";
  role: UserRole;
  staffRole: StaffRole | null;
  createdAt: string;
}

// What register, login and refresh return.
export interface ISession {
  user: IUser;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface ILoginPayload {
  identifier: string;
  password: string;
  remember: boolean;
}

export interface IRegisterPayload {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
}

export type RegistrationMode = "open" | "invite_only" | "closed";

// Step two of "forgot password": which ways this account can reset.
export interface IResetOptions {
  name: string;
  maskedEmail: string | null;
  canUseEmail: boolean;
  canUseOwnerCode: boolean;
}

// What the backend signs into the access token.
export interface IAccessTokenPayload {
  sub: string;
  role: UserRole;
  exp: number;
  iat?: number;
}

// Stable error codes the auth screens branch on.
export const AUTH_ERROR_CODES = {
  accountSuspended: "ACCOUNT_SUSPENDED",
  registrationClosed: "REGISTRATION_CLOSED",
  resetLinkInvalid: "RESET_LINK_INVALID",
  resetLinkExpired: "RESET_LINK_EXPIRED",
  resetLinkUsed: "RESET_LINK_USED",
  accountNotFound: "ACCOUNT_NOT_FOUND",
} as const;
