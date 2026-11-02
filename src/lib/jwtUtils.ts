import jwt, { type JwtPayload } from "jsonwebtoken";

// Decode only, never verify. The frontend does not hold the backend's JWT secret, so a
// decoded payload is a routing hint (UX gate), not the security boundary: the API verifies
// every request. Never throws; callers branch on null.
// (Health-Care and travelar verify in proxy with JWT_ACCESS_SECRET instead. If you do that,
// the secret must equal the backend's, or every protected route silently bounces to login.)
const decodeToken = <TPayload extends JwtPayload = JwtPayload>(token: string): TPayload | null => {
  const payload = jwt.decode(token);
  return payload && typeof payload === "object" ? (payload as TPayload) : null;
};

export const jwtUtils = { decodeToken };
