"use server";

import { cache } from "react";
import { httpClient } from "@/lib/axios/httpClient";
import type { ICreateProjectPayload, IDeletedProject, IProject, IProjectSummary } from "@/types/project.types";

export const getProjects = async () => httpClient.get<IProjectSummary[]>("/projects");

export const getDeletedProjects = async () => httpClient.get<IDeletedProject[]>("/projects/deleted");

// The project layout and its page both need the project; cache() keeps it to one request.
export const getProject = cache(async (id: string) => httpClient.get<IProject>(`/projects/${encodeURIComponent(id)}`));

export const createProject = async (payload: ICreateProjectPayload) => httpClient.post<IProject>("/projects", payload);

export const deleteProject = async (id: string) => httpClient.delete<null>(`/projects/${encodeURIComponent(id)}`);

export const restoreProject = async (id: string) => httpClient.post<null>(`/projects/${encodeURIComponent(id)}/restore`);
