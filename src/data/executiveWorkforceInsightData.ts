import { initialAiToolApprovalData } from "./aiToolApprovalData";
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

const eligibleEmployees = 40;
const leaveExcludedEmployees = 2;
const departedEmployees = 1;
const tokenReferenceMonth = "2026-07";
const powerUserThreshold = 1_000_000_000;
const lowUsageThreshold = 100_000_000;
const teamPlanStandardUsd = 25;
const teamPlanStandardKrw = 37_125;
const teamPlanPremiumUsd = 125;
const teamPlanPremiumKrw = 185_625;
const julySpend = individualUtilizationData.monthlySpend[tokenReferenceMonth];

if (!julySpend) {
  throw new Error("경영 인사이트에 필요한 2026년 7월 개인별 사용량이 없습니다.");
}

const approvalRecords = initialAiToolApprovalData.records;
const teamPlanRecords = approvalRecords.filter((record) => record.tool.startsWith("Claude Team Plan"));
const workforceTeamPlanRecords = teamPlanRecords.filter((record) => record.owner !== "대표님");
const executiveTeamPlanSeats = teamPlanRecords.length - workforceTeamPlanRecords.length;
const teamPlanStandardUsers = workforceTeamPlanRecords.filter((record) => record.tool.endsWith("Standard")).length;
const teamPlanPremiumUsers = workforceTeamPlanRecords.filter((record) => record.tool.endsWith("Premium")).length;
const teamPlanUsers = workforceTeamPlanRecords.length;
const personalConversionAccounts: TeamPlanConversionAccount[] = [];
const sharedConversionAccounts: TeamPlanConversionAccount[] = [];
const conversionSeats = personalConversionAccounts.length + sharedConversionAccounts.length;
const pureAdditionalSeats = Math.max(eligibleEmployees - teamPlanUsers - conversionSeats, 0);
const totalTeamPlanActions = conversionSeats + pureAdditionalSeats;
const currentConversionCostKrw = [...personalConversionAccounts, ...sharedConversionAccounts]
  .reduce((sum, account) => sum + account.currentMonthlyKrw, 0);
const proposedConversionCostKrw = conversionSeats * teamPlanPremiumKrw;
const pureAdditionalCostKrw = pureAdditionalSeats * teamPlanStandardKrw;
const proposedTeamPlanActionCostKrw = proposedConversionCostKrw + pureAdditionalCostKrw;
const netMonthlyChangeKrw = proposedTeamPlanActionCostKrw - currentConversionCostKrw;
const projectedMonthlyKrw = initialAiToolApprovalData.totalMonthlyKrw + netMonthlyChangeKrw;

if (teamPlanUsers !== eligibleEmployees) {
  throw new Error(`직원 Team Plan 보급 인원이 ${teamPlanUsers}/${eligibleEmployees}명으로 일치하지 않습니다.`);
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
const measuredTokenEmails = new Set(julyTokenUsers.map((user) => user.email.toLowerCase()));
const tokenPendingUsers = teamPlanRecords
  .filter((record) => !measuredTokenEmails.has(record.account.toLowerCase()))
  .map((record) => ({
    name: record.owner.split("/")[0]?.trim() || record.owner,
    email: record.account,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "ko"));
const powerUsers = julyTokenUsers.filter((user) => user.totalTokens >= powerUserThreshold);
const lowUsageUsers = julyTokenUsers.filter((user) => user.totalTokens < lowUsageThreshold);
const regularUsers = julyTokenUsers.filter(
  (user) => user.totalTokens >= lowUsageThreshold && user.totalTokens < powerUserThreshold,
);
const tokenMeasuredUsers = julyTokenUsers.length;
const tokenMeasurementTarget = teamPlanRecords.length;

if (tokenMeasuredUsers + tokenPendingUsers.length !== tokenMeasurementTarget) {
  throw new Error(
    `토큰 측정 대상이 측정 ${tokenMeasuredUsers}명 + 대기 ${tokenPendingUsers.length}명과 일치하지 않습니다.`,
  );
}

export const executiveWorkforceInsightData = {
  source: {
    workforceBasis: `휴직자 ${leaveExcludedEmployees}명·퇴사자 ${departedEmployees}명 제외 기준`,
    tokenPeriod: julySpend.period,
    tokenCoverage: julySpend.coverage,
    teamPlanBasis: `${initialAiToolApprovalData.source.collectedAt} AI 도구 결재 현황`,
    conversionAssumption: `직원 ${eligibleEmployees}명 Team Plan 보급 완료 · 대표님 Premium ${executiveTeamPlanSeats}석 별도`,
  },
  eligibleEmployees,
  leaveExcludedEmployees,
  departedEmployees,
  teamPlanUsers,
  teamPlanStandardUsers,
  teamPlanPremiumUsers,
  executiveTeamPlanSeats,
  teamPlanCoverageRate: (teamPlanUsers / eligibleEmployees) * 100,
  personalConversionAccounts,
  sharedConversionAccounts,
  conversionSeats,
  pureAdditionalSeats,
  totalTeamPlanActions,
  teamPlanStandardUsd,
  teamPlanStandardKrw,
  teamPlanPremiumUsd,
  teamPlanPremiumKrw,
  currentConversionCostKrw,
  proposedConversionCostKrw,
  pureAdditionalCostKrw,
  proposedTeamPlanActionCostKrw,
  netMonthlyChangeKrw,
  projectedMonthlyKrw,
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
      label: "높은 활동량",
      count: powerUsers.length,
      criteria: "7월 토큰 1B 이상",
      users: powerUsers.map((user) => user.displayName),
    },
    {
      key: "regular",
      label: "중간 활동량",
      count: regularUsers.length,
      criteria: "7월 토큰 100M 이상 1B 미만",
      users: regularUsers.map((user) => user.displayName),
    },
    {
      key: "low",
      label: "낮은 활동량",
      count: lowUsageUsers.length,
      criteria: "7월 토큰 100M 미만",
      users: lowUsageUsers.map((user) => user.displayName),
    },
  ] satisfies ExecutiveUsageSegment[],
  lowUsageReason: "업무량 감소, 질의 및 검색에 사용",
  evaluationFramework: {
    developer: {
      label: "개발자",
      measures: ["토큰", "Code Lines"],
      description: "토큰과 Code Lines를 통해 활동량 추정",
    },
    nonDeveloper: {
      label: "비개발자",
      measures: ["토큰", "생성 결과물 수"],
      description: "토큰과 생성 결과물의 수를 통해 활동량 추정",
    },
  },
} as const;
