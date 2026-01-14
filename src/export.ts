import * as XLSX from "xlsx";
import type { DecisionMatrix } from "./types";

const COLOR_MAP: Record<string, string> = {
  red: "FFCCCC",
  yellow: "FFFFCC",
  green: "CCFFCC",
};

export function generateXLSX(matrix: DecisionMatrix, outputPath: string): void {
  const workbook = XLSX.utils.book_new();
  const rows: string[][] = [];

  // Row 1: Decision statement + option labels
  const headerRow = [matrix.decision.statement];
  for (const option of matrix.options) {
    headerRow.push(option.label);
  }
  rows.push(headerRow);

  // Row 2: Decision description + option descriptions
  const descRow = [matrix.decision.description];
  for (const option of matrix.options) {
    descRow.push(option.description);
  }
  rows.push(descRow);

  // Criteria rows
  for (const criterion of matrix.criteria) {
    const row = [criterion.name];
    for (const option of matrix.options) {
      const cell = criterion.cells[option.label];
      row.push(cell?.text || "");
    }
    rows.push(row);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Apply column widths
  worksheet["!cols"] = [
    { wch: 25 }, // Criteria column
    ...matrix.options.map(() => ({ wch: 30 })),
  ];

  // Apply cell styles (colors)
  // Note: xlsx community edition has limited styling support
  // For full styling, would need xlsx-style or exceljs
  // For now, we'll output the data and colors can be applied manually or via template

  XLSX.utils.book_append_sheet(workbook, worksheet, "Decision Matrix");
  XLSX.writeFile(workbook, outputPath);
}

export function getXLSXPath(jsonPath: string): string {
  return jsonPath.replace(/\.json$/, ".xlsx");
}
