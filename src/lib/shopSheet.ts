import type { Translate } from "./activityText";
import type { Sheet } from "./excel";
import { dayFirst } from "./expenseText";
import { daySales } from "./shopLook";
import type { IShopBook } from "@/types/shop.types";

// The shop's days and its credit book as two Excel sheets, in the reader's language.
export const shopSheet = (book: IShopBook, t: Translate): Sheet[] => [
  {
    name: t("days.title"),
    header: [t("days.day"), t("days.cash"), t("days.mobile"), t("days.credit"), t("days.total"), t("days.collect"), t("days.other"), t("form.note")],
    widths: [12, 12, 12, 12, 14, 12, 12, 30],
    rows: book.days.map((d) => [dayFirst(d.date), d.cash, d.mobile, d.credit, daySales(d), d.collect, d.other, d.note]),
  },
  {
    name: t("book.title"),
    header: [t("book.colName"), t("book.colDue")],
    widths: [28, 14],
    rows: book.khata.map((k) => [k.name, k.due]),
  },
];
