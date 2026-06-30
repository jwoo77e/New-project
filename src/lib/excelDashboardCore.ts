import type {
  CategoryCost,
  DashboardData,
  DepartmentCost,
  TransactionCost,
  VendorCost,
} from "../data/aiCostData";
import { initialDashboardData } from "../data/aiCostData";

type Cell = string | number | boolean | Date | typeof Date | null | undefined;
type SheetData = Cell[][];

export type WorkbookSheet = { sheet: string; data: SheetData };

type ParsedRow = {
  date: Date;
  month: string;
  department: string;
  displayDepartment: string;
  item: string;
  vendor: string;
  category: string;
  amount: number;
  excludeFromForecast: boolean;
};

const categoryColors = [
  "#0f8b8d",
  "#e85d4f",
  "#c58612",
  "#5f6f8c",
  "#7a8580",
  "#2f8f46",
  "#7f5aa2",
  "#42a6a8",
  "#b86b3b",
];

const knownDepartmentMap: Record<string, { name: string; note: string }> = {
  자금회계팀: {
    name: "자금회계팀(공용)",
    note: "공용 계정 및 AI 도구 사용료",
  },
  박연석: {
    name: "전략기획실(단독)",
    note: "개인/단독 AI 도구 사용료",
  },
  박재현: {
    name: "플랫폼개발팀(단독)",
    note: "개인/단독 AI 도구 사용료",
  },
  조욱상: {
    name: "경영혁신팀(단독)",
    note: "개인/단독 AI 도구 사용료",
  },
  김대일: {
    name: "기술연구소(단독)",
    note: "개인/단독 AI 도구 사용료",
  },
  기술연구소: {
    name: "기술연구소(단독)",
    note: "개인/단독 AI 도구 사용료",
  },
};

const fallbackDepartments = [
  "자금회계팀",
  "박연석",
  "박재현",
  "조욱상",
  "김대일",
  "스마트서비스팀",
  "전략사업팀",
];

const headerAliases = {
  date: ["일자", "거래일자", "사용일자", "승인일자", "date", "day"],
  item: ["품명", "사용내역", "내역", "전표적요", "적요", "description", "item"],
  amount: ["사용금액", "승인금액", "금액", "비용", "amount", "cost"],
  vendor: ["거래처", "가맹점", "vendor", "merchant", "supplier"],
  department: ["부서", "부서명", "팀", "소속", "department", "owner"],
  category: ["분류", "카테고리", "category", "tool"],
};

export function normalizeWorkbookSheets(raw: unknown): WorkbookSheet[] {
  if (
    Array.isArray(raw) &&
    raw.length > 0 &&
    typeof raw[0] === "object" &&
    raw[0] !== null &&
    "data" in raw[0]
  ) {
    return (raw as WorkbookSheet[]).map((sheet, index) => ({
      sheet: sheet.sheet || `Sheet${index + 1}`,
      data: sheet.data,
    }));
  }

  return [{ sheet: "Sheet1", data: raw as SheetData }];
}

export function dashboardDataFromSheets(
  fileName: string,
  sheets: WorkbookSheet[],
): DashboardData {
  const selected = findCostSheet(sheets);

  if (!selected) {
    throw new Error("일자, 사용금액, 부서 컬럼을 가진 시트를 찾지 못했습니다.");
  }

  const { sheet, headerIndex, columns } = selected;
  const rows = parseRows(sheet.data.slice(headerIndex + 1), columns);

  if (rows.length === 0) {
    throw new Error("읽을 수 있는 비용 행이 없습니다.");
  }

  return createDashboardData(fileName, sheet.sheet, rows, sheets);
}

function findCostSheet(sheets: WorkbookSheet[]) {
  const preferred = [...sheets].sort((a, b) => {
    const aScore = sheetPreferenceScore(a.sheet);
    const bScore = sheetPreferenceScore(b.sheet);
    return aScore - bScore;
  });

  for (const sheet of preferred) {
    for (let rowIndex = 0; rowIndex < Math.min(sheet.data.length, 12); rowIndex += 1) {
      const row = sheet.data[rowIndex];
      const columns = {
        date: findColumn(row, headerAliases.date),
        item: findColumn(row, headerAliases.item),
        amount: findColumn(row, headerAliases.amount),
        vendor: findColumn(row, headerAliases.vendor),
        department: findColumn(row, headerAliases.department),
        category: findColumn(row, headerAliases.category),
      };

      if (columns.date >= 0 && columns.amount >= 0 && columns.department >= 0) {
        return { sheet, headerIndex: rowIndex, columns };
      }
    }
  }

  return null;
}

function sheetPreferenceScore(sheetName: string) {
  if (sheetName.includes("키워드검색결과")) return 0;
  if (sheetName.includes("2026년 전체내역")) return 1;
  if (sheetName.includes("전체내역")) return 2;
  if (sheetName.toLowerCase() === "sheet1") return 3;
  return 4;
}

function findColumn(row: readonly Cell[], aliases: string[]) {
  return row.findIndex((cell) => {
    const header = normalizeText(cell);
    return aliases.some((alias) => header === normalizeText(alias));
  });
}

function parseRows(
  rows: SheetData,
  columns: {
    date: number;
    item: number;
    amount: number;
    vendor: number;
    department: number;
    category: number;
  },
): ParsedRow[] {
  return rows.flatMap((row) => {
    const date = parseDate(row[columns.date]);
    const amount = parseAmount(row[columns.amount]);
    const department = stringify(row[columns.department]) || "미지정";

    if (!date || !amount || amount <= 0 || !department) {
      return [];
    }

    const item = columns.item >= 0 ? stringify(row[columns.item]) : "";
    const vendor = columns.vendor >= 0 ? stringify(row[columns.vendor]) : "";
    const rawCategory = columns.category >= 0 ? stringify(row[columns.category]) : "";
    const category = normalizeCategory(rawCategory || inferCategory(`${item} ${vendor}`));
    const displayDepartment = knownDepartmentMap[department]?.name ?? department;
    const excludeFromForecast = isTemporaryGoogleApiCost(item, vendor, rawCategory);

    return [
      {
        date,
        month: toMonthKey(date),
        department,
        displayDepartment,
        item: item || "비용 내역",
        vendor: vendor || "미지정",
        category,
        amount,
        excludeFromForecast,
      },
    ];
  });
}

function createDashboardData(
  fileName: string,
  sourceSheet: string,
  rows: ParsedRow[],
  sheets: WorkbookSheet[],
): DashboardData {
  const monthKeys = [...new Set(rows.map((row) => row.month))].sort();
  const totalActual = rows.reduce((sum, row) => sum + row.amount, 0);
  const expectedMonthlyFixed = extractExpectedMonthlyFixed(sheets);
  const priorYearTotal = extractPriorYearTotal(sheets);
  const monthlyActuals = monthKeys.map((month) => {
    const monthRows = rows.filter((row) => row.month === month);
    return {
      month,
      label: monthLabel(month),
      amount: sumRows(monthRows),
      transactions: monthRows.length,
    };
  });
  const forecastAdjustments = monthKeys
    .map((month) => {
      const adjustedRows = rows.filter((row) => row.month === month && row.excludeFromForecast);
      return {
        month,
        label: monthLabel(month),
        amount: sumRows(adjustedRows),
        transactions: adjustedRows.length,
        reason: "개발/데모용 구글 API 일시 비용",
      };
    })
    .filter((item) => item.amount > 0);

  const departmentCosts = buildDepartmentCosts(rows, monthKeys);
  const categoryCosts = buildCategoryCosts(rows);
  const vendorCosts = buildVendorCosts(rows);
  const topTransactions = rows
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 12)
    .map<TransactionCost>((row) => ({
      date: toDateLabel(row.date),
      department: row.displayDepartment,
      item: row.item,
      vendor: compactVendor(row.vendor),
      category: row.category,
      amount: row.amount,
    }));

  return {
    sourceMeta: {
      fileName,
      sourceSheet,
      period: periodLabel(monthKeys),
      recordCount: rows.length,
      totalActual,
      expectedMonthlyFixed,
      expectedQuarterFixed: expectedMonthlyFixed * monthlyActuals.length,
      priorYearTotal,
    },
    monthlyActuals,
    forecastAdjustments,
    departmentCosts,
    categoryCosts,
    vendorCosts,
    topTransactions,
  };
}

function buildDepartmentCosts(rows: ParsedRow[], monthKeys: string[]): DepartmentCost[] {
  const groups = new Map<string, ParsedRow[]>();
  rows.forEach((row) => {
    const key = row.displayDepartment;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });

  const hasKnownDepartments = rows.some((row) => row.department in knownDepartmentMap);
  if (hasKnownDepartments) {
    fallbackDepartments.forEach((department) => {
      const mappedName = knownDepartmentMap[department]?.name ?? `${department}(단독)`;
      if (!groups.has(mappedName)) {
        groups.set(mappedName, []);
      }
    });
  }

  return [...groups.entries()]
    .map<DepartmentCost>(([name, groupRows]) => {
      const rawName = groupRows[0]?.department ?? findRawDepartmentName(name);
      const monthly = Object.fromEntries(
        monthKeys.map((month) => [
          month,
          sumRows(groupRows.filter((row) => row.month === month)),
        ]),
      );
      return {
        name,
        sourceName: rawName || "-",
        ownerNote: knownDepartmentMap[rawName]?.note ?? "업로드 원천 기준 집계",
        transactions: groupRows.length,
        total: sumRows(groupRows),
        monthly,
      };
    })
    .sort((a, b) => b.total - a.total);
}

function buildCategoryCosts(rows: ParsedRow[]): CategoryCost[] {
  const totals = new Map<string, number>();
  rows.forEach((row) => totals.set(row.category, (totals.get(row.category) ?? 0) + row.amount));

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], index) => ({
      name,
      amount,
      color: categoryColors[index % categoryColors.length],
    }));
}

function buildVendorCosts(rows: ParsedRow[]): VendorCost[] {
  const totals = new Map<string, number>();
  rows.forEach((row) => {
    const vendor = compactVendor(row.vendor);
    totals.set(vendor, (totals.get(vendor) ?? 0) + row.amount);
  });

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, amount]) => ({ name, amount }));
}

function extractExpectedMonthlyFixed(sheets: WorkbookSheet[]) {
  for (const sheet of sheets) {
    for (const row of sheet.data) {
      for (const cell of row) {
        const text = stringify(cell);
        const match = text.match(/매월\s*약?\s*([\d,.]+)\s*만원/);
        if (match) {
          return Math.round(Number(match[1].replace(/,/g, "")) * 10000);
        }
      }
    }
  }

  return initialDashboardData.sourceMeta.expectedMonthlyFixed;
}

function extractPriorYearTotal(sheets: WorkbookSheet[]) {
  for (const sheet of sheets) {
    let inPriorYearBlock = false;
    for (const row of sheet.data) {
      if (row.some((cell) => stringify(cell).includes("2025년"))) {
        inPriorYearBlock = true;
      }

      if (inPriorYearBlock && row.some((cell) => stringify(cell) === "합계")) {
        const amounts = row.map((cell) => parseAmount(cell)).filter((value) => value > 0);
        if (amounts.length > 0) {
          return Math.max(...amounts);
        }
      }
    }
  }

  return initialDashboardData.sourceMeta.priorYearTotal;
}

function parseDate(value: Cell): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number" && value > 20000 && value < 80000) {
    const date = new Date(Date.UTC(1899, 11, 30));
    date.setUTCDate(date.getUTCDate() + Math.round(value));
    return date;
  }

  const text = stringify(value);
  const match = text.match(/(\d{4})[./-]\s*(\d{1,2})[./-]\s*(\d{1,2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  return null;
}

function parseAmount(value: Cell): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(stringify(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function inferCategory(text: string) {
  const normalized = text.toLowerCase();
  if (
    normalized.includes("gemini") ||
    normalized.includes("google") ||
    normalized.includes("구글") ||
    normalized.includes("제미나이")
  ) {
    return "Google/Gemini";
  }
  if (normalized.includes("claude") || normalized.includes("anthropic") || normalized.includes("클로드")) {
    return "Claude/Anthropic";
  }
  if (
    normalized.includes("genspark") ||
    normalized.includes("mainfunc") ||
    normalized.includes("젠스파크") ||
    normalized.includes("젠스파트")
  ) {
    return "Genspark";
  }
  if (normalized.includes("gamma") || normalized.includes("감마")) {
    return "Gamma";
  }
  if (
    normalized.includes("chatgpt") ||
    normalized.includes("chat gpt") ||
    normalized.includes("openai") ||
    normalized.includes("gpt") ||
    normalized.includes("챗")
  ) {
    return "ChatGPT/OpenAI";
  }
  if (normalized.includes("perplexity") || normalized.includes("퍼플")) {
    return "Perplexity";
  }
  if (normalized.includes("ollama")) {
    return "Ollama";
  }
  if (normalized.includes("cursor")) {
    return "Cursor";
  }
  return "미분류";
}

function normalizeCategory(category: string) {
  const normalized = category.trim().toLowerCase();
  if (!normalized) return "미분류";
  if (
    normalized.includes("구글") ||
    normalized.includes("gemini") ||
    normalized.includes("google") ||
    normalized.includes("제미나이")
  ) {
    return "Google/Gemini";
  }
  if (normalized.includes("클로드") || normalized.includes("claude") || normalized.includes("anthropic")) {
    return "Claude/Anthropic";
  }
  if (
    normalized.includes("젠스파크") ||
    normalized.includes("젠스파트") ||
    normalized.includes("genspark") ||
    normalized.includes("mainfunc")
  ) {
    return "Genspark";
  }
  if (normalized.includes("감마") || normalized.includes("gamma")) {
    return "Gamma";
  }
  if (normalized.includes("gpt") || normalized.includes("openai") || normalized.includes("챗")) {
    return "ChatGPT/OpenAI";
  }
  if (normalized.includes("퍼플") || normalized.includes("perplexity")) {
    return "Perplexity";
  }
  if (normalized.includes("ollama")) {
    return "Ollama";
  }
  return category.trim();
}

function isTemporaryGoogleApiCost(item: string, vendor: string, rawCategory: string) {
  const text = `${item} ${vendor} ${rawCategory}`.toLowerCase();

  return (
    text.includes("구글클라우드") ||
    text.includes("google*google digital") ||
    text.includes("구글 그룹웨어") ||
    text.includes("클라우드 사용료")
  );
}

function compactVendor(vendor: string) {
  return vendor.replace(/\\+/g, "").replace(/\s{2,}/g, " ").trim() || "미지정";
}

function findRawDepartmentName(displayName: string) {
  return (
    Object.entries(knownDepartmentMap).find(([, value]) => value.name === displayName)?.[0] ??
    displayName.replace(/\((공용|단독)\)/g, "")
  );
}

function normalizeText(value: Cell) {
  return stringify(value).replace(/\s+/g, "").toLowerCase();
}

function stringify(value: Cell) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return toDateLabel(value);
  return String(value).trim();
}

function sumRows(rows: ParsedRow[]) {
  return rows.reduce((sum, row) => sum + row.amount, 0);
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string) {
  return `${Number(month.slice(5, 7))}월`;
}

function toDateLabel(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function periodLabel(months: string[]) {
  const first = months[0];
  const last = months[months.length - 1];
  if (!first || !last) return "업로드 원천";

  const firstYear = Number(first.slice(0, 4));
  const lastYear = Number(last.slice(0, 4));
  const firstMonth = Number(first.slice(5, 7));
  const lastMonth = Number(last.slice(5, 7));

  if (firstYear === lastYear) {
    return `${firstYear}년 ${firstMonth}월 - ${lastMonth}월`;
  }

  return `${firstYear}년 ${firstMonth}월 - ${lastYear}년 ${lastMonth}월`;
}
