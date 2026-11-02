export const USER_ROLES = ["ADMIN", "MANAGER", "STAFF"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

// What the backend signs into the access token.
export interface IAccessTokenPayload {
  sub: string;
  role: UserRole;
  exp: number;
  iat?: number;
}
