"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { addPartnerAction, lookupPartnerAction } from "@/app/(dashboardLayout)/projects/[projectId]/partners/_action";
import { DateField } from "@/components/shared/form/DateField";
import { TextInput } from "@/components/shared/form/TextInput";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { Segmented } from "@/components/shared/Segmented";
import { cleanQuantity } from "@/components/modules/Expenses/form/expenseValues";
import { useAmountWords } from "@/hooks/useAmountWords";
import { formatAmount, toLatinDigits } from "@/lib/money";
import { percentText, proportionalShares, toTenths } from "@/lib/partnerMath";
import { normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IPartner, IPartnerLookup } from "@/types/partners.types";
import { ShareChangeTable, type ShareMode } from "./ShareChangeTable";

type NewPartnerDialogProps = { projectId: string; projectName: string; partners: IPartner[]; today: string; onClose: () => void };

// "12.5" or "১২.৫" as a number; anything else is 0, which no share may be.
const asShare = (raw: string) => Number(cleanQuantity(raw)) || 0;

// "নতুন পার্টনার যোগ করুন" (board PartnerNew): who, their share and commitment, and every
// other partner's share after they come in — at the same rate or set by hand.
export function NewPartnerDialog({ projectId, projectName, partners, today, onClose }: NewPartnerDialogProps) {
  const t = useTranslations("Partners.new");
  const tp = useTranslations("Partners");
  const words = useAmountWords();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [share, setShare] = useState(partners.length ? "" : "100");
  const [committed, setCommitted] = useState("");
  const [joinedOn, setJoinedOn] = useState(today);
  const [mode, setMode] = useState<ShareMode>("PROP");
  const [manual, setManual] = useState<Record<string, string>>({});
  const [viewer, setViewer] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [found, setFound] = useState<{ phone: string; result: IPartnerLookup } | null>(null);
  const [isPending, startTransition] = useTransition();

  const normalized = normalizePhone(phone);
  useEffect(() => {
    if (!normalized) return;
    const timer = setTimeout(() => {
      void lookupPartnerAction(projectId, normalized).then((result) => {
        if (!result.success) return;
        setFound({ phone: normalized, result: result.data });
        if (result.data.name && result.data.status !== "PARTNER") setName((current) => current || result.data.name || "");
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [projectId, normalized]);

  const lookup = normalized && found?.phone === normalized ? found.result : null;
  const shareValue = asShare(share);
  const shareOk = shareValue > 0 && (partners.length ? shareValue < 100 : shareValue <= 100);
  const s = shareOk ? shareValue : 0;
  const next =
    mode === "PROP"
      ? proportionalShares(partners, s)
      : Object.fromEntries(partners.map((p) => [p.id, manual[p.id] === undefined ? p.share : asShare(manual[p.id] ?? "")]));
  const totalTenths = toTenths(s) + partners.reduce((sum, p) => sum + toTenths(next[p.id] ?? 0), 0);
  const amount = Number(committed || 0);
  const base = partners[0];
  const suggest = s && base?.share ? Math.round((s * base.committed) / base.share) : 0;

  const lookupLine = (() => {
    if (!phone.trim()) return submitted ? { text: t("lookupEmpty"), tone: "bad" } : null;
    if (!normalized) return phone.replace(/\D/g, "").length >= 11 ? { text: t("lookupBad"), tone: "bad" } : null;
    if (!lookup) return null;
    const who = lookup.name ?? "";
    if (lookup.status === "PARTNER") return { text: t("lookupPartner", { name: who }), tone: "bad" };
    if (lookup.status === "MEMBER") return { text: t("lookupMember", { name: who, role: lookup.role ? tp(`tag.${lookup.role}`) : "" }), tone: "good" };
    if (lookup.status === "ACCOUNT") return { text: t("lookupAccount", { name: who }), tone: "good" };
    return { text: t("lookupNone"), tone: "warn" };
  })();
  const nameError = submitted && name.trim().length < 2;
  const shareError = submitted && !shareOk;
  const totalError = totalTenths !== 1000 && (submitted || mode === "MANUAL");

  const save = () => {
    setSubmitted(true);
    if (!normalized || lookup?.status === "PARTNER" || name.trim().length < 2 || !shareOk || totalTenths !== 1000) return;
    startTransition(async () => {
      const result = await addPartnerAction(projectId, {
        phone: normalized,
        name: name.trim(),
        share: s,
        committed: amount,
        joinedOn,
        shares: Object.fromEntries(partners.map((p) => [p.id, next[p.id] ?? 0])),
        viewer: viewer && (lookup?.status === "ACCOUNT" || lookup?.status === "NONE"),
      });
      if (!result.success) return void toast.error(result.fieldErrors?.shares ?? result.fieldErrors?.phone ?? result.message);
      toast.success(t("done", { name: result.data.name, share: percentText(s) }));
      onClose();
      router.refresh();
    });
  };

  const tone = { bad: "text-danger", good: "text-success", warn: "text-gold-ink" };
  const field = "h-11 px-3 text-[15px]";

  return (
    <FormDialog
      title={t("title")}
      subtitle={t("subtitle", { project: projectName, count: partners.length })}
      closeLabel={t("close")}
      onClose={onClose}
      widthClass="max-w-225"
      topClass="top-12"
      footer={<DialogButtons cancel={t("cancel")} submit={t("submit")} onCancel={onClose} onSubmit={save} pending={isPending} />}
    >
      <div className="-mx-6 -my-5 grid grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3.5 border-line-3 px-5.5 py-4.5 md:border-r">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="np-phone" className="text-sm font-semibold">
              {t("phone")}
            </label>
            <TextInput
              id="np-phone"
              type="tel"
              inputMode="numeric"
              autoFocus
              placeholder="01XXX-XXXXXX"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              invalid={lookupLine?.tone === "bad"}
              className={field}
            />
            {lookupLine && (
              <span className={cn("flex items-start gap-1.5 text-[13px] leading-normal", tone[lookupLine.tone as keyof typeof tone])}>
                <span aria-hidden="true" className="mt-1.5 size-1.75 shrink-0 rounded-full bg-current" />
                {lookupLine.text}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="np-name" className="text-sm font-semibold">
              {t("name")}
            </label>
            <TextInput
              id="np-name"
              maxLength={60}
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              invalid={nameError}
              className={field}
            />
            {nameError && <span className="text-[13px] text-danger">{t("nameError")}</span>}
          </div>
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="np-share" className="text-sm font-semibold">
                {t("share")}
              </label>
              <TextInput
                id="np-share"
                inputMode="decimal"
                placeholder={t("sharePlaceholder")}
                value={share}
                onChange={(event) => setShare(event.target.value)}
                invalid={shareError}
                className={field}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="np-commit" className="text-sm font-semibold">
                {t("committed")}
              </label>
              <TextInput
                id="np-commit"
                inputMode="numeric"
                placeholder={t("committedPlaceholder")}
                value={committed ? formatAmount(amount) : ""}
                onChange={(event) => setCommitted(toLatinDigits(event.target.value).slice(0, 13))}
                className={field}
              />
            </div>
          </div>
          {shareError && <span className="-mt-2 text-[13px] text-danger">{t("shareError")}</span>}
          {(amount > 0 || (suggest > 0 && suggest !== amount)) && (
            <div className="-mt-1.5 flex flex-wrap items-center gap-2">
              {amount > 0 && (
                <span className="text-[13px] text-ink-2">
                  ৳ {formatAmount(amount)} — {words(amount)}
                </span>
              )}
              {suggest > 0 && suggest !== amount && (
                <button
                  type="button"
                  onClick={() => setCommitted(String(suggest))}
                  className="h-7.5 cursor-pointer rounded-full border border-dashed border-brand-line bg-brand-wash px-2.5 text-[13px] font-semibold text-brand"
                >
                  {t("suggest", { amount: formatAmount(suggest) })}
                </button>
              )}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="np-date" className="text-sm font-semibold">
              {t("date")}
            </label>
            <DateField id="np-date" value={joinedOn} onChange={setJoinedOn} />
          </div>
          {(lookup?.status === "ACCOUNT" || lookup?.status === "NONE") && (
            <label className="flex cursor-pointer items-start gap-2.5 rounded-[10px] bg-surface-2 px-3 py-2.5 text-[13px] leading-[1.55]">
              <input
                type="checkbox"
                checked={viewer}
                onChange={(event) => setViewer(event.target.checked)}
                className="m-0 mt-px size-4.5 shrink-0 accent-brand"
              />
              <span>{lookup.status === "ACCOUNT" ? t("viewerAccount") : t("viewerNone")}</span>
            </label>
          )}
        </div>
        <div className="flex flex-col gap-3 px-5.5 py-4.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[15px] font-semibold">{t("sharesTitle")}</span>
            {partners.length > 0 && (
              <Segmented
                label={t("modeLabel")}
                value={mode}
                onChange={(value) => {
                  setMode(value);
                  setManual(value === "MANUAL" ? Object.fromEntries(Object.entries(next).map(([id, v]) => [id, String(v)])) : {});
                }}
                options={[
                  { value: "PROP", label: t("modeProp") },
                  { value: "MANUAL", label: t("modeManual") },
                ]}
              />
            )}
          </div>
          <ShareChangeTable
            partners={partners}
            next={next}
            mode={mode}
            manual={manual}
            onManual={(id, value) => setManual((current) => ({ ...current, [id]: value }))}
            newcomer={name.trim()}
            newShare={s}
            totalTenths={totalTenths}
          />
          {totalError && <span className="text-[13px] text-danger">{t("totalError", { total: percentText(totalTenths / 10) })}</span>}
          <ul className="m-0 rounded-[10px] bg-gold-tint py-2.5 pr-3 pl-7 text-[13px] leading-[1.65] text-gold-deep">
            <li>{t("rule1")}</li>
            <li>{t("rule2")}</li>
            <li>{t("rule3")}</li>
          </ul>
        </div>
      </div>
    </FormDialog>
  );
}
