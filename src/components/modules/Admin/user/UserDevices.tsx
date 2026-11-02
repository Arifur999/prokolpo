import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { whenText } from "@/lib/dayLabel";
import type { IAdminUserDetail } from "@/types/admin.types";
import { deviceLabel } from "./deviceLabel";

const SHOWN = 5;

// "ডিভাইস ও লগইন" (board AdminUserDetail): where the account is signed in now.
export function UserDevices({ u, now }: { u: IAdminUserDetail; now: string }) {
  const t = useTranslations("AdminUser");
  const td = useTranslations("Admin.dashboard");
  const translate = (key: string, values?: Record<string, string>) => t(key as Parameters<typeof t>[0], values);
  return (
    <section aria-labelledby="ud-dev" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex items-center justify-between border-b border-line-3 px-5 py-3.5">
        <h2 id="ud-dev" className="m-0 text-[17px] font-semibold">
          {t("devices")}
        </h2>
        <span className="text-[13px] text-ink-3">{u.devices.length ? t("deviceCount", { count: u.devices.length }) : t("noDeviceCount")}</span>
      </div>
      {u.devices.slice(0, SHOWN).map((d, i) => {
        const label = deviceLabel(d.userAgent, translate);
        return (
          <div key={i} className="flex items-center gap-3.5 border-b border-line-3 px-5 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-surface-4 text-ink-2">
              <Icon name={label.kind === "phone" ? "smartphone" : "dashboard"} size={20} strokeWidth={2} />
            </span>
            <span className="flex flex-col">
              <span className="text-[15px] font-semibold">{label.name}</span>
              <span className="text-[13px] text-ink-3">{[d.ip, t("lastUsed", { when: whenText(d.lastUsed, now, td) })].filter(Boolean).join(" · ")}</span>
            </span>
          </div>
        );
      })}
      {u.devices.length > SHOWN && (
        <p className="m-0 border-b border-line-3 px-5 py-3 text-[13px] text-ink-3">{t("moreDevices", { count: u.devices.length - SHOWN })}</p>
      )}
      {u.devices.length === 0 && <p className="m-0 px-5 py-4 text-sm text-ink-3">{u.status === "suspended" ? t("noDevicesOff") : t("noDevices")}</p>}
    </section>
  );
}
