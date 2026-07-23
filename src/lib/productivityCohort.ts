import type { MonthlyActual } from "../data/aiCostData";
import type { AiToolApprovalData } from "../data/aiToolApprovalData";
import type { ChatGptUsageData } from "../data/chatGptUsageData";
import type { ClaudeTeamUsageData } from "../data/claudeTeamUsageData";
import type { DriveArtifactRepositoryData } from "../data/driveArtifactRepositoryData";
import type { GensparkUsageData } from "../data/gensparkUsageData";

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
  costKrw: number;
  chatGptConversations: number;
};

export type ProductivitySourceFreshness = {
  source: string;
  coverage: string;
  asOf: string;
  status: "확정" | "잠정" | "부분 집계" | "수집 점검" | "전체 폴더 집계";
  note: string;
};

export type ProductivityExecutiveModel = {
  currentMonth: string;
  currentMonthLabel: string;
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
  observableRepositoryOutputs: number;
  driveOutputs: number;
  gensparkOutputs: number;
  cohorts: ProductivityCohort[];
  costUsageSeries: CostUsagePoint[];
  sourceFreshness: ProductivitySourceFreshness[];
};

type ProductivityExecutiveInput = {
  monthlyActuals: MonthlyActual[];
  approvalData: AiToolApprovalData;
  chatGptData: ChatGptUsageData;
  claudeTeamData: ClaudeTeamUsageData;
  driveData: DriveArtifactRepositoryData;
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

function outputCountByMonth(driveData: DriveArtifactRepositoryData) {
  const counts = new Map<string, number>();

  for (const artifact of driveData.repositories.flatMap((repository) => repository.artifacts)) {
    if (artifact.kind === "프롬프트") continue;
    const month = artifact.createdAt.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + 1);
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

export function buildProductivityExecutiveModel({
  monthlyActuals,
  approvalData,
  chatGptData,
  claudeTeamData,
  driveData,
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
    latestDate(gensparkDrive?.latestOutputDate ?? ""),
    latestDate(chatGptData.source.period),
  ]
    .filter(Boolean)
    .sort();
  const latestUsageDate = usageDates[usageDates.length - 1];
  const currentMonth = latestUsageDate?.slice(0, 7) || lastClosedActual.month;
  const lagMonths = monthDistance(lastClosedActual.month, currentMonth);
  const chatGptByMonth = new Map(chatGptData.monthlyUsage.map((item) => [item.month, item]));
  const driveOutputsByMonth = outputCountByMonth(driveData);
  const gensparkRepresentativeOutputs = representativeGensparkOutputsByMonth(gensparkData);
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
    if (isCurrent) {
      usageSignals.push(`Claude Team 활성 ${claudeTeamData.activeUsers}/${claudeTeamData.licensedUsers}명`);
      usageSignals.push(`Claude 요청 ${claudeTeamData.totalRequests.toLocaleString("ko-KR")}건`);
    }
    if (driveOutputCount > 0) {
      outputSignals.push(`Claude Drive 대표 검증 산출 신호 ${driveOutputCount.toLocaleString("ko-KR")}개`);
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
      costKrw: isClosed ? lastClosedActual.amount : isCurrent ? approvalData.totalMonthlyKrw : null,
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
  const driveOutputs = driveData.totals.outputs;
  const gensparkOutputs = gensparkDrive?.totalFiles ?? 0;

  return {
    currentMonth,
    currentMonthLabel: monthLabel(currentMonth),
    lastClosedMonth: lastClosedActual.month,
    lastClosedMonthLabel: monthLabel(lastClosedActual.month),
    lagMonths,
    currentFixedCostKrw: approvalData.totalMonthlyKrw,
    lastClosedCostKrw: lastClosedActual.amount,
    activeUsers,
    licensedUsers,
    activationRate: licensedUsers > 0 ? (activeUsers / licensedUsers) * 100 : 0,
    codeUsers: claudeTeamData.codeUsers,
    codeUserRate: licensedUsers > 0 ? (claudeTeamData.codeUsers / licensedUsers) * 100 : 0,
    codeLines: claudeTeamData.totalCodeLines,
    requests: claudeTeamData.totalRequests,
    observableRepositoryOutputs: driveOutputs + gensparkOutputs,
    driveOutputs,
    gensparkOutputs,
    cohorts,
    costUsageSeries: monthlyActuals.map((actual) => ({
      month: actual.month,
      label: actual.label,
      costKrw: actual.amount,
      chatGptConversations: chatGptByMonth.get(actual.month)?.conversations ?? 0,
    })),
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
        coverage: driveData.source.period,
        asOf: driveData.source.collectedAt,
        status: "전체 폴더 집계",
        note: `${driveData.totals.folders.toLocaleString("ko-KR")}개 폴더 재귀 완료 · 파일 ${driveData.totals.files.toLocaleString("ko-KR")}개 · 중복 추정 ${driveData.totals.duplicateCopies.toLocaleString("ko-KR")}개 분리`,
      },
      {
        source: "Genspark Drive",
        coverage: gensparkDrive?.source.period ?? gensparkData.source.period,
        asOf: gensparkDrive?.source.collectedAt ?? gensparkData.source.collectedAt,
        status: "수집 점검",
        note: "Drive 최신 요약 확인 · 서비스 계정 자동수집은 API 활성화 필요",
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
