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
    fileName: "AI 관련 비용 분석_부서별_대시보드용.xlsx + 2026년 4-5월 법인카드 AI 사용내역 + 청구내역조회20260720.xlsx + 승인내역조회20260820.xlsx",
    sourceSheet: "키워드검색결과 + 2026년 전체내역 + 2026년 5월 + 청구내역조회20260720 + 승인내역조회20260820",
    period: "2026년 1월 - 7월",
    recordCount: 128,
    totalActual: 32194545,
    expectedMonthlyFixed: 2240000,
    expectedQuarterFixed: 11200000,
    priorYearTotal: 13004940,
  },
  monthlyActuals: [
    { month: "2026-01", label: "1월", amount: 2640896, transactions: 16 },
    { month: "2026-02", label: "2월", amount: 4908535, transactions: 18 },
    { month: "2026-03", label: "3월", amount: 7249647, transactions: 20 },
    { month: "2026-04", label: "4월", amount: 3987709, transactions: 22 },
    { month: "2026-05", label: "5월", amount: 9055396, transactions: 23 },
    { month: "2026-06", label: "6월", amount: 3486961, transactions: 19 },
    { month: "2026-07", label: "7월", amount: 865401, transactions: 10 },
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
    {
      month: "2026-05",
      label: "5월",
      amount: 5205804,
      transactions: 3,
      reason: "개발/데모용 구글 API 일시 비용",
    },
  ],
  departmentCosts: [
    {
      name: "자금회계팀(공용)",
      sourceName: "자금회계팀",
      ownerNote:
        "Gemini, Claude, Genspark, Gamma, ChatGPT, Ollama 정액요금과 공용 API 사용요금",
      transactions: 81,
      total: 26880570,
      monthly: {
        "2026-01": 2537273,
        "2026-02": 4692975,
        "2026-03": 7025021,
        "2026-04": 3555417,
        "2026-05": 8204483,
        "2026-06": 0,
        "2026-07": 865401,
      },
    },
    {
      name: "재무회계팀(단독)",
      sourceName: "재무회계팀",
      ownerNote: "Claude Pro 5x 사용료",
      transactions: 1,
      total: 171236,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 0, "2026-04": 0, "2026-05": 0, "2026-06": 171236 },
    },
    {
      name: "전략기획실(단독)",
      sourceName: "박연석",
      ownerNote: "Gemini, Claude, Genspark, Gamma, ChatGPT, Perplexity 정액요금",
      transactions: 17,
      total: 1197149,
      monthly: { "2026-01": 74623, "2026-02": 186560, "2026-03": 172668, "2026-04": 253735, "2026-05": 0, "2026-06": 509563 },
    },
    {
      name: "플랫폼개발팀(단독)",
      sourceName: "박재현",
      ownerNote: "Gemini 정액요금과 Claude Team Plan·추가 토큰 사용료",
      transactions: 12,
      total: 1148892,
      monthly: { "2026-01": 29000, "2026-02": 29000, "2026-03": 0, "2026-04": 29000, "2026-05": 0, "2026-06": 1061892 },
    },
    {
      name: "경영혁신팀(단독)",
      sourceName: "조욱상",
      ownerNote: "Genspark 정액요금과 Claude Pro 사용료",
      transactions: 7,
      total: 373498,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 51958, "2026-04": 149557, "2026-05": 0, "2026-06": 171983 },
    },
    {
      name: "기술연구소(단독)",
      sourceName: "김대일/기술연구소",
      ownerNote: "Claude, ChatGPT 단독 AI 도구 사용료",
      transactions: 7,
      total: 1178782,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 0, "2026-04": 0, "2026-05": 850913, "2026-06": 327869 },
    },
    {
      name: "스마트서비스팀(단독)",
      sourceName: "-",
      ownerNote: "단독 사용 없음, 공용 비용에서 지출",
      transactions: 0,
      total: 0,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 0, "2026-04": 0, "2026-05": 0, "2026-06": 0 },
    },
    {
      name: "전략사업팀(단독)",
      sourceName: "전략 사업팀",
      ownerNote: "Genspark, Gamma 정액요금과 추가 토큰 사용료",
      transactions: 4,
      total: 1244418,
      monthly: { "2026-01": 0, "2026-02": 0, "2026-03": 0, "2026-04": 0, "2026-05": 0, "2026-06": 1244418 },
    },
  ],
  categoryCosts: [
    { name: "Google/Gemini", amount: 13686142, color: "#0f8b8d" },
    { name: "Claude/Anthropic", amount: 6330633, color: "#5f6f8c" },
    { name: "Genspark", amount: 5559585, color: "#e85d4f" },
    { name: "ChatGPT/OpenAI", amount: 5717655, color: "#c58612" },
    { name: "미분류", amount: 532745, color: "#7a8580" },
    { name: "Gamma", amount: 302977, color: "#2f8f46" },
    { name: "Perplexity", amount: 33126, color: "#7f5aa2" },
    { name: "Ollama", amount: 31682, color: "#42a6a8" },
  ],
  vendorCosts: [
    { name: "토스페이먼츠", amount: 5577335 },
    { name: "MAINFUNC PTE. LTD.", amount: 5368531 },
    { name: "구글클라우드코리아_TOSS", amount: 5126160 },
    { name: "Anthropic PBC", amount: 3758425 },
    { name: "Claude.ai Subscription", amount: 2384708 },
    { name: "구글클라우드코리아", amount: 2240512 },
    { name: "OpenAI ChatGPT Subscription", amount: 2496187 },
    { name: "OPENAI OPCO", amount: 2121333 },
    { name: "OpenAI San Francisco", amount: 1100135 },
    { name: "구글플레이/구글페이먼트코리아", amount: 591500 },
  ],
  topTransactions: [
    {
      date: "2026-05-03",
      department: "자금회계팀(공용)",
      item: "구글 그룹웨어 이용",
      vendor: "구글클라우드코리아_TOSS",
      category: "Google/Gemini",
      amount: 5000000,
    },
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
      date: "2026-06-17",
      department: "전략사업팀(단독)",
      item: "Genspark 추가 토큰 사용료",
      vendor: "GENSPARK.AI",
      category: "Genspark",
      amount: 1029461,
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
      date: "2026-06-10",
      department: "플랫폼개발팀(단독)",
      item: "Claude Team Plan",
      vendor: "ANTHROPIC* CLAUDE TEAM",
      category: "Claude/Anthropic",
      amount: 770562,
    },
    {
      date: "2026-05-11",
      department: "자금회계팀(공용)",
      item: "AI 이용료(USD 303)",
      vendor: "Anthropic Claude Team",
      category: "Claude/Anthropic",
      amount: 449481,
    },
    {
      date: "2026-05-17",
      department: "자금회계팀(공용)",
      item: "AI 이용료(USD274.99)",
      vendor: "MAINFUNC PTE. LTD.",
      category: "Genspark",
      amount: 424125,
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
  ],
};
