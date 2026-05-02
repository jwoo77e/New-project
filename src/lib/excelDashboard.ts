import readXlsxFile from "read-excel-file/browser";
import type { DashboardData } from "../data/aiCostData";
import { dashboardDataFromSheets, normalizeWorkbookSheets } from "./excelDashboardCore";

export async function dashboardDataFromExcel(file: File): Promise<DashboardData> {
  const raw = await readXlsxFile(file, { trim: true });
  const sheets = normalizeWorkbookSheets(raw);
  return dashboardDataFromSheets(file.name.normalize("NFC"), sheets);
}
