import { describe, expect, it } from "vitest";
import { projectNav } from "./projectNav";

const keys = (kind: Parameters<typeof projectNav>[0]["kind"], ownership: Parameters<typeof projectNav>[0]["ownership"]) =>
  projectNav({ kind, ownership }).map((group) => `${group.key}:${group.items.map((item) => item.key).join(",")}`);

describe("projectNav", () => {
  it("gives a joint building the partner and sales pages", () => {
    expect(keys("BUILDING", "PARTNERSHIP")).toEqual([
      "main:overview,expenses",
      "money:suppliers,contractors,accounts",
      "joint:partners,units,sales,customers",
      "other:reports,members,activity,settings",
    ]);
  });

  it("leaves a personal house with the books only", () => {
    expect(keys("BUILDING", "PERSONAL")).toHaveLength(3);
  });

  it("files a personal farm's sales under its own group", () => {
    expect(keys("FARM", "PERSONAL")[2]).toBe("sales:farmSales");
  });
});
