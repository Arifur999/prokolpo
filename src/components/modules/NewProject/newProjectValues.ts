import { toDecimalDigits } from "@/lib/money";
import type { Plan } from "@/lib/projectPlan";
import type { FarmType, ICreateProjectPayload, LandUnit, Ownership, ProjectKind } from "@/types/project.types";

// NOW: the owner opens the manager's login with the project. LATER: they run it alone for now.
export type ManagerMode = "NOW" | "LATER";

// What the new-project form holds. Every kind's details stay in state while the person
// switches kinds; toPayload sends only the chosen kind's.
export type NewProjectValues = {
  kind: ProjectKind;
  ownership: Ownership;
  farmType: FarmType;
  name: string;
  location: string;
  description: string;
  floors: number;
  batches: number;
  plots: number;
  landArea: string;
  landUnit: LandUnit;
  businessType: string;
  managerMode: ManagerMode;
  managerName: string;
  managerPhone: string;
  managerPassword: string;
  managerCanAddStaff: boolean;
};

export const newProjectDefaults = (ownership: Ownership): NewProjectValues => ({
  kind: "BUILDING",
  ownership,
  farmType: "POULTRY",
  name: "",
  location: "",
  description: "",
  floors: 0,
  batches: 0,
  plots: 0,
  landArea: "",
  landUnit: "KATHA",
  businessType: "",
  managerMode: "NOW",
  managerName: "",
  managerPhone: "",
  managerPassword: "",
  managerCanAddStaff: true,
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
    farmType: kind === "FARM" ? values.farmType : "",
    floors: onlyFor(kind === "BUILDING" && values.floors > 0, values.floors),
    batches: onlyFor(kind === "FARM", values.batches),
    plots: onlyFor(kind === "LAND", values.plots),
    landArea: onlyFor(kind === "LAND" && Number.isFinite(area), area),
    landUnit: kind === "LAND" ? values.landUnit : "",
    businessType: kind === "BUSINESS" ? values.businessType.trim() : "",
    categories: plan.categories,
    phases: plan.phases,
    manager:
      values.managerMode === "NOW"
        ? { name: values.managerName.trim(), phone: values.managerPhone, password: values.managerPassword, canAddStaff: values.managerCanAddStaff }
        : null,
  };
};
