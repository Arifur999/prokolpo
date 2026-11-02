import "server-only";
import { isAxiosError } from "axios";
import { getProject } from "@/services/project.services";
import type { IProject } from "@/types/project.types";

// The project for this request, or null when the API says it is not the caller's (404).
// Anything else (API down) throws to error.tsx. getProject is cache()d, so the layout and
// the page share one request.
export const loadProject = async (id: string): Promise<IProject | null> => {
  try {
    return (await getProject(id)).data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
};
