import type messages from "../../messages/bn.json";
import { normalizePhone } from "@/lib/phone";
import { z } from "@/lib/zod";
import { FARM_TYPES, LAND_UNITS, OWNERSHIPS, PROJECT_KINDS } from "@/types/project.types";

// Mirrors prokolpo-backend's project rules (internal/project/validate.go).
type ProjectValidationMessages = (typeof messages)["NewProject"]["validation"];

export const projectNameSchema = (m: ProjectValidationMessages) =>
  z.string().trim().min(1, { message: m.nameMissing, abort: true }).min(3, m.nameShort).max(80, m.nameLong);

export const projectLocationSchema = (m: ProjectValidationMessages) => z.string().trim().min(1, m.locationMissing).max(120);

// The manager's login (design v2, NewProject): a name, a Bangladesh mobile number and a
// password of six characters or more, which the owner hands over.
export const managerNameSchema = (m: ProjectValidationMessages) =>
  z.string().trim().min(1, { message: m.managerNameMissing, abort: true }).min(2, m.managerNameShort).max(50, m.managerNameLong);

export const managerPhoneSchema = (m: ProjectValidationMessages) =>
  z.string().transform((raw, ctx) => {
    const phone = normalizePhone(raw);
    if (phone) return phone;
    ctx.addIssue({ code: "custom", message: m.managerPhone });
    return z.NEVER;
  });

export const managerPasswordSchema = (m: ProjectValidationMessages) => z.string().min(6, m.managerPassword).max(128, m.managerPassword);

const managerSchema = (m: ProjectValidationMessages) =>
  z.object({
    name: managerNameSchema(m),
    phone: managerPhoneSchema(m),
    password: managerPasswordSchema(m),
    canAddStaff: z.boolean(),
  });

const count = (max: number) => z.number().int().min(0).max(max).nullable();
const listItems = (max: number) => z.array(z.string().trim().min(1).max(60)).max(max);

export const createProjectSchema = (m: ProjectValidationMessages) =>
  z.object({
    name: projectNameSchema(m),
    kind: z.enum(PROJECT_KINDS),
    ownership: z.enum(OWNERSHIPS),
    location: projectLocationSchema(m),
    description: z.string().trim().max(500),
    farmType: z.enum(FARM_TYPES).or(z.literal("")),
    floors: count(30),
    batches: count(20),
    plots: count(50),
    landArea: z.number().min(0).nullable(),
    landUnit: z.enum(LAND_UNITS).or(z.literal("")),
    businessType: z.string().trim().max(60),
    categories: listItems(40),
    phases: listItems(60),
    manager: managerSchema(m).nullable(),
  });
