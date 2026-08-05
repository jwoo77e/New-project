import type { MonthlyActual } from "../data/aiCostData";
import {
  approvalMonthlyTotalsForMonth,
  type AiToolApprovalData,
} from "../data/aiToolApprovalData";
import type { ChatGptUsageData } from "../data/chatGptUsageData";
import type { ClaudeTeamUsageData } from "../data/claudeTeamUsageData";
import type { DriveArtifactRepositoryData } from "../data/driveArtifactRepositoryData";
import type { GensparkUsageData } from "../data/gensparkUsageData";
import type { DriveArtifactTrendSnapshot } from "./driveArtifactTrendSnapshot";

export type ProductivityCohortStatus = "확정" | "비용 대기" | "잠정";

export type ProductivityCohort = {
  month: string;
  label: string;
  status: ProductivityCohortStatus;
  costKrw: number | null;
  costBasis: string;
  usageSignals: string[];
  outputSignals: string[];
  interpretation: string;
};

export type CostUsagePoint = {
  month: string;
  label: string;
  costKrw: number | null;
  costStatus: "확정" | "최소" | "대기";
  chatGptConversations: number;
  claudeConversations: number;
  conversationSignals: number | null;
  driveOutputSignals: number;
  driveStoredFiles: number | null;
};

export type DriveDailyActivityPoint = {
  date: string;
  label: string;
  claudeConversations: number;
  driveOutputSignals: number;
  jaewooConversations: number;
  hyungbaeConversations: number;
  strategyTeamConversations: number;
};

export type ProductivitySourceFreshness = {
  source: string;
  coverage: string;
  asOf: string;
  status: "확정" | "잠정" | "부분 집계" | "수집 점검" | "전체 폴더 집계";
  note: string;
};

export type AxKpiOverview = {
  adoption: {
    evidenceContributors: number;
    evidenceCoverageRate: number;
  };
  activity: {
    observedDays: number;
    activeDays: number;
    activeDayRate: number;
    conversationsPerActiveDay: number;
    previousConversationsPerActiveDay: number;
    dailyGrowthRate: number;
    topContributor: string;
    topContributorShare: number;
  };
  output: {
    observedDays: number;
    outputDays: number;
    outputsPerObservedDay: number;
    previousOutputsPerObservedDay: number;
    dailyGrowthRate: number;
    outputsPerConversation: number;
    previousOutputsPerConversation: number;
    yieldGrowthRate: number;
    peakDate: string;
    peakOutputs: number;
    peakShare: number;
  };
};

export type ProductivityExecutiveModel = {
  currentMonth: string;
  currentMonthLabel: string;
  classifiedActivityMonth: string;
  classifiedActivityMonthLabel: string;
  lastClosedMonth: string;
  lastClosedMonthLabel: string;
  lagMonths: number;
  currentFixedCostKrw: number;
  lastClosedCostKrw: number;
  activeUsers: number;
  licensedUsers: number;
  activationRate: number;
  codeUsers: number;
  codeUserRate: number;
  codeLines: number;
  requests: number;
  claudeConversations: number;
  drivePromptRecords: number;
  drivePromptOnlyRecords: number;
  drivePromptResponseRecords: number;
  driveResponseOnlyRecords: number;
  currentMonthClaudeConversations: number;
  currentMonthDriveOutputs: number;
  currentMonthDriveStoredFiles: number;
  conversationActiveDays: number;
  conversationDailyAverage: number;
  observableRepositoryOutputs: number;
  driveOutputs: number;
  gensparkOutputs: number;
  cohorts: ProductivityCohort[];
  costUsageSeries: CostUsagePoint[];
  dailyDriveActivity: DriveDailyActivityPoint[];
  axKpis: AxKpiOverview;
  sourceFreshness: ProductivitySourceFreshness[];
};

type ProductivityExecutiveInput = {
  monthlyActuals: MonthlyActual[];
  approvalData: AiToolApprovalData;
  chatGptData: ChatGptUsageData;
  claudeTeamData: ClaudeTeamUsageData;
  driveData: DriveArtifactRepositoryData;
  driveTrendData?: DriveArtifactTrendSnapshot | null;
  gensparkData: GensparkUsageData;
};

function monthLabel(month: string) {
  return `${Number(month.slice(0, 4))}년 ${Number(month.slice(5, 7))}월`;
}

function addMonths(month: string, offset: number) {
  const date = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthDistance(fromMonth: string, toMonth: string) {
  const from = Number(fromMonth.slice(0, 4)) * 12 + Number(fromMonth.slice(5, 7));
  const to = Number(toMonth.slice(0, 4)) * 12 + Number(toMonth.slice(5, 7));
  return Math.max(0, to - from);
}

function latestDate(value: string) {
  const matches = value.match(/\d{4}-\d{2}-\d{2}/g) ?? [];
  const sorted = matches.sort();
  return sorted[sorted.length - 1] ?? "";
}

function driveActivityCountByMonth(
  driveData: DriveArtifactRepositoryData,
  field: "conversations" | "outputSignals",
) {
  const counts = new Map<string, number>();

  for (const item of driveData.activityAnalysis.dailyCounts) {
    const month = item.date.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + item[field]);
  }

  return counts;
}

function representativeGensparkOutputsByMonth(gensparkData: GensparkUsageData) {
  const counts = new Map<string, number>();

  for (const task of gensparkData.representativeTasks) {
    const month = task.date.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + task.outputs.length);
  }

  return counts;
}

function driveStoredFilesByMonth(driveTrendData?: DriveArtifactTrendSnapshot | null) {
  if (!driveTrendData) return new Map<string, number>();

  const counts = new Map<string, number>();
  for (const repository of driveTrendData.repositories) {
    for (const item of repository.inventory.dailyCounts) {
      const month = item.date.slice(0, 7);
      counts.set(month, (counts.get(month) ?? 0) + item.count);
    }
  }
  return counts;
}

function rateChange(current: number, previous: number) {
  return previous > 0 ? ((current - previous) / previous) * 100 : 0;
}

export function buildProductivityExecutiveModel({
  monthlyActuals,
  approvalData,
  chatGptData,
  claudeTeamData,
  driveData,
  driveTrendData,
  gensparkData,
}: ProductivityExecutiveInput): ProductivityExecutiveModel {
  const lastClosedActual = monthlyActuals[monthlyActuals.length - 1];
  if (!lastClosedActual) {
    throw new Error("월별 확정 비용 데이터가 필요합니다.");
  }

  const gensparkDrive = gensparkData.driveAnalysis;
  const usageDates = [
    latestDate(claudeTeamData.source.generatedAt),
    latestDate(driveData.source.period),
    latestDate(driveTrendData?.source.period ?? ""),
    latestDate(gensparkDrive?.latestOutputDate ?? ""),
    latestDate(chatGptData.source.period),
  ]
    .filter(Boolean)
    .sort();
  const latestUsageDate = usageDates[usageDates.length - 1];
  const currentMonth = latestUsageDate?.slice(0, 7) || lastClosedActual.month;
  const currentMonthApprovalTotals = approvalMonthlyTotalsForMonth(approvalData, currentMonth);
  const lagMonths = monthDistance(lastClosedActual.month, currentMonth);
  const chatGptByMonth = new Map(chatGptData.monthlyUsage.map((item) => [item.month, item]));
  const claudeConversationsByMonth = driveActivityCountByMonth(driveData, "conversations");
  const driveOutputsByMonth = driveActivityCountByMonth(driveData, "outputSignals");
  const driveStoredFilesByMonthMap = driveStoredFilesByMonth(driveTrendData);
  const driveTrendPeriodDates = driveTrendData?.source.period.match(/\d{4}-\d{2}-\d{2}/g) ?? [];
  const driveTrendStartMonth = driveTrendPeriodDates[0]?.slice(0, 7) ?? "";
  const driveTrendEndMonth = driveTrendPeriodDates[driveTrendPeriodDates.length - 1]?.slice(0, 7) ?? "";
  const gensparkRepresentativeOutputs = representativeGensparkOutputsByMonth(gensparkData);
  const classifiedActivityDates = [...driveData.activityAnalysis.dailyCounts]
    .map((item) => item.date)
    .sort();
  const latestClassifiedActivityDate = classifiedActivityDates[classifiedActivityDates.length - 1];
  const classifiedActivityMonth = latestClassifiedActivityDate?.slice(0, 7) || currentMonth;
  const cohorts: ProductivityCohort[] = [];

  for (let offset = 0; offset <= lagMonths; offset += 1) {
    const month = addMonths(lastClosedActual.month, offset);
    const isClosed = month === lastClosedActual.month;
    const isCurrent = month === currentMonth;
    const chatGptMonth = chatGptByMonth.get(month);
    const driveOutputCount = driveOutputsByMonth.get(month) ?? 0;
    const gensparkOutputCount = gensparkRepresentativeOutputs.get(month) ?? 0;
    const usageSignals: string[] = [];
    const outputSignals: string[] = [];

    if (chatGptMonth) {
      usageSignals.push(`ChatGPT ${chatGptMonth.conversations.toLocaleString("ko-KR")}대화`);
    }
    const claudeConversationCount = claudeConversationsByMonth.get(month) ?? 0;
    if (claudeConversationCount > 0) {
      usageSignals.push(`Claude Drive 대화 세션 추정 ${claudeConversationCount.toLocaleString("ko-KR")}건`);
    }
    if (isCurrent) {
      usageSignals.push(`Claude Team 활성 ${claudeTeamData.activeUsers}/${claudeTeamData.licensedUsers}명`);
      usageSignals.push(`Claude 요청 ${claudeTeamData.totalRequests.toLocaleString("ko-KR")}건`);
    }
    if (driveOutputCount > 0) {
      outputSignals.push(`Claude Drive 결과·산출 신호 ${driveOutputCount.toLocaleString("ko-KR")}개`);
    }
    if (gensparkOutputCount > 0) {
      outputSignals.push(`Genspark 대표 작업 산출 형식 ${gensparkOutputCount.toLocaleString("ko-KR")}개`);
    }
    if (isCurrent && gensparkDrive) {
      outputSignals.push(`Genspark 누적 산출물 ${gensparkDrive.totalFiles.toLocaleString("ko-KR")}개`);
      outputSignals.push(`Claude Code ${claudeTeamData.totalCodeLines.toLocaleString("ko-KR")}줄`);
    }

    cohorts.push({
      month,
      label: monthLabel(month),
      status: isClosed ? "확정" : isCurrent ? "잠정" : "비용 대기",
      costKrw: isClosed ? lastClosedActual.amount : isCurrent ? currentMonthApprovalTotals.monthlyKrw : null,
      costBasis: isClosed ? "실제 카드·비용 원천" : isCurrent ? "현재 월 고정 구독비 최소값" : "후행 비용 자료 대기",
      usageSignals,
      outputSignals,
      interpretation: isClosed
        ? "비용은 확정됐지만 생산성 원천은 도구별 수집 범위 안에서 해석합니다."
        : isCurrent
          ? "사용·산출은 진행 중이며 변동비와 실제 업무 채택 여부는 아직 확정되지 않았습니다."
          : "사용월 데이터는 먼저 집계하고 비용이 도착하면 같은 월 코호트에 연결합니다.",
    });
  }

  const activeUsers = claudeTeamData.activeUsers;
  const licensedUsers = claudeTeamData.licensedUsers;
  const driveOutputs = driveData.activityAnalysis.totalOutputSignals;
  const gensparkOutputs =
    gensparkDrive?.individualArtifacts ?? gensparkDrive?.totalFiles ?? 0;
  const conversationActiveDays = driveData.activityAnalysis.dailyCounts.filter(
    (item) => item.conversations > 0,
  ).length;
  const monthlyActualByMonth = new Map(monthlyActuals.map((item) => [item.month, item]));
  const costUsageMonths = monthlyActuals.map((item) => item.month);
  for (let offset = 1; offset <= lagMonths; offset += 1) {
    const pendingMonth = addMonths(lastClosedActual.month, offset);
    if (!costUsageMonths.includes(pendingMonth)) {
      costUsageMonths.push(pendingMonth);
    }
  }
  const previousUsageMonth = addMonths(classifiedActivityMonth, -1);
  const currentDailyActivity = driveData.activityAnalysis.dailyCounts.filter((item) =>
    item.date.startsWith(classifiedActivityMonth),
  );
  const previousDailyActivity = driveData.activityAnalysis.dailyCounts.filter((item) =>
    item.date.startsWith(previousUsageMonth),
  );
  const currentConversationActiveDays = currentDailyActivity.filter((item) => item.conversations > 0).length;
  const previousConversationActiveDays = previousDailyActivity.filter((item) => item.conversations > 0).length;
  const currentOutputDays = currentDailyActivity.filter((item) => item.outputSignals > 0).length;
  const currentConversations = claudeConversationsByMonth.get(classifiedActivityMonth) ?? 0;
  const previousConversations = claudeConversationsByMonth.get(previousUsageMonth) ?? 0;
  const currentOutputs = driveOutputsByMonth.get(classifiedActivityMonth) ?? 0;
  const previousOutputs = driveOutputsByMonth.get(previousUsageMonth) ?? 0;
  const currentConversationsPerActiveDay =
    currentConversationActiveDays > 0 ? currentConversations / currentConversationActiveDays : 0;
  const previousConversationsPerActiveDay =
    previousConversationActiveDays > 0 ? previousConversations / previousConversationActiveDays : 0;
  const currentOutputsPerObservedDay =
    currentDailyActivity.length > 0 ? currentOutputs / currentDailyActivity.length : 0;
  const previousOutputsPerObservedDay =
    previousDailyActivity.length > 0 ? previousOutputs / previousDailyActivity.length : 0;
  const currentOutputsPerConversation = currentConversations > 0 ? currentOutputs / currentConversations : 0;
  const previousOutputsPerConversation =
    previousConversations > 0 ? previousOutputs / previousConversations : 0;
  const topContributor = [...driveData.activityAnalysis.byOwner].sort(
    (a, b) => b.conversations - a.conversations,
  )[0];
  const evidenceContributors = driveData.activityAnalysis.byOwner.filter(
    (item) => item.conversations > 0,
  ).length;
  const peakOutputDay = [...currentDailyActivity].sort(
    (a, b) => b.outputSignals - a.outputSignals,
  )[0];

  return {
    currentMonth,
    currentMonthLabel: monthLabel(currentMonth),
    classifiedActivityMonth,
    classifiedActivityMonthLabel: monthLabel(classifiedActivityMonth),
    lastClosedMonth: lastClosedActual.month,
    lastClosedMonthLabel: monthLabel(lastClosedActual.month),
    lagMonths,
    currentFixedCostKrw: currentMonthApprovalTotals.monthlyKrw,
    lastClosedCostKrw: lastClosedActual.amount,
    activeUsers,
    licensedUsers,
    activationRate: licensedUsers > 0 ? (activeUsers / licensedUsers) * 100 : 0,
    codeUsers: claudeTeamData.codeUsers,
    codeUserRate: licensedUsers > 0 ? (claudeTeamData.codeUsers / licensedUsers) * 100 : 0,
    codeLines: claudeTeamData.totalCodeLines,
    requests: claudeTeamData.totalRequests,
    claudeConversations: driveData.activityAnalysis.totalConversations,
    drivePromptRecords: driveData.activityAnalysis.promptEvidence.totalRecords,
    drivePromptOnlyRecords: driveData.activityAnalysis.promptEvidence.promptOnlyRecords,
    drivePromptResponseRecords: driveData.activityAnalysis.promptEvidence.promptResponseRecords,
    driveResponseOnlyRecords: driveData.activityAnalysis.promptEvidence.responseOnlyRecords,
    currentMonthClaudeConversations: currentConversations,
    currentMonthDriveOutputs: currentOutputs,
    currentMonthDriveStoredFiles: driveStoredFilesByMonthMap.get(currentMonth) ?? 0,
    conversationActiveDays,
    conversationDailyAverage:
      conversationActiveDays > 0
        ? driveData.activityAnalysis.totalConversations / conversationActiveDays
        : 0,
    observableRepositoryOutputs: driveOutputs + gensparkOutputs,
    driveOutputs,
    gensparkOutputs,
    cohorts,
    costUsageSeries: costUsageMonths.map((month) => {
      const actual = monthlyActualByMonth.get(month);
      const chatGptMonth = chatGptByMonth.get(month)?.conversations;
      const claudeMonth = claudeConversationsByMonth.get(month);
      const hasConversationSource = chatGptMonth !== undefined || claudeMonth !== undefined;
      const pendingCost = approvalMonthlyTotalsForMonth(approvalData, month).monthlyKrw;
      const hasDriveTrendCoverage =
        Boolean(driveTrendData) && month >= driveTrendStartMonth && month <= driveTrendEndMonth;

      return {
        month,
        label: actual?.label ?? `${Number(month.slice(5, 7))}월`,
        costKrw: actual?.amount ?? pendingCost,
        costStatus: actual ? "확정" : pendingCost > 0 ? "최소" : "대기",
        chatGptConversations: chatGptMonth ?? 0,
        claudeConversations: claudeMonth ?? 0,
        conversationSignals: hasConversationSource ? (chatGptMonth ?? 0) + (claudeMonth ?? 0) : null,
        driveOutputSignals: driveOutputsByMonth.get(month) ?? 0,
        driveStoredFiles: hasDriveTrendCoverage ? (driveStoredFilesByMonthMap.get(month) ?? 0) : null,
      };
    }),
    dailyDriveActivity: driveData.activityAnalysis.dailyCounts.map((item) => ({
      date: item.date,
      label: `${Number(item.date.slice(5, 7))}/${Number(item.date.slice(8, 10))}`,
      claudeConversations: item.conversations,
      driveOutputSignals: item.outputSignals,
      jaewooConversations: item.jaewooConversations,
      hyungbaeConversations: item.hyungbaeConversations,
      strategyTeamConversations: item.strategyTeamConversations ?? 0,
    })),
    axKpis: {
      adoption: {
        evidenceContributors,
        evidenceCoverageRate: activeUsers > 0 ? (evidenceContributors / activeUsers) * 100 : 0,
      },
      activity: {
        observedDays: currentDailyActivity.length,
        activeDays: currentConversationActiveDays,
        activeDayRate:
          currentDailyActivity.length > 0
            ? (currentConversationActiveDays / currentDailyActivity.length) * 100
            : 0,
        conversationsPerActiveDay: currentConversationsPerActiveDay,
        previousConversationsPerActiveDay,
        dailyGrowthRate: rateChange(
          currentConversationsPerActiveDay,
          previousConversationsPerActiveDay,
        ),
        topContributor: topContributor?.owner ?? "-",
        topContributorShare:
          driveData.activityAnalysis.totalConversations > 0
            ? ((topContributor?.conversations ?? 0) / driveData.activityAnalysis.totalConversations) * 100
            : 0,
      },
      output: {
        observedDays: currentDailyActivity.length,
        outputDays: currentOutputDays,
        outputsPerObservedDay: currentOutputsPerObservedDay,
        previousOutputsPerObservedDay,
        dailyGrowthRate: rateChange(currentOutputsPerObservedDay, previousOutputsPerObservedDay),
        outputsPerConversation: currentOutputsPerConversation,
        previousOutputsPerConversation,
        yieldGrowthRate: rateChange(currentOutputsPerConversation, previousOutputsPerConversation),
        peakDate: peakOutputDay?.date ?? "",
        peakOutputs: peakOutputDay?.outputSignals ?? 0,
        peakShare: currentOutputs > 0 ? ((peakOutputDay?.outputSignals ?? 0) / currentOutputs) * 100 : 0,
      },
    },
    sourceFreshness: [
      {
        source: "비용 원천",
        coverage: `${monthlyActuals[0]?.label ?? "-"}~${lastClosedActual.label}`,
        asOf: lastClosedActual.month,
        status: "확정",
        note: "비용은 실제 사용 기준월에 귀속",
      },
      {
        source: "Claude Team",
        coverage: claudeTeamData.source.period,
        asOf: claudeTeamData.source.generatedAt,
        status: "잠정",
        note: `${claudeTeamData.activeUsers}/${claudeTeamData.licensedUsers}명 활성 · Code ${claudeTeamData.codeUsers}명`,
      },
      {
        source: "Claude Drive",
        coverage: driveTrendData?.source.period ?? driveData.source.period,
        asOf: driveTrendData?.source.collectedAt ?? driveData.activityAnalysis.collectedAt,
        status: "전체 폴더 집계",
        note: driveTrendData
          ? `매일 21시 전체 하위 폴더 저장 파일 ${driveTrendData.totals.files.toLocaleString("ko-KR")}개 집계 · 대화 세션 ${driveData.activityAnalysis.totalConversations.toLocaleString("ko-KR")}건 · 본문 확인 프롬프트 ${driveData.activityAnalysis.promptEvidence.totalRecords.toLocaleString("ko-KR")}건 · 내용 분류 ${monthLabel(classifiedActivityMonth)}까지`
          : `${driveData.activityAnalysis.scannedFolders.toLocaleString("ko-KR")}개 폴더·파일 ${driveData.activityAnalysis.scannedFiles.toLocaleString("ko-KR")}개 재귀 조회 · 대화 세션 ${driveData.activityAnalysis.totalConversations.toLocaleString("ko-KR")}건 · 본문 확인 프롬프트 ${driveData.activityAnalysis.promptEvidence.totalRecords.toLocaleString("ko-KR")}건 · 결과 신호 ${driveData.activityAnalysis.totalOutputSignals.toLocaleString("ko-KR")}개 · 오류 ${driveData.activityAnalysis.scanErrors}건`,
      },
      {
        source: "Genspark Drive",
        coverage: gensparkDrive?.source.period ?? gensparkData.source.period,
        asOf: gensparkDrive?.source.collectedAt ?? gensparkData.source.collectedAt,
        status: gensparkDrive?.source.status === "정상" ? "전체 폴더 집계" : "수집 점검",
        note:
          gensparkDrive?.source.status === "정상"
            ? `${gensparkDrive.source.schedule ?? "매일 자동수집"} · ${gensparkDrive.directFileSignal}`
            : "Drive 최신 요약 확인 · 자동수집 스냅샷 대기",
      },
      {
        source: "ChatGPT Export",
        coverage: chatGptData.source.period,
        asOf: chatGptData.source.collectedAt,
        status: "부분 집계",
        note: "Export 시점까지의 대화·파일 신호",
      },
    ],
  };
}
