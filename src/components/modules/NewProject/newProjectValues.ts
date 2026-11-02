import { toDecimalDigits, toLatinDigits } from "@/lib/money";
import type { Plan } from "@/lib/projectPlan";
import type { FarmType, ICreateProjectPayload, LandUnit, Ownership, ProjectKind } from "@/types/project.types";

// What the new-project form holds. Every kind's details stay in state while the person
// switches kinds; toPayload sends only the chosen kind's.
export type NewProjectValues = {
  kind: ProjectKind;
  ownership: Ownership;
  farmType: FarmType;
  name: string;
  location: string;
  description: string;
  startDate: string;
  budget: string;
  floors: number;
  batches: number;
  plots: number;
  landArea: string;
  landUnit: LandUnit;
  businessType: string;
};

export const newProjectDefaults = (ownership: Ownership, today: string): NewProjectValues => ({
  kind: "BUILDING",
  ownership,
  farmType: "POULTRY",
  name: "",
  location: "",
  description: "",
  startDate: today,
  budget: "",
  floors: 0,
  batches: 0,
  plots: 0,
  landArea: "",
  landUnit: "KATHA",
  businessType: "",
});

const onlyFor = <T>(applies: boolean, value: T) => (applies ? value : null);

export const toPayload = (values: NewProjectValues, plan: Plan): ICreateProjectPayload => {
  const { kind } = values;
  const area = Number.parseFloat(toDecimalDigits(values.landArea.replaceAll(",", "")));
  return {
    name: values.name.trim(),
    kind,
    ownership: values.ownership,
    location: values.location.trim(),
    description: values.description.trim(),
    startDate: values.startDate,
    budget: values.budget ? Number(toLatinDigits(values.budget)) : null,
    farmType: kind === "FARM" ? values.farmType : "",
    floors: onlyFor(kind === "BUILDING" && values.floors > 0, values.floors),
    batches: onlyFor(kind === "FARM", values.batches),
    plots: onlyFor(kind === "LAND", values.plots),
    landArea: onlyFor(kind === "LAND" && Number.isFinite(area), area),
    landUnit: kind === "LAND" ? values.landUnit : "",
    businessType: kind === "BUSINESS" ? values.businessType.trim() : "",
    categories: plan.categories,
    phases: plan.phases,
  };
};
