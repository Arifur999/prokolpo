// A table to save as an Excel sheet: a bold header row, then plain rows. Money stays a
// number so Excel can add it up.
export type Sheet = {
  name: string;
  header: string[];
  rows: (string | number | null)[][];
  // Column widths in characters.
  widths?: number[];
};

// Excel caps sheet names at 31 characters and forbids a few symbols.
const sheetName = (name: string) => name.replace(/[\\/?*[\]:]/g, " ").slice(0, 31);
const fileName = (name: string) => `${name.replace(/[\\/:*?"<>|]/g, " ").trim()}.xlsx`;

// Builds the workbook in the browser and offers it for download.
export async function downloadSheets(file: string, sheets: Sheet[]) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const data = sheets.map((s) => ({
    sheet: sheetName(s.name),
    columns: s.widths?.map((width) => ({ width })),
    data: [
      s.header.map((value) => ({ value, fontWeight: "bold" as const })),
      ...s.rows.map((row) => row.map((value) => (typeof value === "number" ? { value, format: "#,##0" } : { value: value ?? "" }))),
    ],
  }));
  await writeExcelFile(data).toFile(fileName(file));
}
