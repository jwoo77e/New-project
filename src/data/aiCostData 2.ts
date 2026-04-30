export type MonthlyActual = {
  month: string;
  label: string;
  amount: number;
  transactions: number;
};

export type DepartmentCost = {
  name: string;
  sourceName: string;
  ownerNote: string;
  transactions: number;
  total: number;
  monthly: {
    jan: number;
    feb: number;
    mar: number;
  };
};

export type CategoryCost = {
  name: string;
  amount: number;
  color: string;
};

export type VendorCost = {
  name: string;
  amount: number;
};

export type TransactionCost = {
  date: string;
  department: string;
  item: string;
  vendor: string;
  category: string;
  amount: number;
};

export const sourceMeta = {
  fileName: "AI 관련 비용 분석_부서별_대시보드용.xlsx",
  sourceSheet: "키워드검색결과",
  period: "2026년 1월 - 3월",
  recordCount: 54,
  totalActual: 14799078,
  expectedMonthlyFixed: 2240000,
  expectedQuarterFixed: 6720000,
  priorYearTotal: 13004940,
};

export const monthlyActuals: MonthlyActual[] = [
  { month: "2026-01", label: "1월", amount: 2640896, transactions: 16 },
  { month: "2026-02", label: "2월", amount: 4908535, transactions: 18 },
  { month: "2026-03", label: "3월", amount: 7249647, transactions: 20 },
];

export const departmentCosts: DepartmentCost[] = [
  {
    name: "자금회계팀(공용)",
    sourceName: "자금회계팀",
    ownerNote:
      "Gemini, Claude, Genspark, Gamma, ChatGPT 정액요금과 공용 API 사용요금",
    transactions: 38,
    total: 14255269,
    monthly: { jan: 2537273, feb: 4692975, mar: 7025021 },
  },
  {
    name: "전략기획실(단독)",
    sourceName: "박연석",
    ownerNote: "Gemini, Claude, Genspark, Gamma, ChatGPT, Perplexity 정액요금",
    transactions: 12,
    total: 433851,
    monthly: { jan: 74623, feb: 186560, mar: 172668 },
  },
  {
    name: "플랫폼개발팀(단독)",
    sourceName: "박재현",
    ownerNote: "Gemini 정액요금",
    transactions: 2,
    total: 58000,
    monthly: { jan: 29000, feb: 29000, mar: 0 },
  },
  {
    name: "경영혁신팀(단독)",
    sourceName: "조욱상",
    ownerNote: "Genspark 정액요금",
    transactions: 2,
    total: 51958,
    monthly: { jan: 0, feb: 0, mar: 51958 },
  },
  {
    name: "기술연구소(단독)",
    sourceName: "김대일",
    ownerNote: "단독 사용 없음, 공용 비용에서 지출",
    transactions: 0,
    total: 0,
    monthly: { jan: 0, feb: 0, mar: 0 },
  },
  {
    name: "스마트서비스팀(단독)",
    sourceName: "-",
    ownerNote: "단독 사용 없음, 공용 비용에서 지출",
    transactions: 0,
    total: 0,
    monthly: { jan: 0, feb: 0, mar: 0 },
  },
  {
    name: "전략사업팀(단독)",
    sourceName: "-",
    ownerNote: "단독 사용 없음, 공용 비용에서 지출",
    transactions: 0,
    total: 0,
    monthly: { jan: 0, feb: 0, mar: 0 },
  },
];

export const categoryCosts: CategoryCost[] = [
  { name: "Google/Gemini", amount: 6927638, color: "#0f8b8d" },
  { name: "ChatGPT/OpenAI", amount: 2797818, color: "#e85d4f" },
  { name: "Genspark", amount: 2525517, color: "#c58612" },
  { name: "Claude/Anthropic", amount: 1880367, color: "#5f6f8c" },
  { name: "미분류", amount: 484382, color: "#7a8580" },
  { name: "Gamma", amount: 150230, color: "#2f8f46" },
  { name: "Perplexity", amount: 33126, color: "#7f5aa2" },
];

export const vendorCosts: VendorCost[] = [
  { name: "토스페이먼츠", amount: 4510327 },
  { name: "MAINFUNC PTE. LTD.", amount: 2484020 },
  { name: "구글클라우드코리아", amount: 2240512 },
  { name: "OPENAI OPCO", amount: 1095245 },
  { name: "Claude.ai Subscription", amount: 982652 },
  { name: "OpenAI ChatGPT Subscription", amount: 900473 },
  { name: "Anthropic PBC", amount: 897715 },
  { name: "OpenAI San Francisco", amount: 802100 },
];

export const topTransactions: TransactionCost[] = [
  {
    date: "2026-03-02",
    department: "자금회계팀(공용)",
    item: "구글 그룹웨어 이용",
    vendor: "토스페이먼츠",
    category: "Google/Gemini",
    amount: 4451327,
  },
  {
    date: "2026-02-02",
    department: "자금회계팀(공용)",
    item: "구글 그룹웨어 이용",
    vendor: "구글클라우드코리아",
    category: "Google/Gemini",
    amount: 2152057,
  },
  {
    date: "2026-03-17",
    department: "자금회계팀(공용)",
    item: "AI 라이선스 Genspark Pro",
    vendor: "MAINFUNC PTE. LTD.",
    category: "Genspark",
    amount: 419209,
  },
  {
    date: "2026-01-17",
    department: "자금회계팀(공용)",
    item: "AI 도구 라이선스",
    vendor: "MAINFUNC PTE. LTD.",
    category: "Genspark",
    amount: 415689,
  },
  {
    date: "2026-02-17",
    department: "자금회계팀(공용)",
    item: "AI 라이선스 Genspark Pro",
    vendor: "MAINFUNC PTE. LTD.",
    category: "Genspark",
    amount: 407112,
  },
  {
    date: "2026-03-21",
    department: "자금회계팀(공용)",
    item: "CHAT GPT Pro 영상제작 프로그램 이용",
    vendor: "OPENAI OPCO",
    category: "ChatGPT/OpenAI",
    amount: 337403,
  },
  {
    date: "2026-01-21",
    department: "자금회계팀(공용)",
    item: "CHAT GPT Pro 영상제작 프로그램 이용",
    vendor: "OPENAI OPCO",
    category: "ChatGPT/OpenAI",
    amount: 331412,
  },
  {
    date: "2026-03-01",
    department: "자금회계팀(공용)",
    item: "AI 개발자 도구 Claude Maximum Flexibility",
    vendor: "Claude.ai Subscription",
    category: "Claude/Anthropic",
    amount: 330322,
  },
];
