import type messages from "../../messages/bn.json";
import { z } from "@/lib/zod";
import { FARM_TYPES, LAND_UNITS, OWNERSHIPS, PROJECT_KINDS } from "@/types/project.types";

// Mirrors prokolpo-backend's project rules (internal/project/validate.go).
type ProjectValidationMessages = (typeof messages)["NewProject"]["validation"];

export const projectNameSchema = (m: ProjectValidationMessages) =>
  z.string().trim().min(1, { message: m.nameMissing, abort: true }).min(3, m.nameShort).max(80, m.nameLong);

const count = (max: number) => z.number().int().min(0).max(max).nullable();
const listItems = (max: number) => z.array(z.string().trim().min(1).max(60)).max(max);

export const createProjectSchema = (m: ProjectValidationMessages) =>
  z.object({
    name: projectNameSchema(m),
    kind: z.enum(PROJECT_KINDS),
    ownership: z.enum(OWNERSHIPS),
    location: z.string().trim().max(120),
    description: z.string().trim().max(500),
    startDate: z.iso.date(),
    budget: z.number().int().min(0).max(9_999_999_999_999).nullable(),
    farmType: z.enum(FARM_TYPES).or(z.literal("")),
    floors: count(30),
    batches: count(20),
    plots: count(50),
    landArea: z.number().min(0).nullable(),
    landUnit: z.enum(LAND_UNITS).or(z.literal("")),
    businessType: z.string().trim().max(60),
    categories: listItems(40),
    phases: listItems(60),
  });
