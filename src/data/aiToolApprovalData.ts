export type AiToolApprovalRecord = {
  no: number;
  category: "ChatGPT" | "Claude" | "Gemini" | "Genspark" | "Gamma";
  tool: string;
  account: string;
  linkedAccount: string;
  owner: string;
  department: string;
  monthlyUsd: number;
  monthlyKrw: number;
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
    note: "gpt5.5 사용 요청으로 증량",
  },
  {
    no: 3,
    category: "Claude",
    tool: "Claude Pro Max 5",
    account: "조욱상 이사님 전용",
    linkedAccount: "없음",
    owner: "조욱상 이사 / 경영혁신팀",
    department: "경영혁신팀",
    monthlyUsd: 110,
    monthlyKrw: 163350,
    paymentMethod: "AI 전용 카드",
    note: "신규",
  },
  {
    no: 4,
    category: "Claude",
    tool: "Claude Pro Max 5",
    account: "이병헌 이사님 전용",
    linkedAccount: "없음",
    owner: "이병헌 이사 / 자금회계팀",
    department: "자금회계팀",
    monthlyUsd: 110,
    monthlyKrw: 163350,
    paymentMethod: "AI 전용 카드",
    note: "신규",
  },
  {
    no: 5,
    category: "Claude",
    tool: "Claude Pro Max 5",
    account: "infra@riskzero.kr",
    linkedAccount: "riskzero.research@gmail.com",
    owner: "이형배 상무 / 기술연구소",
    department: "기술연구소",
    monthlyUsd: 110,
    monthlyKrw: 163350,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 6,
    category: "Claude",
    tool: "Claude Pro Max 5",
    account: "riskzero.marketing@gmail.com",
    linkedAccount: "riskzero.marketing@gmail.com",
    owner: "임성범 부장 / 전략사업팀",
    department: "전략사업팀",
    monthlyUsd: 110,
    monthlyKrw: 163350,
    paymentMethod: "AI 전용 카드",
    note: "전략사업팀 신규",
  },
  {
    no: 7,
    category: "Claude",
    tool: "Claude Pro Max 5",
    account: "박재현 상무님 전용",
    linkedAccount: "없음",
    owner: "박재현 상무 / 전략실",
    department: "전략실",
    monthlyUsd: 110,
    monthlyKrw: 163350,
    paymentMethod: "AI 전용 카드",
    note: "신규 · 박재현 상무 전용",
  },
  {
    no: 8,
    category: "Claude",
    tool: "Claude Pro Max 20",
    account: "전략실장님 전용",
    linkedAccount: "없음",
    owner: "박연석 전무 / 전략실",
    department: "전략실",
    monthlyUsd: 220,
    monthlyKrw: 326700,
    paymentMethod: "기명법인카드",
    note: "",
  },
  {
    no: 9,
    category: "Claude",
    tool: "Claude Pro Max 20",
    account: "연구소장님 전용",
    linkedAccount: "없음",
    owner: "김대일 상무 / 기술연구소",
    department: "기술연구소",
    monthlyUsd: 220,
    monthlyKrw: 326700,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 10,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "jaewoo.kim@riskzero.kr",
    linkedAccount: "없음",
    owner: "김재우 부장 / 기술연구소",
    department: "기술연구소",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 11,
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
    no: 12,
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
    no: 13,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "wody@riskzero.kr",
    linkedAccount: "없음",
    owner: "정재요 차장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    paymentMethod: "AI 전용 카드",
    note: "하네스 사용 등 Advanced User",
  },
  {
    no: 14,
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
    no: 15,
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
    no: 16,
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
    no: 17,
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
    no: 18,
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
    no: 19,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "mygu@riskzero.kr",
    linkedAccount: "없음",
    owner: "구문영 사원 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "신규",
  },
  {
    no: 20,
    category: "Claude",
    tool: "Claude Team Plan Premium",
    account: "hchbae1001@riskzero.kr",
    linkedAccount: "없음",
    owner: "배현철 사원 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 125,
    monthlyKrw: 185625,
    paymentMethod: "AI 전용 카드",
    note: "신규 · Standard에서 Premium으로 변경",
  },
  {
    no: 21,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "staycurious@riskzero.kr",
    linkedAccount: "없음",
    owner: "김하나 과장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "신규",
  },
  {
    no: 22,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "woosung.jeon@riskzero.kr",
    linkedAccount: "없음",
    owner: "전우성 부장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "신규",
  },
  {
    no: 23,
    category: "Claude",
    tool: "Claude Team Plan Standard",
    account: "kys0392@riskzero.kr",
    linkedAccount: "없음",
    owner: "김영산 과장 / 플랫폼개발",
    department: "플랫폼개발",
    monthlyUsd: 25,
    monthlyKrw: 37125,
    paymentMethod: "AI 전용 카드",
    note: "신규",
  },
  {
    no: 24,
    category: "Gemini",
    tool: "Gemini(Google Workspace)",
    account: "ai.marketing@riskzero.kr",
    linkedAccount: "ai.marketing@riskzero.kr",
    owner: "조주연 부장 / 전략사업팀",
    department: "전략사업팀",
    monthlyUsd: 15.12,
    monthlyKrw: 22453.2,
    paymentMethod: "AI 전용 카드",
    note: "",
  },
  {
    no: 25,
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
    no: 26,
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
    no: 27,
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
    no: 28,
    category: "Gemini",
    tool: "Gemini(Google Workspace)",
    account: "전략실장님 전용",
    linkedAccount: "없음",
    owner: "박연석 전무 / 전략실",
    department: "전략실",
    monthlyUsd: 15.12,
    monthlyKrw: 22453.2,
    paymentMethod: "기명법인카드",
    note: "",
  },
  {
    no: 29,
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
    no: 30,
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
];

const totalMonthlyUsd = sum(records, "monthlyUsd");
const totalMonthlyKrw = sum(records, "monthlyKrw");
const paymentSummary = summarize(records, "paymentMethod", totalMonthlyKrw);
const aiDedicatedCard = paymentSummary.find((item) => item.key === "AI 전용 카드");
const namedCorporateCard = paymentSummary.find((item) => item.key === "기명법인카드");

export const initialAiToolApprovalData: AiToolApprovalData = {
  source: {
    name: "사내 AI도구 결재 현황",
    fileName: "사내 AI도구 현황조사표_V3.0.xlsx",
    sheetName: "전사 AI도구 현황조사표",
    collectedAt: "2026-06-13",
    period: "월 구독 기준 · USD 1 = 1,485원",
    note: "계정 ID, 주사용자/부서, 구독료, 결재수단, 비고를 반영했으며 비밀번호와 이중인증 전화번호는 결재 현황 지표에서 제외",
  },
  exchangeRate,
  totalAccounts: records.length,
  totalMonthlyUsd,
  totalMonthlyKrw,
  aiDedicatedCardAccounts: aiDedicatedCard?.count ?? 0,
  aiDedicatedCardKrw: aiDedicatedCard?.monthlyKrw ?? 0,
  namedCorporateCardAccounts: namedCorporateCard?.count ?? 0,
  namedCorporateCardKrw: namedCorporateCard?.monthlyKrw ?? 0,
  toolSummary: summarize(records, "tool", totalMonthlyKrw),
  categorySummary: summarize(records, "category", totalMonthlyKrw),
  paymentSummary,
  departmentSummary: summarize(records, "department", totalMonthlyKrw),
  records,
  insights: [
    "등록된 AI 도구 결재 계정은 30개이며 월 구독료 합계는 $2,355.59 / 3,498,051원입니다.",
    "AI 전용 카드 결재가 28개 계정, 3,148,898원으로 전체 월액의 90.0%를 차지합니다.",
    "기명법인카드는 2개 계정, 349,153원이며 전략실 전용 Claude·Gemini 항목에 집중되어 있습니다.",
    "Claude 계열은 21개 계정, 2,286,900원으로 수량과 비용 모두 가장 큰 결재 묶음입니다.",
  ],
};

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

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
