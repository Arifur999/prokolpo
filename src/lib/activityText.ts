import type { IActivityItem } from "@/types/members.types";
import { dayFirst } from "./expenseText";
import { formatAmount } from "./money";
import { displayPhone } from "./phone";

// The "Activity" messages, looked up by key: activityLine stays testable without next-intl.
export type Translate = (key: string, values?: Record<string, string | number>) => string;

export type ActivityLine = { area: string; text: string; sub: string };

const AREAS = new Set(["expense", "payment", "transfer", "supplier", "contractor", "extra", "attendance", "account", "category", "member", "invite", "password"]);

// "রড · 5 টন": a bill's head with the quantity bought.
const billTitle = (it: IActivityItem) => {
  const title = it.title ?? it.summary;
  return it.quantity ? `${title} · ${formatAmount(Number(it.quantity))}${it.unit ? ` ${it.unit}` : ""}` : title;
};

const joinParts = (parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(" · ");

// One entry of the activity page as a sentence after the person's name, with its area
// chip and the line under it (board Activity).
export function activityLine(it: IActivityItem, t: Translate): ActivityLine {
  const area = t(`area.${AREAS.has(it.entity) ? it.entity : "other"}`);
  const amount = formatAmount(it.amount ?? 0);
  const role = (key: string | undefined) => (key ? t(`role.${key}`) : "");
  const reason = it.reason ? t("sub.reason", { reason: it.reason }) : null;
  const line = (text: string, sub: (string | null | undefined | false)[] = []) => ({ area, text, sub: joinParts(sub) });

  switch (`${it.entity}.${it.action}`) {
    case "expense.CREATE":
      return line(t("text.expenseCreate", { title: billTitle(it), amount }), [t(it.paidNow ? "sub.cash" : "sub.credit"), it.party, it.phase]);
    case "expense.UPDATE":
      return line(t("text.expenseUpdate", { title: billTitle(it) }), [it.party, it.phase, reason]);
    case "expense.DELETE":
      return line(t("text.expenseDelete", { title: it.title ?? it.summary, amount }), [reason]);
    case "expense.RESTORE":
      return line(t("text.expenseRestore", { title: it.title ?? it.summary, amount }), [it.party]);
    case "payment.CREATE": {
      const purpose = it.purpose ? t(`purpose.${it.purpose}`) : null;
      const text = it.party
        ? t("text.paymentCreate", { party: it.party, amount, kind: t(it.purpose === "WAGE" ? "text.wage" : "text.payment") }).replace(/\s+/g, " ").trim()
        : t("text.paymentCreateNoParty", { amount });
      return line(text, [it.account && t("sub.fromAccount", { account: it.account }), purpose, it.note]);
    }
    case "payment.DELETE":
      return line(t("text.paymentDelete", { party: it.party ?? "—", amount }), [reason]);
    case "transfer.CREATE":
      return line(t("text.transferCreate", { from: it.account ?? "—", to: it.otherAccount ?? "—", amount }), [it.note]);
    case "supplier.CREATE":
    case "contractor.CREATE":
    case "account.CREATE":
    case "category.CREATE":
      return line(t(`text.${it.entity}Create`, { name: it.summary }));
    case "extra.CREATE":
      return line(t("text.extraCreate", { party: it.party ?? "—", title: it.title ?? it.summary, amount }));
    case "attendance.UPDATE":
      return line(t("text.attendanceUpdate", { party: it.party ?? "—" }), [t("sub.attendanceDays", { count: it.summary })]);
    case "member.CREATE":
      return it.details.joined
        ? line(t("text.memberJoined", { role: role(it.details.role) }), [it.details.phone && displayPhone(it.details.phone)])
        : line(t("text.memberCreate", { name: it.summary, role: role(it.details.role) }), [it.details.phone && displayPhone(it.details.phone)]);
    case "member.UPDATE":
      return line(t("text.memberUpdate", { name: it.summary, from: role(it.details.from), role: role(it.details.role) }));
    case "member.DELETE":
      return line(t("text.memberDelete", { name: it.summary }), [t("sub.entriesStay")]);
    case "invite.CREATE":
      return line(t("text.inviteCreate", { phone: displayPhone(it.summary), role: role(it.details.role) }), [t("sub.inviteWaits")]);
    case "invite.DELETE":
      return line(t("text.inviteDelete", { phone: displayPhone(it.summary) }));
    case "password.UPDATE":
      return line(t("text.passwordUpdate"), [t("sub.signedOut")]);
    default:
      return line(t("text.other", { name: it.summary }));
  }
}

const MONEY_FIELDS = new Set(["rate", "amount"]);

// One row of an edit's before/after table: the field in words, money as "৳ 94,000",
// dates day first, and "—" for a value that was empty.
export const changeRow = (change: IActivityItem["changes"][number], t: Translate) => {
  const show = (value: string) => {
    const v = value.trim();
    if (!v) return "—";
    if (MONEY_FIELDS.has(change.field) && /^\d+$/.test(v)) return `৳ ${formatAmount(Number(v))}`;
    if (change.field === "date") return dayFirst(v);
    if (change.field === "quantity") return v.replace(/^(\d+(?:\.\d+)?)/, (n) => formatAmount(Number(n)));
    return v;
  };
  const known = ["category", "quantity", "rate", "amount", "party", "phase", "date", "description"].includes(change.field);
  return { label: known ? t(`field.${change.field}`) : change.field, before: show(change.before), after: show(change.after) };
};

// The action that picks the round icon and its colours: a restore reads as an addition.
export const activityTone = (action: IActivityItem["action"]): Exclude<IActivityItem["action"], "RESTORE"> => (action === "RESTORE" ? "CREATE" : action);
