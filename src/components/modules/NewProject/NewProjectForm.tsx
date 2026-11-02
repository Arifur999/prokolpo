"use client";

import Link from "next/link";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createProjectAction } from "@/app/(dashboardLayout)/(home)/projects/new/_action";
import { Icon } from "@/components/shared/icon/Icon";
import type { Locale } from "@/i18n/config";
import { localDigits } from "@/lib/digits";
import { buildPlan } from "@/lib/projectPlan";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { projectNameSchema } from "@/zod/project.validation";
import { KindDetails } from "./KindDetails";
import { KindPicker } from "./KindPicker";
import { OwnershipPicker } from "./OwnershipPicker";
import { PlanPreview } from "./PlanPreview";
import { ProjectInfoFields } from "./ProjectInfoFields";
import { toPayload, type NewProjectValues } from "./newProjectValues";
import { usePlanCopy } from "./usePlanCopy";

// Board NewProject: the form on the left, a live preview of the starting books on the right.
// On success the action redirects into the new project.
export function NewProjectForm({ defaults }: { defaults: NewProjectValues }) {
  const t = useTranslations("NewProject");
  const locale = useLocale() as Locale;
  const nameSchema = projectNameSchema(useMessages().NewProject.validation);
  const [values, setValues] = useState(defaults);
  const [nameTouched, setNameTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverNameError, setServerNameError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const set = (patch: Partial<NewProjectValues>) => {
    if ("name" in patch) setServerNameError(undefined);
    setValues((current) => ({ ...current, ...patch }));
  };

  const plan = buildPlan(values, usePlanCopy());
  const plotNames = values.kind === "LAND" ? Array.from({ length: values.plots }, (_, i) => t("preview.plotName", { n: localDigits(i + 1, locale) })) : [];

  // The design's rule: an error shows after leaving the field (with something typed) or on submit.
  const nameCheck = nameSchema.safeParse(values.name);
  const showNameError = submitted || (nameTouched && values.name !== "");
  const nameError = serverNameError ?? (showNameError && !nameCheck.success ? nameCheck.error.issues[0]?.message : undefined);

  const submit = () => {
    setSubmitted(true);
    if (!nameCheck.success || isPending) return;
    startTransition(async () => {
      const result = await createProjectAction(toPayload(values, plan));
      setServerNameError(result.fieldErrors?.name);
      toast.error(result.message);
    });
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex flex-col rounded-2xl border border-line-2 bg-white"
      >
        <KindPicker value={values.kind} onChange={(kind) => set({ kind })} />
        <OwnershipPicker value={values.ownership} onChange={(ownership) => set({ ownership })} />
        <ProjectInfoFields values={values} set={set} nameError={nameError} onNameBlur={() => setNameTouched(true)} />
        <KindDetails values={values} set={set} />

        <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-line-2 bg-surface-3 px-5 py-5 sm:px-8">
          <Link
            href={ROUTES.dashboard}
            className="box-border flex h-12 items-center rounded-xl border border-line bg-white px-5 text-base font-semibold text-ink no-underline hover:text-ink"
          >
            {t("cancel")}
          </Link>
          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className={cn(
              "flex h-12 cursor-pointer items-center gap-2.5 rounded-xl border-none px-5.5 text-base font-semibold text-white",
              isPending ? "cursor-wait bg-brand-busy" : "bg-brand",
            )}
          >
            {isPending && <Icon name="spinner" size={20} strokeWidth={2.4} className="animate-spin" />}
            {t(isPending ? "submitting" : "submit")}
          </button>
        </div>
      </form>

      <PlanPreview values={values} plan={plan} plotNames={plotNames} />
    </div>
  );
}
