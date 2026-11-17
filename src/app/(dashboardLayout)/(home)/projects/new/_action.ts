"use server";

import { getMessages, getTranslations } from "next-intl/server";
import { runValidatedAction } from "@/lib/runAction";
import { createProject } from "@/services/project.services";
import { createProjectSchema } from "@/zod/project.validation";

// The form stays on screen after success: it shows the manager's login to hand over and a
// "go to project" button (board NewProject, done state).
export const createProjectAction = async (values: unknown) =>
  runValidatedAction(createProjectSchema((await getMessages()).NewProject.validation), values, (await getTranslations("NewProject"))("failed"), createProject);
