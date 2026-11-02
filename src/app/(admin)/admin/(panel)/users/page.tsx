import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/modules/Admin/AdminPageHeader";
import { UsersTable } from "@/components/modules/Admin/users/UsersTable";
import { UsersToolbar } from "@/components/modules/Admin/users/UsersToolbar";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount } from "@/lib/money";
import { getAdminUsers } from "@/services/admin.services";
import type { UserFilterKind } from "@/types/admin.types";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("AdminUsers"))("title") };
}

const KINDS: UserFilterKind[] = ["ALL", "NEW", "NOEMAIL", "SUSPENDED", "STAFF"];

// Board AdminUsers. Chip, search and page live in the address.
export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const query = await searchParams;
  const filter = KINDS.find((k) => k === query.filter) ?? "ALL";
  const q = typeof query.q === "string" ? query.q : "";
  const page = Math.max(1, Number(query.page) || 1);
  const [t, list] = await Promise.all([getTranslations("AdminUsers"), getAdminUsers({ filter, q, page })]);
  const p = list.data;
  const now = new Date().toISOString();
  const pageHref = (n: number) => `/admin/users?${new URLSearchParams({ ...(filter !== "ALL" ? { filter } : {}), ...(q ? { q } : {}), page: String(n) })}`;
  const footer = q
    ? t("footSearch", { total: formatAmount(p.total) })
    : filter === "ALL"
      ? t("footAll", { total: formatAmount(p.total) })
      : t("footFilter", { label: t(`filters.${filter}`), total: formatAmount(p.total) });
  const pager = "flex size-9 items-center justify-center rounded-[9px] border bg-white";

  return (
    <>
      <AdminPageHeader
        title={t("title")}
        subtitle={t("sub")}
        actions={
          <span className="text-sm text-ink-2">
            {t("makeStaff")}{" "}
            <Link href="/admin/settings" className="font-semibold">
              {t("teamLink")}
            </Link>
          </span>
        }
      />
      <section aria-label={t("listLabel")} className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <UsersToolbar key={`${filter}-${q}`} filter={filter} query={q} counts={p.counts} />
        <UsersTable rows={p.rows} now={now} />
        {p.rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="text-base font-semibold">{t("emptyTitle")}</span>
            <span className="text-sm text-ink-3">{t("emptySub")}</span>
            <Link
              href="/admin/users"
              className="mt-1.5 flex h-10 items-center rounded-[10px] border border-line bg-white px-4 text-sm font-semibold text-ink no-underline"
            >
              {t("clear")}
            </Link>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-3 px-5 py-3 text-sm text-ink-2">
          <span>{footer}</span>
          <span className="flex items-center gap-2">
            {p.page > 1 ? (
              <Link href={pageHref(p.page - 1)} aria-label={t("prev")} className={`${pager} border-line text-ink`}>
                <Icon name="chevronLeft" size={18} strokeWidth={2} />
              </Link>
            ) : (
              <span aria-hidden="true" className={`${pager} border-line-2 text-ink-disabled`}>
                <Icon name="chevronLeft" size={18} strokeWidth={2} />
              </span>
            )}
            <span>{t("page", { page: p.page, pages: p.pages })}</span>
            {p.page < p.pages ? (
              <Link href={pageHref(p.page + 1)} aria-label={t("next")} className={`${pager} border-line text-ink`}>
                <Icon name="chevronRight" size={18} strokeWidth={2} />
              </Link>
            ) : (
              <span aria-hidden="true" className={`${pager} border-line-2 text-ink-disabled`}>
                <Icon name="chevronRight" size={18} strokeWidth={2} />
              </span>
            )}
          </span>
        </div>
      </section>
    </>
  );
}
