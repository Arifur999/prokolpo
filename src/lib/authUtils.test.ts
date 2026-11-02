import { describe, expect, it } from "vitest";
import { canAccessRoute, DEFAULT_DASHBOARD, safeRedirect } from "./authUtils";

describe("canAccessRoute", () => {
  it("keeps staff out of settings but lets them into the dashboard", () => {
    expect(canAccessRoute("/dashboard/settings/team", "STAFF")).toBe(false);
    expect(canAccessRoute("/dashboard/products", "STAFF")).toBe(true);
  });

  it("does not treat /administrator as /admin", () => {
    expect(canAccessRoute("/administrator", "STAFF")).toBe(true);
  });
});

describe("safeRedirect", () => {
  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "/login"])("rejects %s", (target) => {
    expect(safeRedirect(target, "STAFF")).toBe(DEFAULT_DASHBOARD.STAFF);
  });

  it("rejects a path the role cannot open", () => {
    expect(safeRedirect("/admin/users", "MANAGER")).toBe(DEFAULT_DASHBOARD.MANAGER);
  });

  it("keeps an allowed path with its query string", () => {
    expect(safeRedirect("/dashboard/products?page=2", "STAFF")).toBe("/dashboard/products?page=2");
  });
});
