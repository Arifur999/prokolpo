"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";

// A signed-in page threw (most often the API is unreachable). Next 16.3+ passes `retry`,
// which re-renders and re-fetches. The server already logged the error under `digest`.
export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useTranslations("AppError");

  return (
    <div role="alert" className="m-4 flex flex-col items-center gap-3 rounded-2xl border border-line-2 bg-white px-6 py-14 text-center text-ink lg:m-10">
      <span className="flex size-14 items-center justify-center rounded-full bg-danger-tint text-danger">
        <Icon name="alertTriangle" size={26} strokeWidth={2} />
      </span>
      <h1 className="m-0 text-xl font-semibold">{t("title")}</h1>
      <p className="m-0 max-w-md text-[15px] text-ink-2">{t("body")}</p>
      {error.digest && <p className="m-0 font-mono text-xs text-ink-3">{t("reference", { digest: error.digest })}</p>}
      <button
        type="button"
        onClick={() => retry()}
        className="mt-2 flex h-11 cursor-pointer items-center gap-2 rounded-lg border-none bg-brand px-4.5 text-[15px] font-semibold text-white"
      >
        <Icon name="refresh" size={18} strokeWidth={2} />
        {t("retry")}
      </button>
    </div>
  );
}
