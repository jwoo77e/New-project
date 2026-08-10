import { initialAiToolApprovalData, type AiToolApprovalRecord } from "./aiToolApprovalData";
import { individualUtilizationData } from "./individualUtilizationData";

export type ExecutiveUsageSegment = {
  key: "power" | "regular" | "low";
  label: string;
  count: number;
  criteria: string;
  users: string[];
};

type TeamPlanConversionAccount = {
  name: string;
  account: string;
  currentPlan: string;
  currentMonthlyKrw: number;
};

const eligibleEmployees = 41;
const leaveExcludedEmployees = 2;
const tokenReferenceMonth = "2026-07";
const powerUserThreshold = 1_000_000_000;
const lowUsageThreshold = 100_000_000;
const teamPlanStandardUsd = 25;
const teamPlanStandardKrw = 37_125;
const tokenPendingUsers = [
  { name: "이동훈 부장", email: "dhlee@riskzero.kr" },
  { name: "박수진 과장", email: "sjpark@riskzero.kr" },
  { name: "송인나 대리", email: "songinna@riskzero.kr" },
] as const;

const julySpend = individualUtilizationData.monthlySpend[tokenReferenceMonth];

if (!julySpend) {
  throw new Error("경영 인사이트에 필요한 2026년 7월 개인별 사용량이 없습니다.");
}

const approvalRecords = initialAiToolApprovalData.records;
const teamPlanRecords = approvalRecords.filter((record) => record.tool.startsWith("Claude Team Plan"));
const teamPlanStandardUsers = teamPlanRecords.filter((record) => record.tool.endsWith("Standard")).length;
const teamPlanPremiumUsers = teamPlanRecords.filter((record) => record.tool.endsWith("Premium")).length;
const teamPlanUsers = teamPlanRecords.length;

function findClaudeRecord(predicate: (record: AiToolApprovalRecord) => boolean, description: string) {
  const record = approvalRecords.find(
    (candidate) => candidate.category === "Claude" && predicate(candidate),
  );

  if (!record) {
    throw new Error(`경영 인사이트에 필요한 Claude 결재 항목이 없습니다: ${description}`);
  }

  return record;
}

function toConversionAccount(record: AiToolApprovalRecord, name: string): TeamPlanConversionAccount {
  return {
    name,
    account: record.account,
    currentPlan: record.tool,
    currentMonthlyKrw: record.monthlyKrw,
  };
}

const personalConversionAccounts = [
  toConversionAccount(
    findClaudeRecord((record) => record.owner.startsWith("박연석 전무"), "박연석 전무 개인 계정"),
    "박연석 전무",
  ),
  toConversionAccount(
    findClaudeRecord((record) => record.owner.startsWith("김대일 상무"), "김대일 상무 개인 계정"),
    "김대일 상무",
  ),
] as const;
const sharedConversionAccounts = [
  toConversionAccount(
    findClaudeRecord((record) => record.account === "riskzero.marketing@gmail.com", "전략사업팀 공용 계정"),
    "전략사업팀",
  ),
  toConversionAccount(
    findClaudeRecord((record) => record.account === "infra@riskzero.kr", "기술연구소 공용 계정"),
    "기술연구소",
  ),
] as const;
const conversionSeats = personalConversionAccounts.length + sharedConversionAccounts.length;
const pureAdditionalSeats = eligibleEmployees - teamPlanUsers - conversionSeats;
const totalTeamPlanActions = conversionSeats + pureAdditionalSeats;
const currentConversionCostKrw = [...personalConversionAccounts, ...sharedConversionAccounts]
  .reduce((sum, account) => sum + account.currentMonthlyKrw, 0);
const proposedConversionCostKrw = conversionSeats * teamPlanStandardKrw;
const pureAdditionalCostKrw = pureAdditionalSeats * teamPlanStandardKrw;
const proposedTeamPlanActionCostKrw = proposedConversionCostKrw + pureAdditionalCostKrw;
const netMonthlyChangeKrw = proposedTeamPlanActionCostKrw - currentConversionCostKrw;

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
const tokenMeasuredUsers = julyTokenUsers.length;
const tokenMeasurementTarget = tokenMeasuredUsers + tokenPendingUsers.length;

export const executiveWorkforceInsightData = {
  source: {
    workforceBasis: `휴직자 ${leaveExcludedEmployees}명 제외 기준`,
    tokenPeriod: julySpend.period,
    tokenCoverage: julySpend.coverage,
    teamPlanBasis: `${initialAiToolApprovalData.source.collectedAt} AI 도구 결재 현황`,
    conversionAssumption: "전환 및 신규 좌석은 Claude Team Plan Standard 기준 시나리오",
  },
  eligibleEmployees,
  leaveExcludedEmployees,
  teamPlanUsers,
  teamPlanStandardUsers,
  teamPlanPremiumUsers,
  teamPlanCoverageRate: (teamPlanUsers / eligibleEmployees) * 100,
  personalConversionAccounts,
  sharedConversionAccounts,
  conversionSeats,
  pureAdditionalSeats,
  totalTeamPlanActions,
  teamPlanStandardUsd,
  teamPlanStandardKrw,
  currentConversionCostKrw,
  proposedConversionCostKrw,
  pureAdditionalCostKrw,
  proposedTeamPlanActionCostKrw,
  netMonthlyChangeKrw,
  projectedCoverageRate: 100,
  tokenMeasuredUsers,
  tokenMeasurementTarget,
  tokenMeasurementCoverageRate: (tokenMeasuredUsers / tokenMeasurementTarget) * 100,
  tokenPendingUsers,
  powerUserThreshold,
  lowUsageThreshold,
  powerUsers: powerUsers.map((user) => user.displayName),
  lowUsageUsers: lowUsageUsers.map((user) => user.displayName),
  regularUsers: regularUsers.map((user) => user.displayName),
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
  ] satisfies ExecutiveUsageSegment[],
  lowUsageReason: "업무량 감소 및 Chat을 통한 검색·질의 중심 사용으로 토큰 활용이 미진함",
  evaluationFramework: {
    developer: {
      label: "개발자",
      measures: ["토큰 사용량", "생성 Code Lines"],
      description: "AI 사용 강도와 코드 산출량을 함께 확인",
    },
    nonDeveloper: {
      label: "비개발자",
      measures: ["토큰 사용량", "생성 결과물"],
      description: "AI 사용 강도와 업무 결과물 수를 함께 확인",
    },
  },
} as const;
