"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { IProjectSummary } from "@/types/project.types";
import { NewProjectCard } from "./NewProjectCard";
import { ProjectCard } from "./ProjectCard";
import { ProjectSearch } from "./ProjectSearch";
import { StatusFilter, type StatusTab } from "./StatusFilter";

const countByStatus = (projects: IProjectSummary[]): Record<StatusTab, number> => ({
  ALL: projects.length,
  ACTIVE: projects.filter((p) => p.status === "ACTIVE").length,
  ON_HOLD: projects.filter((p) => p.status === "ON_HOLD").length,
  DONE: projects.filter((p) => p.status === "DONE").length,
});

// The filter bar and the card grid (board Dashboard). Filtering is local: a person has a
// handful of projects, so the whole list is already on the page.
export function ProjectBrowser({ projects }: { projects: IProjectSummary[] }) {
  const t = useTranslations("Dashboard");
  const [tab, setTab] = useState<StatusTab>("ALL");
  const [query, setQuery] = useState("");

  const needle = query.trim().toLocaleLowerCase();
  const shown = projects.filter((p) => (tab === "ALL" || p.status === tab) && (!needle || p.name.toLocaleLowerCase().includes(needle)));
  const unfiltered = tab === "ALL" && !needle;

  return (
    <>
      <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <StatusFilter value={tab} counts={countByStatus(projects)} onChange={setTab} />
        <ProjectSearch value={query} onChange={setQuery} />
      </div>

      {shown.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-line-strong p-12 text-center">
          <span className="text-[17px] font-semibold">{t("noResultsTitle")}</span>
          <span className="text-sm text-ink-3">{t("noResultsBody")}</span>
          <button
            type="button"
            onClick={() => {
              setTab("ALL");
              setQuery("");
            }}
            className="mt-2 h-11 cursor-pointer rounded-lg border border-line bg-white px-4.5 text-[15px] font-semibold text-ink"
          >
            {t("showAll")}
          </button>
        </div>
      )}

      <section aria-label={t("listLabel")} className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {unfiltered && <NewProjectCard />}
      </section>
    </>
  );
}
