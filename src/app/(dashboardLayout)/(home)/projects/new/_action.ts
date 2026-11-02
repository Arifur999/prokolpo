"use server";

import { redirect } from "next/navigation";
import { getMessages, getTranslations } from "next-intl/server";
import { projectHref } from "@/lib/routes";
import { runAction, toValidationError } from "@/lib/runAction";
import { createProject } from "@/services/project.services";
import type { ApiErrorResponse } from "@/types/api.types";
import { createProjectSchema } from "@/zod/project.validation";

// Resolves only on failure; a created project opens with a toast.
export const createProjectAction = async (values: unknown): Promise<ApiErrorResponse> => {
  const parsed = createProjectSchema((await getMessages()).NewProject.validation).safeParse(values);
  if (!parsed.success) return toValidationError(parsed.error);

  const result = await runAction((await getTranslations("NewProject"))("failed"), () => createProject(parsed.data));
  if (!result.success) return result;
  // Outside runAction: redirect() throws NEXT_REDIRECT, which its catch would swallow.
  redirect(`${projectHref(result.data.id)}?created`);
};
