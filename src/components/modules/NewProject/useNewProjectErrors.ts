"use client";

import { useMessages } from "next-intl";
import { useState } from "react";
import type { z } from "@/lib/zod";
import { managerNameSchema, managerPasswordSchema, managerPhoneSchema, projectLocationSchema, projectNameSchema } from "@/zod/project.validation";
import type { NewProjectValues } from "./newProjectValues";

export type CheckedField = "name" | "location" | "managerName" | "managerPhone" | "managerPassword";

// Where the API reports each field's error (errorSource path).
const SERVER_PATH: Record<CheckedField, string> = {
  name: "name",
  location: "location",
  managerName: "manager.name",
  managerPhone: "manager.phone",
  managerPassword: "manager.password",
};

const firstIssue = (schema: z.ZodType, value: string) => {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
};

// The design's rule (board NewProject): a field's error shows once it has been left (the name
// only with something typed) or after the first submit, and a server error stays until the
// field is edited. The manager's fields count only while "এখনই ম্যানেজার দিন" is chosen.
export function useNewProjectErrors(values: NewProjectValues) {
  const m = useMessages().NewProject.validation;
  const [touched, setTouched] = useState<ReadonlySet<CheckedField>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [server, setServer] = useState<Record<string, string>>({});

  const withManager = values.managerMode === "NOW";
  const issues: Record<CheckedField, string | undefined> = {
    name: firstIssue(projectNameSchema(m), values.name),
    location: firstIssue(projectLocationSchema(m), values.location),
    managerName: withManager ? firstIssue(managerNameSchema(m), values.managerName) : undefined,
    managerPhone: withManager ? firstIssue(managerPhoneSchema(m), values.managerPhone) : undefined,
    managerPassword: withManager ? firstIssue(managerPasswordSchema(m), values.managerPassword) : undefined,
  };

  const shown = (field: CheckedField) => submitted || (touched.has(field) && (field !== "name" || values.name !== ""));
  const errorOf = (field: CheckedField) => server[SERVER_PATH[field]] ?? (shown(field) ? issues[field] : undefined);

  return {
    errorOf,
    valid: Object.values(issues).every((issue) => issue === undefined),
    touch: (field: CheckedField) => setTouched((current) => new Set(current).add(field)),
    markSubmitted: () => setSubmitted(true),
    setServerErrors: (fieldErrors: Record<string, string> = {}) => setServer(fieldErrors),
    clearServerError: (field: CheckedField) =>
      setServer((current) => {
        const rest = { ...current };
        delete rest[SERVER_PATH[field]];
        return rest;
      }),
  };
}
