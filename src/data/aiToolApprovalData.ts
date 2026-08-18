export type AiToolApprovalRecord = {
  no: number;
  category: "ChatGPT" | "Claude" | "Gemini" | "Genspark" | "Gamma" | "AI API";
  tool: string;
  account: string;
  linkedAccount: string;
  owner: string;
  department: string;
  monthlyUsd: number;
  monthlyKrw: number;
  billingCurrency?: "USD" | "KRW";
  startMonth?: string;
  pricingEffectiveMonth?: string;
  previousMonthlyUsd?: number;
  previousMonthlyKrw?: number;
  paymentMethod: string;
  note: string;
};

export type AiToolApprovalSummary = {
  key: string;
  count: number;
  monthlyUsd: number;
  monthlyKrw: number;
  share: number;
};

export type AiToolApprovalPersonCost = {
  name: string;
  departments: string[];
  itemCount: number;
  tools: string[];
  monthlyUsd: number;
  monthlyKrw: number;
};

export type AiToolApprovalPersonCostSummary = {
  people: AiToolApprovalPersonCost[];
  personCount: number;
  personalMonthlyUsd: number;
  personalMonthlyKrw: number;
  averageMonthlyKrw: number;
  sharedMonthlyUsd: number;
  sharedMonthlyKrw: number;
};

export type AiToolApprovalData = {
  source: {
    name: string;
    fileName: string;
    sheetName: string;
    collectedAt: string;
    period: string;
    note: string;
  };
  exchangeRate: number;
  totalAccounts: number;
  totalMonthlyUsd: number;
  totalMonthlyKrw: number;
  aiDedicatedCardAccounts: number;
  aiDedicatedCardKrw: number;
  namedCorporateCardAccounts: number;
  namedCorporateCardKrw: number;
  toolSummary: AiToolApprovalSummary[];
  categorySummary: AiToolApprovalSummary[];
  paymentSummary: AiToolApprovalSummary[];
  departmentSummary: AiToolApprovalSummary[];
  records: AiToolApprovalRecord[];
  insights: string[];
};

const exchangeRate = 1485;

const records: AiToolApprovalRecord[] = [
  {
    no: 1,
    category: "ChatGPT",
    tool: "chatGPT Pro(20배)",
    account: "riskzeroriskzero@gmail.com",
    linkedAccount: "없음",
    owner: "전사",
    department: "전사",
    monthlyUsd: 220,
    monthlyKrw: 326700,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 2,
    category: "ChatGPT",
    tool: "chatGPT Pro(20배)",
    account: "전략실장님 전용",
    linkedAccount: "없음",
    owner: "박연석 전무 / 전략실",
    department: "전략실",
    monthlyUsd: 220,
    monthlyKrw: 326700,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 3,
    category: "ChatGPT",
    tool: "chatGPT Business Plan",
    account: "jaewoo.kim@riskzero.kr",
    linkedAccount: "없음",
    owner: "김재우 부장 / 기술연구소",
    department: "기술연구소",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    pricingEffectiveMonth: "2026-08",
    previousMonthlyUsd: 110,
    previousMonthlyKrw: 163350,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 4,
    category: "ChatGPT",
    tool: "chatGPT Business Plan",
    account: "wody@riskzero.kr",
    linkedAccount: "없음",
    owner: "정재요 차장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    startMonth: "2026-08",
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 4,
    category: "ChatGPT",
    tool: "chatGPT Pro(5배)",
    account: "hbgptrz260806@gmail.com",
    linkedAccount: "없음",
    owner: "이형배 상무 / 기술연구소",
    department: "기술연구소",
    monthlyUsd: 110,
    monthlyKrw: 163350,
    startMonth: "2026-08",
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 4,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "조욱상 이사님 전용",
    linkedAccount: "없음",
    owner: "조욱상 이사 / 경영혁신팀",
    department: "경영혁신팀",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    pricingEffectiveMonth: "2026-08",
    previousMonthlyUsd: 110,
    previousMonthlyKrw: 163350,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 5,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "이병현 이사님 전용",
    linkedAccount: "없음",
    owner: "이병현 이사 / 자금회계팀",
    department: "자금회계팀",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    pricingEffectiveMonth: "2026-08",
    previousMonthlyUsd: 110,
    previousMonthlyKrw: 163350,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 6,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "infra@riskzero.kr",
    linkedAccount: "riskzero.research@gmail.com",
    owner: "이형배 상무 / 기술연구소",
    department: "기술연구소",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    pricingEffectiveMonth: "2026-08",
    previousMonthlyUsd: 110,
    previousMonthlyKrw: 163350,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 7,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "riskzero.marketing@gmail.com",
    linkedAccount: "riskzero.marketing@gmail.com",
    owner: "임성범 부장 / 전략사업팀",
    department: "전략사업팀",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    pricingEffectiveMonth: "2026-08",
    previousMonthlyUsd: 220,
    previousMonthlyKrw: 326700,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 9,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "전략실장님 전용",
    linkedAccount: "없음",
    owner: "박연석 전무 / 전략실",
    department: "전략실",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    pricingEffectiveMonth: "2026-08",
    previousMonthlyUsd: 220,
    previousMonthlyKrw: 326700,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 10,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "연구소장님 전용",
    linkedAccount: "없음",
    owner: "김대일 상무 / 기술연구소",
    department: "기술연구소",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    pricingEffectiveMonth: "2026-08",
    previousMonthlyUsd: 220,
    previousMonthlyKrw: 326700,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 11,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "jaewoo.kim@riskzero.kr",
    linkedAccount: "없음",
    owner: "김재우 부장 / 기술연구소",
    department: "기술연구소",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 12,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "sieghaft@riskzero.kr",
    linkedAccount: "없음",
    owner: "김성진 부장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 13,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "sjlim@riskzero.kr",
    linkedAccount: "없음",
    owner: "임성진 부장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 14,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "wody@riskzero.kr",
    linkedAccount: "없음",
    owner: "정재요 차장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 15,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "mjkim1122@riskzero.kr",
    linkedAccount: "없음",
    owner: "김민정 차장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 16,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "huizhen0227@riskzero.kr",
    linkedAccount: "없음",
    owner: "김혜진 과장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 17,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "hhlee0227@riskzero.kr",
    linkedAccount: "없음",
    owner: "이한호 대리 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 18,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "rkgmf1230@riskzero.kr",
    linkedAccount: "없음",
    owner: "김가홀 대리 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 19,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "jungyr98@riskzero.kr",
    linkedAccount: "없음",
    owner: "정유라 사원 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 20,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "mygu@riskzero.kr",
    linkedAccount: "없음",
    owner: "구문영 사원 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 21,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "hchbae1001@riskzero.kr",
    linkedAccount: "없음",
    owner: "배현철 사원 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 22,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "staycurious@riskzero.kr",
    linkedAccount: "없음",
    owner: "김하나 과장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 23,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "woosung.jeon@riskzero.kr",
    linkedAccount: "없음",
    owner: "전우성 부장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 24,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "kys0392@riskzero.kr",
    linkedAccount: "없음",
    owner: "김영산 과장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 25,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "jhpark@riskzero.kr",
    linkedAccount: "없음",
    owner: "박재현 상무 / 플랫폼 개발",
    department: "플랫폼 개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 26,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "ykchj1011@riskzero.kr",
    linkedAccount: "없음",
    owner: "윤영관 과장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 27,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "crow326@riskzero.kr",
    linkedAccount: "없음",
    owner: "박정원 차장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 28,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "jisub1221@riskzero.kr",
    linkedAccount: "없음",
    owner: "심지섭 대리 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 29,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "mjlee0828@riskzero.kr",
    linkedAccount: "없음",
    owner: "이민재 부장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 30,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "dhlee@riskzero.kr",
    linkedAccount: "없음",
    owner: "이동훈 부장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 31,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "sjpark@riskzero.kr",
    linkedAccount: "없음",
    owner: "박수진 과장 / 미기재",
    department: "미기재",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    startMonth: "2026-08",
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 32,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "songinna@riskzero.kr",
    linkedAccount: "없음",
    owner: "송인나 대리 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    startMonth: "2026-08",
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  ...[
    ["Claude Team Plan Standard", "조주연 부장님 전용", "조주연 부장 / 전략사업팀", "전략사업팀", 25, 37125],
    ["Claude Team Plan Standard", "doyul@riskzero.kr", "김도율 차장 / 스마트서비스", "스마트서비스", 25, 37125],
    ["Claude Team Plan Standard", "최종윤 이사님 전용", "최종윤 이사 / 플랫폼개발", "플랫폼개발", 25, 37125],
    ["Claude Team Plan Standard", "최용호 대리님 전용", "최용호 대리 / 스마트서비스", "스마트서비스", 25, 37125],
    ["Claude Team Plan Standard", "강훈 부장님 전용", "강훈 부장 / 스마트서비스", "스마트서비스", 25, 37125],
    ["Claude Team Plan Standard", "강재민 사원님 전용", "강재민 사원 / 스마트서비스", "스마트서비스", 25, 37125],
    ["Claude Team Plan Standard", "김진희 과장님 전용", "김진희 과장 / 스마트서비스", "스마트서비스", 25, 37125],
    ["Claude Team Plan Standard", "고원상 대리님 전용", "고원상 대리 / 스마트서비스", "스마트서비스", 25, 37125],
    ["Claude Team Plan Standard", "이창섭 부장님 전용", "이창섭 부장 / 플랫폼개발", "플랫폼개발", 25, 37125],
    ["Claude Team Plan Standard", "이진욱 부장님 전용", "이진욱 부장 / 스마트서비스", "스마트서비스", 25, 37125],
    ["Claude Team Plan Standard", "박명수 과장님 전용", "박명수 과장 / 스마트서비스", "스마트서비스", 25, 37125],
    ["Claude Team Plan Standard", "윤종호 부장님 전용", "윤종호 부장 / 플랫폼개발", "플랫폼개발", 25, 37125],
    ["Claude Team Plan Premium", "james@riskzero.kr", "대표님", "대표님", 125, 185625],
  ].map(([tool, account, owner, department, monthlyUsd, monthlyKrw], index) => ({
    no: 33 + index,
    category: "Claude" as const,
    tool: tool as string,
    account: account as string,
    linkedAccount: "없음",
    owner: owner as string,
    department: department as string,
    monthlyUsd: monthlyUsd as number,
    monthlyKrw: monthlyKrw as number,
    startMonth: "2026-08",
    paymentMethod: "AI 전용 카드",
    note: "",
  })),
  {
    no: 33,
    category: "Gemini",
    tool: "Gemini(Google Workspace)",
    account: "james@riskzero.kr",
    linkedAccount: "james@riskzero.kr",
    owner: "대표님",
    department: "대표님",
    monthlyUsd: 15.12,
    monthlyKrw: 22453.2,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 33,
    category: "Gemini",
    tool: "Gemini(Google Workspace)",
    account: "bigone@riskzero.kr",
    linkedAccount: "bigone@riskzero.kr",
    owner: "김대일 상무 / 기술연구소",
    department: "기술연구소",
    monthlyUsd: 15.12,
    monthlyKrw: 22453.2,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 34,
    category: "Gemini",
    tool: "Gemini(Google Workspace)",
    account: "riskzero@riskzero.kr",
    linkedAccount: "riskzero@riskzero.kr",
    owner: "회사대표계정",
    department: "회사대표계정",
    monthlyUsd: 15.12,
    monthlyKrw: 22453.2,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 35,
    category: "Gemini",
    tool: "Gemini(Google Workspace)",
    account: "전략실장님 전용",
    linkedAccount: "없음",
    owner: "박연석 전무 / 전략실",
    department: "전략실",
    monthlyUsd: 15.12,
    monthlyKrw: 22453.2,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 36,
    category: "Gemini",
    tool: "Gemini(Google Workspace)",
    account: "ai.smartservice@riskzero.kr",
    linkedAccount: "doyul@riskzero.kr",
    owner: "김도율 차장 / 스마트서비스",
    department: "스마트서비스",
    monthlyUsd: 15.12,
    monthlyKrw: 22453.2,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 37,
    category: "Genspark",
    tool: "Genspark Pro",
    account: "riskzero.marketing@gmail.com",
    linkedAccount: "riskzero.marketing@gmail.com",
    owner: "임성범 부장 / 전략사업팀",
    department: "전략사업팀",
    monthlyUsd: 274.99,
    monthlyKrw: 408360.15,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 38,
    category: "Gamma",
    tool: "Gamma AI Pro",
    account: "riskzero.marketing@gmail.com",
    linkedAccount: "없음",
    owner: "조주연 부장 / 전략사업팀",
    department: "전략사업팀",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 39,
    category: "AI API",
    tool: "GH AI Agent AI API 서비스",
    account: "GH AI Agent 개발",
    linkedAccount: "없음",
    owner: "GH AI Agent 개발 / 플랫폼개발팀",
    department: "플랫폼개발",
    monthlyUsd: 0,
    monthlyKrw: 1_500_000,
    billingCurrency: "KRW",
    startMonth: "2026-08",
    paymentMethod: "AI 전용 카드",
    note: "",
  },
];

const normalizedRecords = records.map((record, index) => ({ ...record, no: index + 1 }));
const totalMonthlyUsd = sum(records, "monthlyUsd");
const totalMonthlyKrw = sum(records, "monthlyKrw");
const paymentSummary = summarize(records, "paymentMethod", totalMonthlyKrw);
const toolSummary = summarize(records, "tool", totalMonthlyKrw);
const categorySummary = summarize(records, "category", totalMonthlyKrw);
const departmentSummary = summarize(records, "department", totalMonthlyKrw);
const aiDedicatedCard = paymentSummary.find((item) => item.key === "AI 전용 카드");
const namedCorporateCard = paymentSummary.find((item) => item.key === "공용 법인 카드");
const claudeCategory = categorySummary.find((item) => item.key === "Claude");
const apiFixedCategory = categorySummary.find((item) => item.key === "AI API");

export const initialAiToolApprovalData: AiToolApprovalData = {
  source: {
    name: "사내 AI도구 결재 현황",
    fileName: "사내 AI도구 현황조사표_V3.0.xlsx",
    sheetName: "전사 AI도구 현황조사표",
    collectedAt: "2026-08-18",
    period: "2026년 8월 월 고정비 기준 · USD 1 = 1,485원",
    note: "계정 ID, 주사용자/부서, 구독료, 결재수단과 적용 시작월을 반영했으며 직원 40명 Team Plan 보급과 대표님 Premium 1석, 플랫폼개발팀 GH AI Agent 개발용 AI API 서비스 고정비 150만원을 포함",
  },
  exchangeRate,
  totalAccounts: records.length,
  totalMonthlyUsd,
  totalMonthlyKrw,
  aiDedicatedCardAccounts: aiDedicatedCard?.count ?? 0,
  aiDedicatedCardKrw: aiDedicatedCard?.monthlyKrw ?? 0,
  namedCorporateCardAccounts: namedCorporateCard?.count ?? 0,
  namedCorporateCardKrw: namedCorporateCard?.monthlyKrw ?? 0,
  toolSummary,
  categorySummary,
  paymentSummary,
  departmentSummary,
  records: normalizedRecords,
  insights: [
    `등록된 AI 도구 결재 항목은 ${records.length}개이며 8월 월 고정비 합계는 ${formatKrw(totalMonthlyKrw)}입니다. USD 결재 항목 합계는 ${formatUsd(totalMonthlyUsd)}입니다.`,
    `AI 전용 카드 결재가 ${aiDedicatedCard?.count ?? 0}개 항목, ${formatKrw(aiDedicatedCard?.monthlyKrw ?? 0)}으로 전체 월액의 ${(aiDedicatedCard?.share ?? 0).toFixed(1)}%를 차지합니다.`,
    `2026년 8월부터 플랫폼개발팀 GH AI Agent 개발용 AI API 서비스 고정비 ${formatKrw(apiFixedCategory?.monthlyKrw ?? 0)}을 매월 반영합니다.`,
    "기존 공용 법인 카드 2개 항목은 모두 AI 전용 카드로 전환했습니다.",
    `Claude 계열은 ${claudeCategory?.count ?? 0}개 계정, ${formatKrw(claudeCategory?.monthlyKrw ?? 0)}으로 수량과 비용 모두 가장 큰 결재 묶음입니다.`,
    "변경 반영: 김하나 과장과 전우성 부장의 Claude Team Plan을 Standard에서 Premium으로 변경했습니다.",
    "변경 반영: 구문영 사원의 Claude Team Plan을 Standard에서 Premium으로 변경하고 월 고정비 예산을 조정했습니다.",
    "변경 반영: 이동훈 부장에게 Claude Team Plan Standard를 할당하고 월 고정비 예산을 조정했습니다.",
    "변경 반영: 박수진 과장과 송인나 대리에게 Claude Team Plan Standard를 2026년 8월부터 할당하고 월 고정비 예산을 조정했습니다.",
    "변경 반영: riskzeroriskzero@gmail.com의 chatGPT Pro를 5배에서 20배로 변경하고 월 고정비 예산을 조정했습니다.",
    "변경 반영: 이형배 상무에게 chatGPT Pro(5배)를 2026년 8월부터 추가하고 월 고정비 예산을 조정했습니다.",
    "변경 반영: 김재우 부장의 chatGPT Pro(5배)를 Business Plan으로 전환하고 정재요 차장에게 Business Plan을 추가했습니다.",
    "변경 반영: 임성범 부장과 이형배 상무는 Claude Team Plan Standard로, 박연석 전무·김대일 상무·이병현 이사·조욱상 이사는 Premium으로 전환했습니다.",
    "변경 반영: 직원 대상 Claude Team Plan 40석과 대표님 Premium 1석을 반영해 직원 보급률 100% 기준으로 월 고정비를 조정했습니다.",
  ],
};

export function approvalMonthlyTotalsForMonth(
  approvalData: AiToolApprovalData,
  month: string,
) {
  const activeRecords = approvalData.records.filter(
    (record) => !record.startMonth || record.startMonth <= month,
  );

  const pricedRecords = activeRecords.map((record) => {
    if (
      record.pricingEffectiveMonth &&
      month < record.pricingEffectiveMonth &&
      record.previousMonthlyUsd !== undefined &&
      record.previousMonthlyKrw !== undefined
    ) {
      return {
        ...record,
        monthlyUsd: record.previousMonthlyUsd,
        monthlyKrw: record.previousMonthlyKrw,
      };
    }

    return record;
  });

  return {
    records: pricedRecords,
    count: activeRecords.length,
    monthlyUsd: sum(pricedRecords, "monthlyUsd"),
    monthlyKrw: sum(pricedRecords, "monthlyKrw"),
  };
}

export function buildApprovalPersonCostSummary(
  recordsToSummarize: AiToolApprovalRecord[],
): AiToolApprovalPersonCostSummary {
  const people = new Map<
    string,
    Omit<AiToolApprovalPersonCost, "departments" | "tools"> & {
      departments: Set<string>;
      tools: Set<string>;
    }
  >();
  const sharedRecords: AiToolApprovalRecord[] = [];

  for (const record of recordsToSummarize) {
    if (isSharedApprovalRecord(record)) {
      sharedRecords.push(record);
      continue;
    }

    const name = record.owner.split("/")[0]?.trim() || record.owner;
    const current = people.get(name) ?? {
      name,
      departments: new Set<string>(),
      itemCount: 0,
      tools: new Set<string>(),
      monthlyUsd: 0,
      monthlyKrw: 0,
    };

    current.departments.add(record.department);
    current.itemCount += 1;
    current.tools.add(record.tool);
    current.monthlyUsd += record.monthlyUsd;
    current.monthlyKrw += record.monthlyKrw;
    people.set(name, current);
  }

  const personCosts = [...people.values()]
    .map((person) => ({
      ...person,
      departments: [...person.departments].sort((a, b) => a.localeCompare(b, "ko")),
      tools: [...person.tools],
      monthlyUsd: roundMoney(person.monthlyUsd),
      monthlyKrw: roundMoney(person.monthlyKrw),
    }))
    .sort((a, b) => b.monthlyKrw - a.monthlyKrw || a.name.localeCompare(b.name, "ko"));
  const personalMonthlyUsd = roundMoney(personCosts.reduce((total, person) => total + person.monthlyUsd, 0));
  const personalMonthlyKrw = roundMoney(personCosts.reduce((total, person) => total + person.monthlyKrw, 0));

  return {
    people: personCosts,
    personCount: personCosts.length,
    personalMonthlyUsd,
    personalMonthlyKrw,
    averageMonthlyKrw: personCosts.length ? roundMoney(personalMonthlyKrw / personCosts.length) : 0,
    sharedMonthlyUsd: sum(sharedRecords, "monthlyUsd"),
    sharedMonthlyKrw: sum(sharedRecords, "monthlyKrw"),
  };
}

function isSharedApprovalRecord(record: AiToolApprovalRecord) {
  return (
    record.owner === "전사" ||
    record.owner === "회사대표계정" ||
    record.owner.startsWith("GH AI Agent 개발")
  );
}

function summarize(recordsToSummarize: AiToolApprovalRecord[], key: keyof AiToolApprovalRecord, denominatorKrw: number) {
  const summary = new Map<string, AiToolApprovalSummary>();

  for (const record of recordsToSummarize) {
    const summaryKey = String(record[key] || "미기재");
    const current = summary.get(summaryKey) ?? {
      key: summaryKey,
      count: 0,
      monthlyUsd: 0,
      monthlyKrw: 0,
      share: 0,
    };
    current.count += 1;
    current.monthlyUsd += record.monthlyUsd;
    current.monthlyKrw += record.monthlyKrw;
    summary.set(summaryKey, current);
  }

  return [...summary.values()]
    .map((item) => ({
      ...item,
      monthlyUsd: roundMoney(item.monthlyUsd),
      monthlyKrw: roundMoney(item.monthlyKrw),
      share: denominatorKrw ? (item.monthlyKrw / denominatorKrw) * 100 : 0,
    }))
    .sort((a, b) => b.monthlyKrw - a.monthlyKrw);
}

function sum(recordsToSum: AiToolApprovalRecord[], field: "monthlyUsd" | "monthlyKrw") {
  return roundMoney(recordsToSum.reduce((total, record) => total + record[field], 0));
}

function formatUsd(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatKrw(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
