import { isAxiosError } from "axios";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ReceiptView } from "@/components/modules/Receipts/ReceiptView";
import { formatDateTime } from "@/lib/dhakaTime";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { saleReceiptDoc } from "@/lib/receiptDoc";
import { projectHref, saleReceiptHref } from "@/lib/routes";
import { getSaleReceipt } from "@/services/sales.services";
import { markPaymentPrintedAction } from "../_action";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Receipts"))("title") };
}

const loadReceipt = async (projectId: string, paymentId: string) => {
  try {
    return (await getSaleReceipt(projectId, paymentId)).data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
};

// Boards Receipt and ReceiptEn: a sale payment's receipt, ready to print.
export default async function SaleReceiptPage({ params }: PageProps<"/receipts/[projectId]/payments/[paymentId]">) {
  const { projectId, paymentId } = await params;
  const [r, t] = await Promise.all([loadReceipt(projectId, paymentId), getTranslations("Receipts")]);
  if (!r) notFound();

  const docs = { bn: saleReceiptDoc(r, "bn"), en: saleReceiptDoc(r, "en"), both: saleReceiptDoc(r, "both") };
  const purposeOf = (kind: "DOWN" | "INSTALLMENT") => (kind === "DOWN" ? t("purposeDown") : t("purposeInstallment"));

  return (
    <ReceiptView
      back={{ href: projectHref(projectId, `sales/${r.saleId}`), label: t("backSale") }}
      headSub={`${r.payer} · ${dayFirst(r.date.slice(0, 10))}`}
      docs={docs}
      info={{
        amount: `৳ ${formatAmount(r.amount)}`,
        purpose: docs.bn.purpose,
        method: r.account,
        receiver: r.takenBy,
        written: formatDateTime(new Date(r.writtenAt)),
        prints: r.prints,
      }}
      listTitle={t("listSale")}
      list={r.others.map((o) => ({
        id: o.paymentId,
        no: o.no,
        amount: `৳ ${formatAmount(o.amount)}`,
        sub: purposeOf(o.kind),
        date: dayFirst(o.date.slice(0, 10)),
        href: saleReceiptHref(projectId, o.paymentId),
      }))}
      currentId={r.paymentId}
      whatsapp={{ phone: r.payerPhone, text: t("whatsappText", { no: r.no, amount: formatAmount(r.amount), project: r.project }) }}
      onPrinted={markPaymentPrintedAction.bind(null, projectId, paymentId)}
    />
  );
}
