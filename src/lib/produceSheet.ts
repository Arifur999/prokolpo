import type { Translate } from "./activityText";
import type { Sheet } from "./excel";
import { dayFirst } from "./expenseText";
import type { IProduceBook } from "@/types/produce.types";

// The farm's sales and batches as two Excel sheets, in the reader's language.
export const produceSheet = (book: IProduceBook, t: Translate): Sheet[] => {
  const batchName = new Map(book.batches.map((b) => [b.id, b.name]));
  return [
    {
      name: t("list.title"),
      header: [
        t("list.date"),
        t("list.what"),
        t("batches.batch"),
        t("form.qty"),
        t("form.unit"),
        t("form.rate"),
        t("list.buyer"),
        t("list.amount"),
        t("dues.title"),
      ],
      widths: [12, 22, 14, 10, 10, 10, 24, 14, 14],
      rows: book.sales.map((s) => [
        dayFirst(s.date),
        t(`products.${s.product}`),
        (s.phaseId && batchName.get(s.phaseId)) || t("list.noBatch"),
        s.quantity,
        t(`units.${s.unit}`),
        s.rate,
        s.buyer,
        s.amount,
        s.left,
      ]),
    },
    {
      name: t("batches.title"),
      header: [t("batches.batch"), t("batchForm.started"), t("batchForm.ended"), t("batches.cost"), t("batches.sales"), t("batches.profit")],
      widths: [16, 14, 14, 14, 14, 14],
      rows: book.batches.map((b) => [
        b.name,
        b.startedOn ? dayFirst(b.startedOn) : "",
        b.endedOn ? dayFirst(b.endedOn) : "",
        b.cost,
        b.sales,
        b.endedOn ? b.sales - b.cost : null,
      ]),
    },
  ];
};
