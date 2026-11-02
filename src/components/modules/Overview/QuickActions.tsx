import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import type { overviewFeatures } from "@/lib/overview";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Action = { key: "expense" | "payment" | "attendance" | "installment" | "sale" | "partnerDeposit"; icon: IconName; page: string };

type QuickActionsProps = {
  projectId: string;
  features: ReturnType<typeof overviewFeatures>;
  salesPage: string | null;
};

// "দ্রুত যোগ করুন": the everyday entries, one tap away. Add expense leads, in green.
export function QuickActions({ projectId, features, salesPage }: QuickActionsProps) {
  const t = useTranslations("Overview.quick");
  const actions: Action[] = [
    { key: "expense", icon: "plus", page: "expenses/new" },
    { key: "payment", icon: "banknote", page: "suppliers" },
    { key: "attendance", icon: "hardHat", page: "contractors" },
    ...(features.installments ? [{ key: "installment", icon: "calendarTick", page: "sales" } as const] : []),
    ...(features.produceSales && salesPage ? [{ key: "sale", icon: "coins", page: salesPage } as const] : []),
    ...(features.partners ? [{ key: "partnerDeposit", icon: "coins", page: "partners" } as const] : []),
  ];

  return (
    <section aria-label={t("label")} className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:gap-3 lg:overflow-visible lg:pb-0">
      {actions.map((action, index) => {
        const primary = index === 0;
        return (
          <Link
            key={action.key}
            href={projectHref(projectId, action.page)}
            className={cn(
              "flex h-11 shrink-0 items-center gap-1.5 rounded-full border pr-3.5 pl-2.5 text-sm font-semibold whitespace-nowrap no-underline",
              "lg:h-14 lg:gap-3 lg:rounded-[14px] lg:px-4 lg:text-[15px]",
              primary ? "border-brand bg-brand text-white hover:text-white" : "border-line bg-white text-ink hover:text-ink lg:border-line-2",
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center lg:size-8 lg:shrink-0 lg:rounded-[9px]",
                primary ? "lg:bg-white/14" : "text-brand lg:bg-brand-tint",
              )}
            >
              <Icon name={action.icon} size={18} strokeWidth={2} />
            </span>
            {t(action.key)}
          </Link>
        );
      })}
    </section>
  );
}
