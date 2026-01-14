import ExcelJS from "exceljs";
import type { DecisionMatrix } from "./types";

const COLOR_MAP: Record<string, string> = {
  red: "FFCCCC",
  yellow: "FFFFCC",
  green: "CCFFCC",
};

const HEADER_BG = "2C3E50";
const HEADER_FG = "FFFFFF";
const OPTION_BG = "34495E";
const DESC_BG = "ECF0F1";
const OPTION_DESC_BG = "F8F9FA";
const CRITERIA_BG = "F8F9FA";

export async function generateXLSX(matrix: DecisionMatrix, outputPath: string): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Decision Matrix");

  const numCols = matrix.options.length + 1;

  // Row 1: Decision statement + option labels
  const headerRow = worksheet.addRow([
    matrix.decision.statement,
    ...matrix.options.map((o) => o.label),
  ]);
  headerRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colNumber === 1 ? HEADER_BG : OPTION_BG },
    };
    cell.font = { bold: true, color: { argb: HEADER_FG } };
    cell.alignment = { vertical: "top", wrapText: true };
    if (colNumber > 1) {
      cell.alignment = { horizontal: "center", vertical: "top", wrapText: true };
    }
  });

  // Row 2: Decision description + option descriptions
  const descRow = worksheet.addRow([
    matrix.decision.description,
    ...matrix.options.map((o) => o.description),
  ]);
  descRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colNumber === 1 ? DESC_BG : OPTION_DESC_BG },
    };
    cell.font = { italic: colNumber === 1 };
    cell.alignment = { vertical: "top", wrapText: true };
  });

  // Criteria rows
  for (const criterion of matrix.criteria) {
    const rowData = [criterion.name];
    for (const option of matrix.options) {
      const cell = criterion.cells[option.label];
      rowData.push(cell?.text || "");
    }
    const row = worksheet.addRow(rowData);

    row.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: "top", wrapText: true };

      if (colNumber === 1) {
        // Criteria name column
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: CRITERIA_BG },
        };
        cell.font = { bold: true };
      } else {
        // Assessment cells - apply color based on matrix data
        const option = matrix.options[colNumber - 2];
        const cellData = criterion.cells[option.label];
        if (cellData?.color && COLOR_MAP[cellData.color]) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLOR_MAP[cellData.color] },
          };
        }
      }
    });
  }

  // Set column widths
  worksheet.columns = [
    { width: 25 },
    ...matrix.options.map(() => ({ width: 35 })),
  ];

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "E0E0E0" } },
        left: { style: "thin", color: { argb: "E0E0E0" } },
        bottom: { style: "thin", color: { argb: "E0E0E0" } },
        right: { style: "thin", color: { argb: "E0E0E0" } },
      };
    });
  });

  await workbook.xlsx.writeFile(outputPath);
}

export function getXLSXPath(jsonPath: string): string {
  return jsonPath.replace(/\.json$/, ".xlsx");
}
