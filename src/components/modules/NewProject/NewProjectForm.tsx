"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createProjectAction } from "@/app/(dashboardLayout)/(home)/projects/new/_action";
import { Icon } from "@/components/shared/icon/Icon";
import type { Locale } from "@/i18n/config";
import { localDigits } from "@/lib/digits";
import { normalizePhone } from "@/lib/phone";
import { buildPlan } from "@/lib/projectPlan";
import { projectHref, ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { KindDetails } from "./KindDetails";
import { KindPicker } from "./KindPicker";
import { ManagerFields } from "./ManagerFields";
import { OwnershipPicker } from "./OwnershipPicker";
import { PlanPreview } from "./PlanPreview";
import { ProjectInfoFields } from "./ProjectInfoFields";
import { toPayload, type NewProjectValues } from "./newProjectValues";
import { usePlanCopy } from "./usePlanCopy";
import { useNewProjectErrors, type CheckedField } from "./useNewProjectErrors";

type Created = { id: string; manager: { phone: string; password: string } | null };

// Which checked field an edit touches, so its server error clears.
const EDITED: Partial<Record<keyof NewProjectValues, CheckedField>> = {
  name: "name",
  location: "location",
  managerName: "managerName",
  managerPhone: "managerPhone",
  managerPassword: "managerPassword",
};

// Board NewProject: the form on the left, a live preview of the starting books on the right.
// After saving it stays put to show the manager's login, with a button into the project.
export function NewProjectForm({ defaults }: { defaults: NewProjectValues }) {
  const t = useTranslations("NewProject");
  const locale = useLocale() as Locale;
  const [values, setValues] = useState(defaults);
  const [created, setCreated] = useState<Created | null>(null);
  const [isPending, startTransition] = useTransition();
  const errors = useNewProjectErrors(values);

  const set = (patch: Partial<NewProjectValues>) => {
    for (const key of Object.keys(patch) as (keyof NewProjectValues)[]) {
      const field = EDITED[key];
      if (field) errors.clearServerError(field);
    }
    setValues((current) => ({ ...current, ...patch }));
  };

  const plan = buildPlan(values, usePlanCopy());
  const plotNames = values.kind === "LAND" ? Array.from({ length: values.plots }, (_, i) => t("preview.plotName", { n: localDigits(i + 1, locale) })) : [];

  const submit = () => {
    errors.markSubmitted();
    if (!errors.valid || isPending || created) return;
    const payload = toPayload(values, plan);
    startTransition(async () => {
      const result = await createProjectAction(payload);
      if (!result.success) {
        errors.setServerErrors(result.fieldErrors);
        toast.error(result.message);
        return;
      }
      const manager = payload.manager ? { phone: normalizePhone(payload.manager.phone) ?? payload.manager.phone, password: payload.manager.password } : null;
      setCreated({ id: result.data.id, manager });
      toast.success(t(manager ? "createdWithManager" : "created", { name: payload.name }));
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
        <ProjectInfoFields values={values} set={set} errorOf={errors.errorOf} touch={errors.touch} />
        <ManagerFields values={values} set={set} errorOf={errors.errorOf} touch={errors.touch} created={created?.manager ?? null} />
        <KindDetails values={values} set={set} />

        <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-line-2 bg-surface-3 px-5 py-5 sm:px-8">
          {created ? (
            <Link
              href={projectHref(created.id)}
              className="box-border flex h-12 items-center gap-2 rounded-xl bg-brand px-5.5 text-base font-semibold text-white no-underline hover:bg-brand-deep hover:text-white"
            >
              {t("goToProject")}
              <Icon name="arrowRight" size={18} strokeWidth={2} />
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </form>

      <PlanPreview values={values} plan={plan} plotNames={plotNames} />
    </div>
  );
}
