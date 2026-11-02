import { describe, expect, it } from "vitest";
import { ordinal } from "./digits";
import { buildPlan, type PlanCopy, type PlanInput } from "./projectPlan";

const copy: PlanCopy = {
  categories: {
    BUILDING: ["রড"],
    LAND: ["জমির দাম"],
    BUSINESS: ["মাল কেনা"],
    RENOVATION: ["রং"],
    OTHER: ["মজুরি"],
    POULTRY: ["খাবার"],
    CATTLE: ["পশু"],
    FISH: ["পোনা"],
    CROP: ["বীজ"],
  },
  buildingStart: ["জমি ও নকশা", "পাইলিং", "ফাউন্ডেশন"],
  buildingEnd: ["ছাদ", "ফিনিশিং"],
  farmSetup: { POULTRY: "শেড তৈরি", CATTLE: "শেড তৈরি", FISH: "পুকুর তৈরি", CROP: "জমি তৈরি" },
  fixedPhases: { LAND: ["প্লট বিক্রি"], BUSINESS: ["চালু"], RENOVATION: ["ফিনিশিং"] },
  floorName: (n) => `${ordinal(n, "bn")} তলা`,
  cycleName: (farmType, n) => `${ordinal(n, "bn")} ${farmType === "CROP" ? "মৌসুম" : "ব্যাচ"}`,
};

const input = (overrides: Partial<PlanInput>): PlanInput => ({
  kind: "BUILDING",
  farmType: "POULTRY",
  ownership: "PERSONAL",
  floors: 0,
  batches: 0,
  plots: 0,
  ...overrides,
});

describe("buildPlan", () => {
  it("gives a building a phase per floor between the groundwork and the roof", () => {
    const plan = buildPlan(input({ floors: 2, ownership: "PARTNERSHIP" }), copy);
    expect(plan.phases).toEqual(["জমি ও নকশা", "পাইলিং", "ফাউন্ডেশন", "১ম তলা", "২য় তলা", "ছাদ", "ফিনিশিং"]);
    expect(plan.menus).toEqual(["partners", "units", "sales", "customers"]);
    expect(plan.menuNote).toBe("buildingJoint");
  });

  it("leaves a building without floors to add phases later", () => {
    expect(buildPlan(input({}), copy).phases).toEqual([]);
  });

  it("uses the farm type's heads and counts seasons for crops", () => {
    const plan = buildPlan(input({ kind: "FARM", farmType: "CROP", batches: 2 }), copy);
    expect(plan.categories).toEqual(["বীজ"]);
    expect(plan.phases).toEqual(["জমি তৈরি", "১ম মৌসুম", "২য় মৌসুম"]);
    expect(plan.menus).toEqual(["farmSales"]);
  });

  it("gives a personal 'other' project no extra menus", () => {
    const plan = buildPlan(input({ kind: "OTHER" }), copy);
    expect(plan).toMatchObject({ phases: [], menus: [], menuNote: "personal" });
  });
});

describe("ordinal", () => {
  it("writes Bangla and English ordinals", () => {
    expect([1, 4, 6, 11].map((n) => ordinal(n, "bn"))).toEqual(["১ম", "৪র্থ", "৬ষ্ঠ", "১১তম"]);
    expect([1, 2, 3, 11, 22].map((n) => ordinal(n, "en"))).toEqual(["1st", "2nd", "3rd", "11th", "22nd"]);
  });
});
