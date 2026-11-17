import { describe, expect, it } from "vitest";
import { activeIn, isGroup, projectNav, salesPageOf, type ProjectNav } from "./projectNav";

type Project = Parameters<typeof projectNav>[0];

const keys = (project: Project) => {
  const nav = projectNav(project);
  return [...nav.main.map((n) => n.key), "|", ...nav.more.map((n) => n.key)].join(",");
};

const at = (nav: ProjectNav, address: string) => {
  const [path = "", query = ""] = address.split("?");
  return activeIn(nav, path, new URLSearchParams(query));
};

describe("projectNav", () => {
  const jointBuilding = projectNav({ kind: "BUILDING", ownership: "PARTNERSHIP" });

  it("gives a joint building the board's full menu, in order", () => {
    // Loans and agreements stay out until their pages exist.
    expect(keys({ kind: "BUILDING", ownership: "PARTNERSHIP" })).toBe(
      "overview,balance,expense,shareholder,supplier,sales,customer,|,contractor,unit,report,member,activity,settings",
    );
  });

  it("gives a personal house the books only", () => {
    expect(keys({ kind: "BUILDING", ownership: "PERSONAL" })).toBe("overview,balance,expense,supplier,|,contractor,report,member,activity,settings");
  });

  it("gives farms and shops the reduced menu, sales and expenses as single links", () => {
    expect(keys({ kind: "FARM", ownership: "PERSONAL" })).toBe("overview,balance,supplier,sales,|,expense,contractor,report,member,activity,settings");
    const shop = projectNav({ kind: "BUSINESS", ownership: "PERSONAL" });
    const sales = shop.main.find((n) => n.key === "sales");
    expect(sales && !isGroup(sales) && sales.page).toBe("biz-sales");
  });

  it("calls a land project's units plots and its customers buyers", () => {
    const land = projectNav({ kind: "LAND", ownership: "PERSONAL" });
    expect(land.more.find((n) => n.key === "unit")?.label).toBe("plots");
    expect(land.main.find((n) => n.key === "customer")?.label).toBe("buyers");
  });

  it("lights the page, its tab, and the pages under it", () => {
    expect(at(jointBuilding, "")).toEqual({ node: "overview", sub: undefined });
    expect(at(jointBuilding, "expenses/new")).toEqual({ node: "expense", sub: "list" });
    expect(at(jointBuilding, "suppliers/abc")).toEqual({ node: "supplier", sub: "list" });
    expect(at(jointBuilding, "contractors/attendance")).toEqual({ node: "contractor", sub: "attendance" });
    expect(at(jointBuilding, "accounts?transfer=1")).toEqual({ node: "balance", sub: "transfer" });
    expect(at(jointBuilding, "accounts")).toEqual({ node: "balance", sub: "accounts" });
    expect(at(jointBuilding, "reports")).toEqual({ node: "report", sub: "overview" });
    expect(at(jointBuilding, "reports?r=PROFIT")).toEqual({ node: "report", sub: "profit" });
    expect(at(jointBuilding, "settings")).toEqual({ node: "settings", sub: "project" });
    expect(at(jointBuilding, "settings?tab=receipt")).toEqual({ node: "settings", sub: "receipt" });
    expect(at(jointBuilding, "units?add=1")).toEqual({ node: "unit", sub: "add" });
  });

  it("finds the page a project sells from", () => {
    expect(salesPageOf({ kind: "FARM", ownership: "PERSONAL" })).toBe("farm-sales");
    expect(salesPageOf({ kind: "BUILDING", ownership: "PARTNERSHIP" })).toBe("sales");
    expect(salesPageOf({ kind: "BUILDING", ownership: "PERSONAL" })).toBeNull();
  });
});
