import type { FarmType, Ownership, ProjectKind } from "@/types/project.types";

// What a new project starts with, worked out from the choices on the new-project page. The page
// previews it and sends the same lists to the API, so the owner gets exactly what they saw.

export type PlanInput = {
  kind: ProjectKind;
  farmType: FarmType;
  ownership: Ownership;
  floors: number;
  batches: number;
  plots: number;
};

export type MenuKey = "partners" | "units" | "sales" | "customers" | "plots" | "buyers" | "farmSales" | "bizSales";
export type MenuNoteKey = "FARM" | "LAND" | "BUSINESS" | "buildingJoint" | "buildingPersonal" | "joint" | "personal";

// The worded lists, in the reader's language (ProjectTemplates in messages/*.json).
export type PlanCopy = {
  categories: Record<Exclude<ProjectKind, "FARM"> | FarmType, string[]>;
  buildingStart: string[];
  buildingEnd: string[];
  farmSetup: Record<FarmType, string>;
  fixedPhases: Record<"LAND" | "BUSINESS" | "RENOVATION", string[]>;
  floorName: (n: number) => string;
  // Crops run in seasons; every other farm in batches.
  cycleName: (farmType: FarmType, n: number) => string;
};

export type Plan = {
  categories: string[];
  phases: string[];
  menus: MenuKey[];
  menuNote: MenuNoteKey;
};

const range = (count: number) => Array.from({ length: count }, (_, i) => i + 1);

const phasesFor = ({ kind, farmType, floors, batches }: PlanInput, copy: PlanCopy): string[] => {
  switch (kind) {
    case "BUILDING":
      return floors ? [...copy.buildingStart, ...range(floors).map(copy.floorName), ...copy.buildingEnd] : [];
    case "FARM":
      return [copy.farmSetup[farmType], ...range(batches).map((n) => copy.cycleName(farmType, n))];
    case "LAND":
    case "BUSINESS":
    case "RENOVATION":
      return copy.fixedPhases[kind];
    default:
      return [];
  }
};

// Joint projects get the partner books; selling kinds get their sales menus.
export const menusFor = ({ kind, ownership }: Pick<PlanInput, "kind" | "ownership">): MenuKey[] => {
  const joint = ownership === "PARTNERSHIP";
  const menus: MenuKey[] = joint ? ["partners"] : [];
  if (kind === "BUILDING" && joint) menus.push("units", "sales", "customers");
  if (kind === "LAND") menus.push("plots", "sales", "buyers");
  if (kind === "FARM") menus.push("farmSales");
  if (kind === "BUSINESS") menus.push("bizSales");
  return menus;
};

const menuNoteFor = ({ kind, ownership }: PlanInput): MenuNoteKey => {
  const joint = ownership === "PARTNERSHIP";
  if (kind === "FARM" || kind === "LAND" || kind === "BUSINESS") return kind;
  if (kind === "BUILDING") return joint ? "buildingJoint" : "buildingPersonal";
  return joint ? "joint" : "personal";
};

export const buildPlan = (input: PlanInput, copy: PlanCopy): Plan => ({
  categories: input.kind === "FARM" ? copy.categories[input.farmType] : copy.categories[input.kind],
  phases: phasesFor(input, copy),
  menus: menusFor(input),
  menuNote: menuNoteFor(input),
});
