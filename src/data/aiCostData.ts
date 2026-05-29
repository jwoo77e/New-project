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
    fileName: "AI 관련 비용 분석_부서별_대시보드용.xlsx + 2026년 4월 법인카드 AI 사용내역",
    sourceSheet: "키워드검색결과 + 2026년 전체내역",
    period: "2026년 1월 - 4월",
    recordCount: 76,
    totalActual: 18786787,
    expectedMonthlyFixed: 2240000,
    expectedQuarterFixed: 8960000,
    priorYearTotal: 13004940,
  },
  monthlyActuals: [
    { month: "2026-01", label: "1월", amount: 2640896, transactions: 16 },
    { month: "2026-02", label: "2월", amount: 4908535, transactions: 18 },
    { month: "2026-03", label: "3월", amount: 7249647, transactions: 20 },
    { month: "2026-04", label: "4월", amount: 3987709, transactions: 22 },
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
    {
      month: "2026-04",
      label: "4월",
      amount: 903200,
      transactions: 2,
      reason: "개발/데모용 구글 API 일시 비용",
    },
  ],
  departmentCosts: [
    {
      name: "자금회계팀(공용)",
      sourceName: "자금회계팀",
      ownerNote:
        "Gemini, Claude, Genspark, Gamma, ChatGPT, Ollama 정액요금과 공용 API 사용요금",
      transactions: 53,
      total: 17810686,
      monthly: { "2026-01": 2537273, "2026-02": 4692975, "2026-03": 7025021, "2026-04": 3555417 },
    },
    {
      name: "전략기획실(단독)",
      sourceName: "박연석",
      ownerNote: "Gemini, Claude, Genspark, Gamma, ChatGPT, Perplexity 정액요금",
      transactions: 15,
      total: 687586,
      monthly: { "2026-01": 74623, "2026-02": 186560, "2026-03": 172668, "2026-04": 253735 },
    },
    {
      name: "플랫폼개발팀(단독)",
      sourceName: "박재현",
      ownerNote: "Gemini 정액요금",
      transactions: 3,
      total: 87000,
      monthly: { "2026-01": 29000, "2026-02": 29000, "2026-03": 0, "2026-04": 29000 },
    },
    {
      name: "경영혁신팀(단독)",
      sourceName: "조욱상",
      ownerNote: "Genspark 정액요금",
      transactions: 6,
      total: 201515,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 51958, "2026-04": 149557 },
    },
    {
      name: "기술연구소(단독)",
      sourceName: "김대일",
      ownerNote: "단독 사용 없음, 공용 비용에서 지출",
      transactions: 0,
      total: 0,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 0, "2026-04": 0 },
    },
    {
      name: "스마트서비스팀(단독)",
      sourceName: "-",
      ownerNote: "단독 사용 없음, 공용 비용에서 지출",
      transactions: 0,
      total: 0,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 0, "2026-04": 0 },
    },
    {
      name: "전략사업팀(단독)",
      sourceName: "-",
      ownerNote: "단독 사용 없음, 공용 비용에서 지출",
      transactions: 0,
      total: 0,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 0, "2026-04": 0 },
    },
  ],
  categoryCosts: [
    { name: "Google/Gemini", amount: 7888838, color: "#0f8b8d" },
    { name: "Genspark", amount: 3930037, color: "#e85d4f" },
    { name: "ChatGPT/OpenAI", amount: 3617397, color: "#c58612" },
    { name: "Claude/Anthropic", amount: 2575901, color: "#5f6f8c" },
    { name: "미분류", amount: 484382, color: "#7a8580" },
    { name: "Gamma", amount: 225424, color: "#2f8f46" },
    { name: "Perplexity", amount: 33126, color: "#7f5aa2" },
    { name: "Ollama", amount: 31682, color: "#42a6a8" },
  ],
  vendorCosts: [
    { name: "토스페이먼츠", amount: 5577335 },
    { name: "MAINFUNC PTE. LTD.", amount: 3738983 },
    { name: "구글클라우드코리아", amount: 2240512 },
    { name: "OPENAI OPCO", amount: 1462193 },
    { name: "Claude.ai Subscription", amount: 1323538 },
    { name: "OpenAI ChatGPT Subscription", amount: 1203217 },
    { name: "Anthropic PBC", amount: 1064863 },
    { name: "OpenAI San Francisco", amount: 951987 },
    { name: "GENSPARK.AI", amount: 149557 },
    { name: "GAMMA/GAMMA.APP", amount: 75194 },
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
      date: "2026-04-02",
      department: "자금회계팀(공용)",
      item: "구글 그룹웨어 이용",
      vendor: "토스페이먼츠",
      category: "Google/Gemini",
      amount: 821508,
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
      date: "2026-04-17",
      department: "자금회계팀(공용)",
      item: "AI 라이선스 Genspark Pro",
      vendor: "MAINFUNC PTE. LTD.",
      category: "Genspark",
      amount: 417532,
    },
    {
      date: "2026-04-17",
      department: "자금회계팀(공용)",
      item: "AI 라이선스 Genspark Pro",
      vendor: "MAINFUNC PTE. LTD.",
      category: "Genspark",
      amount: 417532,
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
      date: "2026-04-01",
      department: "자금회계팀(공용)",
      item: "AI 개발자 도구 Claude Maximum Flexibility",
      vendor: "Claude.ai Subscription",
      category: "Claude/Anthropic",
      amount: 340886,
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
      date: "2026-04-21",
      department: "자금회계팀(공용)",
      item: "CHAT GPT Pro 영상제작 프로그램 이용",
      vendor: "OPENAI OPCO",
      category: "ChatGPT/OpenAI",
      amount: 333491,
    },
    {
      date: "2026-01-21",
      department: "자금회계팀(공용)",
      item: "CHAT GPT Pro 영상제작 프로그램 이용",
      vendor: "OPENAI OPCO",
      category: "ChatGPT/OpenAI",
      amount: 331412,
    },
  ],
};
