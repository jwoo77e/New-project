import { individualUtilizationData } from "./individualUtilizationData";

export type ExecutiveUsageSegment = {
  key: "power" | "regular" | "low" | "artifact";
  label: string;
  count: number;
  criteria: string;
  users: string[];
};

const eligibleEmployees = 41;
const leaveExcludedEmployees = 2;
const dedicatedToolUsers = 24;
const estimatedSeatCostKrw = 40_000;
const tokenReferenceMonth = "2026-07";
const powerUserThreshold = 1_000_000_000;
const lowUsageThreshold = 100_000_000;
const artifactTrackedUserNames = [
  "임성범 부장",
  "조주연 부장",
  "이형배 상무",
  "김대일 상무",
  "박연석 전무",
] as const;

const julySpend = individualUtilizationData.monthlySpend[tokenReferenceMonth];

if (!julySpend) {
  throw new Error("경영 인사이트에 필요한 2026년 7월 개인별 사용량이 없습니다.");
}

const userNameByEmail = new Map(
  individualUtilizationData.users.map((user) => [user.email, user.displayName]),
);
const julyTokenUsers = Object.entries(julySpend.users)
  .map(([email, usage]) => ({
    email,
    displayName: userNameByEmail.get(email) ?? email,
    totalTokens: usage.totalTokens,
  }))
  .sort((a, b) => b.totalTokens - a.totalTokens || a.displayName.localeCompare(b.displayName, "ko"));
const powerUsers = julyTokenUsers.filter((user) => user.totalTokens >= powerUserThreshold);
const lowUsageUsers = julyTokenUsers.filter((user) => user.totalTokens < lowUsageThreshold);
const regularUsers = julyTokenUsers.filter(
  (user) => user.totalTokens >= lowUsageThreshold && user.totalTokens < powerUserThreshold,
);
const measuredUserNames = individualUtilizationData.users
  .filter((user) => user.measurementStatus === "measured")
  .map((user) => user.displayName);
const trackedUsers = [...measuredUserNames, ...artifactTrackedUserNames];
const additionalSeats = eligibleEmployees - dedicatedToolUsers;
const incrementalMonthlyKrw = additionalSeats * estimatedSeatCostKrw;

export const executiveWorkforceInsightData = {
  source: {
    workforceBasis: `휴직자 ${leaveExcludedEmployees}명 제외 기준`,
    tokenPeriod: julySpend.period,
    tokenCoverage: julySpend.coverage,
    qualitativeBasis: "프로젝트 종료, 채팅 중심 사용, 하네스·스킬·Codex 병행 여부는 운영 확인 내용",
  },
  eligibleEmployees,
  leaveExcludedEmployees,
  dedicatedToolUsers,
  dedicatedToolCoverageRate: (dedicatedToolUsers / eligibleEmployees) * 100,
  uncoveredEmployees: additionalSeats,
  estimatedSeatCostKrw,
  incrementalMonthlyKrw,
  roundedInvestmentKrw: 700_000,
  projectedCoverageRate: 100,
  tokenMeasuredUsers: julyTokenUsers.length,
  powerUserThreshold,
  lowUsageThreshold,
  powerUsers: powerUsers.map((user) => user.displayName),
  lowUsageUsers: lowUsageUsers.map((user) => user.displayName),
  regularUsers: regularUsers.map((user) => user.displayName),
  artifactTrackedUsers: [...artifactTrackedUserNames],
  trackedUsers,
  usageSegments: [
    {
      key: "power",
      label: "고활용",
      count: powerUsers.length,
      criteria: "7월 토큰 1B 이상",
      users: powerUsers.map((user) => user.displayName),
    },
    {
      key: "regular",
      label: "일반 활용",
      count: regularUsers.length,
      criteria: "7월 토큰 100M 이상 1B 미만",
      users: regularUsers.map((user) => user.displayName),
    },
    {
      key: "low",
      label: "활용 미진",
      count: lowUsageUsers.length,
      criteria: "7월 토큰 100M 미만",
      users: lowUsageUsers.map((user) => user.displayName),
    },
    {
      key: "artifact",
      label: "산출 추적",
      count: artifactTrackedUserNames.length,
      criteria: "Drive 개인 산출 기준",
      users: [...artifactTrackedUserNames],
    },
  ] satisfies ExecutiveUsageSegment[],
  interpretations: {
    lowUsage: "프로젝트 완료에 따른 업무량 감소와 채팅 중심 사용이 공통 원인으로 파악됨",
    powerUsage: "하네스·스킬 등 AI 활용 지식을 보유하고 Codex를 병행해 산출물 품질을 개선하는 집단",
  },
} as const;
