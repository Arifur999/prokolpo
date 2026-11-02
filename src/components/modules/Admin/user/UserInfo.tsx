import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/dhakaTime";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IAdminUserDetail } from "@/types/admin.types";

// "তথ্য" (board AdminUserDetail): the account's details, the missing email flagged.
export function UserInfo({ u }: { u: IAdminUserDetail }) {
  const t = useTranslations("AdminUser");
  const roles = useTranslations("AdminSecurity.roles");
  const items: { key: string; value: string; note?: string; warn?: boolean }[] = [
    { key: "name", value: `${u.firstName} ${u.lastName}` },
    { key: "company", value: u.company ?? t("none") },
    { key: "phone", value: displayPhone(u.phone) },
    { key: "email", value: u.email ?? t("noEmailGiven"), note: u.email ? undefined : t("noLinkNote"), warn: !u.email },
    { key: "lang", value: t(`langs.${u.locale}`) },
    { key: "joined", value: formatDate(new Date(u.createdAt)), note: u.invitedBy ? t("invitedBy", { name: u.invitedBy }) : t("selfJoined") },
    { key: "password", value: u.passwordChanged ? formatDate(new Date(u.passwordChanged)) : t("neverChanged") },
    { key: "role", value: u.staffRole ? roles(u.staffRole) : t("plainUser") },
  ];
  return (
    <section aria-labelledby="ud-info" className="flex flex-col rounded-2xl border border-line-2 bg-white">
      <div className="border-b border-line-3 px-5 py-3.5">
        <h2 id="ud-info" className="m-0 text-[17px] font-semibold">
          {t("info")}
        </h2>
      </div>
      <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-3.5 px-5 py-4 sm:grid-cols-2">
        {items.map((i) => (
          <div key={i.key} className="flex flex-col gap-px">
            <dt className="text-[13px] text-ink-3">{t(`fields.${i.key as "name"}`)}</dt>
            <dd className={cn("m-0 text-[15px] font-semibold", i.warn ? "text-gold-ink" : "text-ink")}>{i.value}</dd>
            {i.note && <span className={cn("text-xs", i.warn ? "text-gold-ink" : "text-ink")}>{i.note}</span>}
          </div>
        ))}
      </dl>
    </section>
  );
}
