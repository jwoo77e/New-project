export type MonthlyActual = {
  month: string;
  label: string;
  amount: number;
  transactions: number;
};

export type ForecastAdjustment = {
  month: string;
  label: string;
  amount: number;
  transactions: number;
  reason: string;
};

export type DepartmentCost = {
  name: string;
  sourceName: string;
  ownerNote: string;
  transactions: number;
  total: number;
  monthly: Record<string, number>;
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

export type SourceMeta = {
  fileName: string;
  sourceSheet: string;
  period: string;
  recordCount: number;
  totalActual: number;
  expectedMonthlyFixed: number;
  expectedQuarterFixed: number;
  priorYearTotal: number;
};

export type DashboardData = {
  sourceMeta: SourceMeta;
  monthlyActuals: MonthlyActual[];
  forecastAdjustments: ForecastAdjustment[];
  departmentCosts: DepartmentCost[];
  categoryCosts: CategoryCost[];
  vendorCosts: VendorCost[];
  topTransactions: TransactionCost[];
};

export const initialDashboardData: DashboardData = {
  sourceMeta: {
    fileName: "AI 관련 비용 분석_부서별_대시보드용.xlsx",
    sourceSheet: "키워드검색결과",
    period: "2026년 1월 - 3월",
    recordCount: 54,
    totalActual: 14799078,
    expectedMonthlyFixed: 2240000,
    expectedQuarterFixed: 6720000,
    priorYearTotal: 13004940,
  },
  monthlyActuals: [
    { month: "2026-01", label: "1월", amount: 2640896, transactions: 16 },
    { month: "2026-02", label: "2월", amount: 4908535, transactions: 18 },
    { month: "2026-03", label: "3월", amount: 7249647, transactions: 20 },
  ],
  forecastAdjustments: [
    {
      month: "2026-01",
      label: "1월",
      amount: 166479,
      transactions: 2,
      reason: "개발/데모용 구글 API 일시 비용",
    },
    {
      month: "2026-02",
      label: "2월",
      amount: 2230568,
      transactions: 2,
      reason: "개발/데모용 구글 API 일시 비용",
    },
    {
      month: "2026-03",
      label: "3월",
      amount: 4530591,
      transactions: 2,
      reason: "개발/데모용 구글 API 일시 비용",
    },
  ],
  departmentCosts: [
    {
      name: "자금회계팀(공용)",
      sourceName: "자금회계팀",
      ownerNote:
        "Gemini, Claude, Genspark, Gamma, ChatGPT 정액요금과 공용 API 사용요금",
      transactions: 38,
      total: 14255269,
      monthly: { "2026-01": 2537273, "2026-02": 4692975, "2026-03": 7025021 },
    },
    {
      name: "전략기획실(단독)",
      sourceName: "박연석",
      ownerNote: "Gemini, Claude, Genspark, Gamma, ChatGPT, Perplexity 정액요금",
      transactions: 12,
      total: 433851,
      monthly: { "2026-01": 74623, "2026-02": 186560, "2026-03": 172668 },
    },
    {
      name: "플랫폼개발팀(단독)",
      sourceName: "박재현",
      ownerNote: "Gemini 정액요금",
      transactions: 2,
      total: 58000,
      monthly: { "2026-01": 29000, "2026-02": 29000, "2026-03": 0 },
    },
    {
      name: "경영혁신팀(단독)",
      sourceName: "조욱상",
      ownerNote: "Genspark 정액요금",
      transactions: 2,
      total: 51958,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 51958 },
    },
    {
      name: "기술연구소(단독)",
      sourceName: "김대일",
      ownerNote: "단독 사용 없음, 공용 비용에서 지출",
      transactions: 0,
      total: 0,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 0 },
    },
    {
      name: "스마트서비스팀(단독)",
      sourceName: "-",
      ownerNote: "단독 사용 없음, 공용 비용에서 지출",
      transactions: 0,
      total: 0,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 0 },
    },
    {
      name: "전략사업팀(단독)",
      sourceName: "-",
      ownerNote: "단독 사용 없음, 공용 비용에서 지출",
      transactions: 0,
      total: 0,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 0 },
    },
  ],
  categoryCosts: [
    { name: "Google/Gemini", amount: 6927638, color: "#0f8b8d" },
    { name: "ChatGPT/OpenAI", amount: 2797818, color: "#e85d4f" },
    { name: "Genspark", amount: 2525517, color: "#c58612" },
    { name: "Claude/Anthropic", amount: 1880367, color: "#5f6f8c" },
    { name: "미분류", amount: 484382, color: "#7a8580" },
    { name: "Gamma", amount: 150230, color: "#2f8f46" },
    { name: "Perplexity", amount: 33126, color: "#7f5aa2" },
  ],
  vendorCosts: [
    { name: "토스페이먼츠", amount: 4510327 },
    { name: "MAINFUNC PTE. LTD.", amount: 2484020 },
    { name: "구글클라우드코리아", amount: 2240512 },
    { name: "OPENAI OPCO", amount: 1095245 },
    { name: "Claude.ai Subscription", amount: 982652 },
    { name: "OpenAI ChatGPT Subscription", amount: 900473 },
    { name: "Anthropic PBC", amount: 897715 },
    { name: "OpenAI San Francisco", amount: 802100 },
  ],
  topTransactions: [
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
  ],
};
