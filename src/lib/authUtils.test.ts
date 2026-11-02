import { describe, expect, it } from "vitest";
import { canAccessRoute, DEFAULT_DASHBOARD, isProtected, safeRedirect } from "./authUtils";

describe("canAccessRoute", () => {
  it("keeps ordinary users out of the admin panel", () => {
    expect(canAccessRoute("/admin/users", "user")).toBe(false);
    expect(canAccessRoute("/admin/users", "staff")).toBe(true);
  });

  it("lets both roles into the app", () => {
    expect(canAccessRoute("/dashboard", "user")).toBe(true);
    expect(canAccessRoute("/projects/p1/expenses", "staff")).toBe(true);
  });

  it("does not treat /administrator as /admin", () => {
    expect(canAccessRoute("/administrator", "user")).toBe(true);
    expect(isProtected("/administrator")).toBe(false);
  });

  it("leaves public pages unprotected", () => {
    expect(isProtected("/")).toBe(false);
    expect(isProtected("/login")).toBe(false);
    expect(isProtected("/reset-password")).toBe(false);
  });
});

describe("safeRedirect", () => {
  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "/\t/evil.com", "/\n/evil.com", "/projects\\x", "/login"])("rejects %s", (target) => {
    expect(safeRedirect(target, "user")).toBe(DEFAULT_DASHBOARD.user);
  });

  it("rejects a path the role cannot open", () => {
    expect(safeRedirect("/admin/users", "user")).toBe(DEFAULT_DASHBOARD.user);
  });

  it("keeps an allowed path with its query string", () => {
    expect(safeRedirect("/projects/p1/expenses?page=2", "user")).toBe("/projects/p1/expenses?page=2");
  });
});
