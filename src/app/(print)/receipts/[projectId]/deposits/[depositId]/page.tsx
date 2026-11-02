import { isAxiosError } from "axios";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ReceiptView } from "@/components/modules/Receipts/ReceiptView";
import { formatDateTime } from "@/lib/dhakaTime";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { partnerReceiptDoc } from "@/lib/receiptDoc";
import { partnerReceiptHref, projectHref } from "@/lib/routes";
import { getPartnerReceipt } from "@/services/partners.services";
import { markPrintedAction } from "../_action";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Receipts"))("title") };
}

const loadReceipt = async (projectId: string, depositId: string) => {
  try {
    return (await getPartnerReceipt(projectId, depositId)).data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
};

// Board ReceiptPartner: a partner deposit's receipt, ready to print.
export default async function PartnerReceiptPage({ params }: PageProps<"/receipts/[projectId]/deposits/[depositId]">) {
  const { projectId, depositId } = await params;
  const [r, t] = await Promise.all([loadReceipt(projectId, depositId), getTranslations("Receipts")]);
  if (!r) notFound();

  const docs = { bn: partnerReceiptDoc(r, "bn"), en: partnerReceiptDoc(r, "en"), both: partnerReceiptDoc(r, "both") };
  const purposeOf = (callDate: string | null) => (callDate ? t("purposeCall", { date: dayFirst(callDate) }) : t("purposeMain"));

  return (
    <ReceiptView
      back={{ href: projectHref(projectId, `partners/${r.partnerId}`), label: t("backPartner") }}
      headSub={`${r.payer} · ${dayFirst(r.date.slice(0, 10))}`}
      docs={docs}
      info={{
        amount: `৳ ${formatAmount(r.amount)}`,
        purpose: purposeOf(r.callDate),
        method: r.account,
        receiver: r.takenBy,
        written: formatDateTime(new Date(r.writtenAt)),
        prints: r.prints,
      }}
      listTitle={t("listPartner", { name: r.payer })}
      list={r.others.map((o) => ({
        id: o.depositId,
        no: o.no,
        amount: `৳ ${formatAmount(o.amount)}`,
        sub: purposeOf(o.callDate),
        date: dayFirst(o.date.slice(0, 10)),
        href: partnerReceiptHref(projectId, o.depositId),
      }))}
      currentId={r.depositId}
      whatsapp={{ phone: r.payerPhone, text: t("whatsappText", { no: r.no, amount: formatAmount(r.amount), project: r.project }) }}
      start={{ paper: r.print.paper, lang: r.print.lang }}
      onPrinted={markPrintedAction.bind(null, projectId, depositId)}
    />
  );
}
