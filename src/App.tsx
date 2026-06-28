import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Bot,
  CalendarRange,
  CircleDollarSign,
  Cpu,
  Download,
  FileText,
  FileSpreadsheet,
  Gauge,
  KeyRound,
  LineChart,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  UserCheck,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  initialApiUsageData,
  isApiUsageData,
  type ApiKeyStatusValue,
  type ApiProviderStatus,
  type ApiUsageData,
  type GammaUsageData,
  type GeminiWorkspaceUserUsageLevel,
  type GeminiWorkspaceUsageData,
} from "./data/apiUsageData";
import {
  initialDashboardData,
  type DashboardData,
  type MonthlyActual,
  type SourceMeta,
  type TransactionCost,
} from "./data/aiCostData";
import {
  initialGensparkUsageData,
  type GensparkUsageData,
} from "./data/gensparkUsageData";
import { gammaDriveUsageData } from "./data/gammaDriveUsageData";
import {
  driveArtifactRepositoryData,
  type DriveArtifactRepositoryData,
} from "./data/driveArtifactRepositoryData";
import {
  initialClaudeTeamUsageData,
  type ClaudeTeamUsageData,
  type ClaudeTeamUsageLevel,
} from "./data/claudeTeamUsageData";
import {
  initialAiToolApprovalData,
  type AiToolApprovalData,
} from "./data/aiToolApprovalData";
import {
  clearStoredDashboardData,
  loadStoredDashboardData,
  saveStoredDashboardData,
} from "./lib/dashboardStorage";
import {
  buildApiUsageRunRateForecast,
  buildApiUsageRunRateForecastsByMonth,
  emptyApiUsageRunRateForecast,
  type ApiUsageRunRateForecast,
} from "./lib/apiForecast";
import { dashboardDataFromExcel } from "./lib/excelDashboard";

type ViewKey = "monthly" | "adoption" | "genspark" | "approval" | "api";

type ForecastPoint = {
  month: string;
  label: string;
  amount: number;
  lower: number;
  upper: number;
};

type MetricTone = "teal" | "green" | "amber" | "coral" | "steel";

type OperatingPlanForecast = {
  applies: boolean;
  subscriptionUsd: number;
  subscriptionKrw: number;
  forecastBaseKrw: number;
  apiKrw: number;
  apiSource: ApiForecastSource;
  apiSourceLabel: string;
  totalKrw: number;
};

type ApiForecastSource = "monthActual" | "monthProjection" | "latestRunRate" | "budget" | "none";

type ApiMonthForecastSelection = {
  costKrw: number;
  source: ApiForecastSource;
  sourceLabel: string;
  forecast: ApiUsageRunRateForecast | null;
};

const chartColors = ["#0f8b8d", "#e85d4f", "#c58612", "#2f8f46"];
const API_FORECAST_MONTH_DAYS = 30.4;
const API_FORECAST_USD_TO_KRW = 1400;
const OPERATING_PLAN_START_MONTH = "2026-05";
const OPERATING_PLAN_USD_TO_KRW = 1485;
const OPERATING_PLAN_API_BUDGET_KRW = 280000;
const operatingPlanSubscriptions = [
  { label: "ChatGPT Pro", quantity: 2, unitUsd: 220 },
  { label: "Claude Max 5x", quantity: 1, unitUsd: 110 },
  { label: "Gemini Pro", quantity: 9, unitUsd: 15.12 },
  { label: "Genspark Pro", quantity: 2, unitUsd: 275 },
  { label: "Gamma AI Pro", quantity: 1, unitUsd: 25 },
  { label: "Claude Team Premium", quantity: 3, unitUsd: 137.5 },
  { label: "Claude Team Standard", quantity: 6, unitUsd: 27.5 },
];

const numberFormat = new Intl.NumberFormat("ko-KR");

function loadInitialDashboardState() {
  const storedData = loadStoredDashboardData();
  return {
    data: storedData ?? initialDashboardData,
    isStoredData: Boolean(storedData),
  };
}

function formatWon(value: number) {
  return `${numberFormat.format(Math.round(value))}원`;
}

function formatManWon(value: number) {
  return `${numberFormat.format(Math.round(value / 10000))}만원`;
}

function formatAxisWon(value: number | string) {
  return `${numberFormat.format(Math.round(Number(value) / 10000))}만`;
}

function formatRate(value: number, signed = false) {
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function formatKstDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatUsd(value: number) {
  return `$${value.toLocaleString("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  })}`;
}

function formatPreciseUsd(value: number) {
  return `$${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function formatTokens(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }

  return numberFormat.format(value);
}

function formatLatency(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`;
}

function formatTokenAxis(value: number | string) {
  return formatTokens(Number(value));
}

function formatRequestCount(requests: number, tokens = 0) {
  if (requests === 0 && tokens > 0) return "요청수 미제공";
  return `${numberFormat.format(requests)}건`;
}

function formatKeyRequestCount(requests: number, tokens = 0) {
  if (requests === 0 && tokens > 0) return "요청수 미제공";
  return `요청 ${numberFormat.format(requests)}건`;
}

function formatApiForecastProviderSummary(forecast: ApiUsageRunRateForecast) {
  const summaries = forecast.providers
    .filter((provider) => provider.monthlyCostUsd > 0 || provider.oneTimeCostUsd > 0)
    .map((provider) => {
      const recurring = `${provider.provider} 반복 ${formatUsd(provider.monthlyCostUsd)}/월`;
      if (provider.oneTimeCostUsd <= 0) return recurring;
      return `${recurring}, 일회성 ${formatUsd(provider.oneTimeCostUsd)} 제외`;
    });

  return summaries.length > 0 ? summaries.join(" · ") : "반복 API 비용 없음";
}

type ClaudeAccountIdentity = Pick<ClaudeTeamUsageData["users"][number], "displayName" | "email">;

const CLAUDE_EXPORT_ACCOUNT_ALIASES = new Map<string, string>([
  ["성진", "sieghaft"],
]);

function normalizeClaudeAccountKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function addClaudeAccountIdentity(
  directory: Map<string, ClaudeAccountIdentity | null>,
  key: string,
  identity: ClaudeAccountIdentity,
) {
  const normalizedKey = normalizeClaudeAccountKey(key);
  if (!normalizedKey) return;

  const existingIdentity = directory.get(normalizedKey);
  if (existingIdentity === undefined) {
    directory.set(normalizedKey, identity);
    return;
  }

  if (existingIdentity && existingIdentity.email !== identity.email) {
    directory.set(normalizedKey, null);
  }
}

function buildClaudeAccountIdentityDirectory(claudeTeamUsageData: ClaudeTeamUsageData) {
  const directory = new Map<string, ClaudeAccountIdentity | null>();

  claudeTeamUsageData.users.forEach((user) => {
    const identity = {
      displayName: user.displayName,
      email: user.email,
    };
    const emailLocalPart = user.email.split("@")[0];
    const personName = user.displayName.split(/\s+/)[0];

    [user.email, emailLocalPart, user.displayName, personName].forEach((key) => {
      addClaudeAccountIdentity(directory, key, identity);
    });
  });

  return directory;
}

function getClaudeAccountIdentity(
  directory: Map<string, ClaudeAccountIdentity | null>,
  accountLabel: string,
) {
  const normalizedLabel = normalizeClaudeAccountKey(accountLabel);
  const alias = CLAUDE_EXPORT_ACCOUNT_ALIASES.get(accountLabel) ?? CLAUDE_EXPORT_ACCOUNT_ALIASES.get(normalizedLabel);
  const lookupKey = alias ? normalizeClaudeAccountKey(alias) : normalizedLabel;
  const identity = directory.get(lookupKey);
  return identity ?? null;
}

function apiStatusTone(status: ApiProviderStatus) {
  if (status === "정상") return "ok";
  if (status === "주의") return "warning";
  return "neutral";
}

function keyStatusTone(status: ApiKeyStatusValue) {
  if (status === "정상") return "ok";
  if (status === "교체권장") return "warning";
  return "neutral";
}

function buildForecast(monthlyActuals: MonthlyActual[]): ForecastPoint[] {
  if (monthlyActuals.length === 0) {
    return [];
  }

  const points = monthlyActuals.map((item, index) => ({
    x: index + 1,
    y: item.amount,
  }));
  const avgX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const avgY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const numerator = points.reduce((sum, point) => sum + (point.x - avgX) * (point.y - avgY), 0);
  const denominator = points.reduce((sum, point) => sum + (point.x - avgX) ** 2, 0);
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = avgY - slope * avgX;
  const lastMonth = monthlyActuals[monthlyActuals.length - 1].month;

  return [1, 2, 3].map((monthOffset, index) => {
    const x = monthlyActuals.length + index + 1;
    const month = addMonths(lastMonth, monthOffset);
    const amount = Math.max(0, intercept + slope * x);
    return {
      month,
      label: monthLabel(month),
      amount: Math.round(amount),
      lower: Math.round(amount * 0.85),
      upper: Math.round(amount * 1.15),
    };
  });
}

function addMonths(month: string, offset: number) {
  const year = Number(month.slice(0, 4));
  const zeroBasedMonth = Number(month.slice(5, 7)) - 1;
  const date = new Date(year, zeroBasedMonth + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string) {
  return `${Number(month.slice(5, 7))}월`;
}

function monthRangeLabel(items: Array<{ month: string }>) {
  if (items.length === 0) return "월별";
  return `${monthLabel(items[0].month)}-${monthLabel(items[items.length - 1].month)}`;
}

function fixedCostForecastMethodLabel(monthlyFixedKrw: number) {
  return `현재 월 고정 비용 ${formatManWon(monthlyFixedKrw)} 기준`;
}

function buildOperatingPlanForecast(
  month: string,
  apiForecastSelection: ApiMonthForecastSelection,
  subscriptionUsd: number,
  subscriptionKrw: number,
): OperatingPlanForecast {
  if (month < OPERATING_PLAN_START_MONTH) {
    return {
      applies: false,
      subscriptionUsd: 0,
      subscriptionKrw: 0,
      forecastBaseKrw: 0,
      apiKrw: 0,
      apiSource: "none",
      apiSourceLabel: "운영계획 미적용",
      totalKrw: 0,
    };
  }

  const forecastBaseKrw = Math.round(subscriptionKrw);
  const apiKrw = apiForecastSelection.costKrw;

  return {
    applies: true,
    subscriptionUsd,
    subscriptionKrw,
    forecastBaseKrw,
    apiKrw,
    apiSource: apiForecastSelection.source,
    apiSourceLabel: apiForecastSelection.sourceLabel,
    totalKrw: forecastBaseKrw + apiKrw,
  };
}

function selectApiForecastForMonth({
  month,
  monthlyApiForecasts,
  latestMeasuredApiMonth,
  latestMeasuredApiForecast,
  hasMeasuredApiUsage,
}: {
  month: string;
  monthlyApiForecasts: Map<string, ApiUsageRunRateForecast>;
  latestMeasuredApiMonth: string;
  latestMeasuredApiForecast: ApiUsageRunRateForecast | null;
  hasMeasuredApiUsage: boolean;
}): ApiMonthForecastSelection {
  const monthForecast = monthlyApiForecasts.get(month);

  if (monthForecast) {
    const actualCostKrw = Math.round(apiForecastActualCostUsd(monthForecast) * monthForecast.usdToKrwRate);

    if (month === latestMeasuredApiMonth) {
      return {
        costKrw: Math.round((monthForecast.monthlyCostUsd + monthForecast.oneTimeCostUsd) * monthForecast.usdToKrwRate),
        source: "monthProjection",
        sourceLabel: `${monthLabel(month)} 실측+잔여예측`,
        forecast: monthForecast,
      };
    }

    return {
      costKrw: actualCostKrw,
      source: "monthActual",
      sourceLabel: `${monthLabel(month)} 실측`,
      forecast: monthForecast,
    };
  }

  if (latestMeasuredApiForecast && latestMeasuredApiMonth && month > latestMeasuredApiMonth) {
    return {
      costKrw: latestMeasuredApiForecast.monthlyCostKrw,
      source: "latestRunRate",
      sourceLabel: `${monthLabel(latestMeasuredApiMonth)} 최신 월환산`,
      forecast: latestMeasuredApiForecast,
    };
  }

  if (hasMeasuredApiUsage) {
    return {
      costKrw: 0,
      source: "none",
      sourceLabel: "해당월 API 실측 없음",
      forecast: null,
    };
  }

  return {
    costKrw: OPERATING_PLAN_API_BUDGET_KRW,
    source: "budget",
    sourceLabel: "API 예산",
    forecast: null,
  };
}

function apiForecastActualCostUsd(forecast: ApiUsageRunRateForecast) {
  return forecast.providers.reduce((sum, provider) => sum + provider.totalCostUsd, 0);
}

function App() {
  const [initialState] = useState(loadInitialDashboardState);
  const [activeView, setActiveView] = useState<ViewKey>("adoption");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialState.data);
  const [isStoredData, setIsStoredData] = useState(initialState.isStoredData);
  const [apiUsageData, setApiUsageData] = useState<ApiUsageData>(initialApiUsageData);

  useEffect(() => {
    let isMounted = true;
    const snapshotUrls = ["/api/api-usage", `${import.meta.env.BASE_URL}api-usage-snapshot.local.json`];

    async function loadApiUsageData() {
      for (const url of snapshotUrls) {
        try {
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) continue;
          const data: unknown = await response.json();
          if (isApiUsageData(data)) {
            if (isMounted) setApiUsageData(data);
            return;
          }
        } catch {
          // The runtime API is optional for static deployments; try the next source.
        }
      }
    }

    void loadApiUsageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const {
    sourceMeta,
    monthlyActuals,
    forecastAdjustments,
    departmentCosts,
    categoryCosts,
    vendorCosts,
    topTransactions,
  } = dashboardData;

  const adjustmentByMonth = useMemo(
    () => new Map(forecastAdjustments.map((item) => [item.month, item])),
    [forecastAdjustments],
  );
  const forecastBasisActuals = useMemo(
    () =>
      monthlyActuals.map((item) => {
        const adjustment = adjustmentByMonth.get(item.month)?.amount ?? 0;
        return {
          ...item,
          amount: Math.max(0, item.amount - adjustment),
        };
      }),
    [adjustmentByMonth, monthlyActuals],
  );

  const forecast = useMemo(() => buildForecast(forecastBasisActuals), [forecastBasisActuals]);
  const lastActual = monthlyActuals[monthlyActuals.length - 1];
  const previousActual = monthlyActuals[monthlyActuals.length - 2];
  const lastMoM =
    previousActual && previousActual.amount > 0
      ? ((lastActual.amount - previousActual.amount) / previousActual.amount) * 100
      : 0;
  const priorYearRate =
    sourceMeta.priorYearTotal > 0 ? (sourceMeta.totalActual / sourceMeta.priorYearTotal) * 100 : 0;
  const commonDepartment = departmentCosts[0] ?? {
    total: 0,
    name: "-",
  };
  const commonDepartmentShare =
    sourceMeta.totalActual > 0 ? (commonDepartment.total / sourceMeta.totalActual) * 100 : 0;
  const actualRange = monthRangeLabel(monthlyActuals);
  const forecastRange = monthRangeLabel(forecast);
  const apiTotals = useMemo(() => {
    const totalRequests = apiUsageData.providers.reduce((sum, item) => sum + item.requests, 0);
    const totalTokens = apiUsageData.providers.reduce(
      (sum, item) => sum + item.inputTokens + item.outputTokens,
      0,
    );
    const totalCostUsd = apiUsageData.providers.reduce((sum, item) => sum + item.costUsd, 0);
    const weightedErrors = apiUsageData.providers.reduce(
      (sum, item) => sum + item.errorRate * item.requests,
      0,
    );
    const weightedLatency = apiUsageData.providers.reduce(
      (sum, item) => sum + item.avgLatencyMs * item.requests,
      0,
    );
    const activeKeys = apiUsageData.providers.reduce((sum, item) => sum + item.activeKeys, 0);

    return {
      totalRequests,
      totalTokens,
      totalCostUsd,
      avgErrorRate: totalRequests ? weightedErrors / totalRequests : 0,
      avgLatencyMs: totalRequests ? weightedLatency / totalRequests : 0,
      activeKeys,
    };
  }, [apiUsageData]);
  const workspaceUsageData = apiUsageData.workspaceUsage ?? initialApiUsageData.workspaceUsage!;
  const gammaUsageData = apiUsageData.gammaUsage ?? initialApiUsageData.gammaUsage!;
  const claudeTeamUsageData = initialClaudeTeamUsageData;
  const aiToolApprovalData = initialAiToolApprovalData;
  const aiUsageInsight = initialGensparkUsageData.insightAnalysis;
  const driveArtifactsByOwner = driveArtifactRepositoryData.repositories
    .map((repository) => `${repository.owner} ${numberFormat.format(repository.fileCount)}개`)
    .join(" · ");
  const isApiUsageCollected = apiUsageData.source.generatedAt !== initialApiUsageData.source.generatedAt;
  const apiForecast = useMemo(() => {
    if (!isApiUsageCollected) {
      return emptyApiUsageRunRateForecast({
        usdToKrwRate: API_FORECAST_USD_TO_KRW,
        monthDays: API_FORECAST_MONTH_DAYS,
      });
    }

    return buildApiUsageRunRateForecast(apiUsageData.dailyUsage, {
      usdToKrwRate: API_FORECAST_USD_TO_KRW,
      monthDays: API_FORECAST_MONTH_DAYS,
    });
  }, [apiUsageData.dailyUsage, isApiUsageCollected]);
  const monthlyApiForecasts = useMemo(() => {
    if (!isApiUsageCollected) return new Map<string, ApiUsageRunRateForecast>();
    return buildApiUsageRunRateForecastsByMonth(apiUsageData.dailyUsage, {
      usdToKrwRate: API_FORECAST_USD_TO_KRW,
    });
  }, [apiUsageData.dailyUsage, isApiUsageCollected]);
  const latestMeasuredApiMonth = useMemo(() => {
    const months = [...monthlyApiForecasts.keys()];
    return months.length > 0 ? months[months.length - 1] : "";
  }, [monthlyApiForecasts]);
  const latestMeasuredApiForecast = latestMeasuredApiMonth ? monthlyApiForecasts.get(latestMeasuredApiMonth) ?? null : null;
  const apiForecastByMonth = useMemo(
    () =>
      new Map(
        forecast.map((item) => [
          item.month,
          selectApiForecastForMonth({
            month: item.month,
            monthlyApiForecasts,
            latestMeasuredApiMonth,
            latestMeasuredApiForecast,
            hasMeasuredApiUsage: apiForecast.isReady,
          }),
        ]),
      ),
    [apiForecast.isReady, forecast, latestMeasuredApiForecast, latestMeasuredApiMonth, monthlyApiForecasts],
  );
  const operatingPlanSubscriptionUsd = aiToolApprovalData.totalMonthlyUsd;
  const operatingPlanSubscriptionKrw = Math.round(aiToolApprovalData.totalMonthlyKrw);
  const operatingPlanSubscriptionSummary = aiToolApprovalData.toolSummary
    .map((item) => `${item.key} ${item.count}`)
    .join(" · ");
  const forecastApiSelections = [...apiForecastByMonth.values()];
  const operatingPlanApiSourceLabel = apiForecast.isReady ? "월별 실측 API 우선" : "API 예산";
  const operatingPlanApiKrw =
    forecastApiSelections.find((selection) => selection.source === "monthProjection")?.costKrw ??
    latestMeasuredApiForecast?.monthlyCostKrw ??
    OPERATING_PLAN_API_BUDGET_KRW;
  const apiAdjustedForecast = useMemo(
    () =>
      forecast.map((item) => {
        const apiSelection =
          apiForecastByMonth.get(item.month) ??
          selectApiForecastForMonth({
            month: item.month,
            monthlyApiForecasts,
            latestMeasuredApiMonth,
            latestMeasuredApiForecast,
            hasMeasuredApiUsage: apiForecast.isReady,
        });
        const operatingPlan = buildOperatingPlanForecast(
          item.month,
          apiSelection,
          operatingPlanSubscriptionUsd,
          operatingPlanSubscriptionKrw,
        );
        const apiUsageKrw = operatingPlan.applies
          ? operatingPlan.apiKrw
          : apiSelection.source === "budget"
            ? 0
            : apiSelection.costKrw;
        const baseForecastKrw = operatingPlan.applies ? operatingPlan.forecastBaseKrw : item.amount;

        return {
          ...item,
          apiUsageKrw,
          apiSource: apiSelection.source,
          apiSourceLabel: apiSelection.sourceLabel,
          baseForecastKrw,
          operatingPlanKrw: operatingPlan.subscriptionKrw,
          operatingPlanUsd: operatingPlan.subscriptionUsd,
          isOperatingPlan: operatingPlan.applies,
          totalWithApi: operatingPlan.applies ? operatingPlan.totalKrw : item.amount + apiUsageKrw,
        };
      }),
    [
      apiForecast.isReady,
      apiForecastByMonth,
      forecast,
      latestMeasuredApiForecast,
      latestMeasuredApiMonth,
      monthlyApiForecasts,
      operatingPlanSubscriptionKrw,
      operatingPlanSubscriptionUsd,
    ],
  );
  const apiAdjustedForecastTotal = apiAdjustedForecast.reduce((sum, item) => sum + item.totalWithApi, 0);
  const apiForecastAddedTotal = apiAdjustedForecast.reduce((sum, item) => sum + item.apiUsageKrw, 0);
  const operatingPlanForecastTotal = apiAdjustedForecast.reduce(
    (sum, item) => sum + (item.isOperatingPlan ? item.baseForecastKrw : 0),
    0,
  );
  const operatingPlanMonths = apiAdjustedForecast.filter((item) => item.isOperatingPlan).length;
  const apiAdjustedForecastGrowth =
    operatingPlanForecastTotal > 0
      ? ((apiAdjustedForecastTotal - operatingPlanForecastTotal) / operatingPlanForecastTotal) * 100
      : 0;

  const monthlySeries = [
    ...monthlyActuals.map((item) => ({
      label: item.label,
      actual: item.amount,
      forecast: null,
      operatingPlanForecast: null,
      apiUsageForecast: null,
      forecastWithApi: null,
      forecastBasis: forecastBasisActuals.find((basis) => basis.month === item.month)?.amount ?? item.amount,
      adjustment: adjustmentByMonth.get(item.month)?.amount ?? 0,
      fixedPlan: operatingPlanSubscriptionKrw,
      transactions: item.transactions,
      apiSourceLabel: null,
      status: "실적",
    })),
    ...forecast.map((item) => {
      const apiSelection =
        apiForecastByMonth.get(item.month) ??
        selectApiForecastForMonth({
          month: item.month,
          monthlyApiForecasts,
          latestMeasuredApiMonth,
          latestMeasuredApiForecast,
          hasMeasuredApiUsage: apiForecast.isReady,
      });
      const operatingPlan = buildOperatingPlanForecast(
        item.month,
        apiSelection,
        operatingPlanSubscriptionUsd,
        operatingPlanSubscriptionKrw,
      );
      const apiUsageKrw = operatingPlan.applies
        ? operatingPlan.apiKrw
        : apiSelection.source === "budget"
          ? 0
          : apiSelection.costKrw;

      return {
        label: item.label,
        actual: null,
        forecast: operatingPlan.applies ? null : item.amount,
        operatingPlanForecast: operatingPlan.applies ? operatingPlan.forecastBaseKrw : null,
        apiUsageForecast: apiUsageKrw,
        apiSourceLabel: apiSelection.sourceLabel,
        forecastWithApi: operatingPlan.applies ? operatingPlan.totalKrw : item.amount + apiUsageKrw,
        forecastBasis: null,
        adjustment: null,
        fixedPlan: operatingPlan.applies ? operatingPlan.forecastBaseKrw : operatingPlanSubscriptionKrw,
        transactions: null,
        status: "예측",
      };
    }),
  ];

  const filteredTransactions = topTransactions.filter((row) => {
    const text = [row.date, row.department, row.item, row.vendor, row.category]
      .join(" ")
      .toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  const handleUpload = async (file: File | null) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const nextData = await dashboardDataFromExcel(file);
      const saved = saveStoredDashboardData(nextData);
      setDashboardData(nextData);
      setIsStoredData(saved);
      setQuery("");
      setActiveView("monthly");
      setToast(
        saved
          ? `${nextData.sourceMeta.fileName} 기준으로 업데이트하고 저장했습니다.`
          : `${nextData.sourceMeta.fileName} 기준으로 업데이트했습니다. 브라우저 저장은 실패했습니다.`,
      );
      window.setTimeout(() => setToast(""), 2800);
    } catch (error) {
      const message = error instanceof Error ? error.message : "엑셀 파일을 읽지 못했습니다.";
      setToast(message);
      window.setTimeout(() => setToast(""), 3600);
    } finally {
      setIsUploading(false);
    }
  };

  const resetDashboard = () => {
    clearStoredDashboardData();
    setDashboardData(initialDashboardData);
    setIsStoredData(false);
    setQuery("");
    setActiveView("monthly");
    setToast("기본 대시보드 데이터로 초기화했습니다.");
    window.setTimeout(() => setToast(""), 2400);
  };

  const exportSnapshot = () => {
    const snapshot = {
      source: sourceMeta,
      monthlyActuals,
      forecastAdjustments,
      forecastBasisActuals,
      forecast,
      departmentCosts,
      categoryCosts,
      vendorCosts,
      apiUsageData,
      gensparkUsageData: initialGensparkUsageData,
      aiToolApprovalData,
      apiForecast,
      apiAdjustedForecast,
      operatingPlan: {
        startMonth: OPERATING_PLAN_START_MONTH,
        subscriptions: aiToolApprovalData.toolSummary,
        subscriptionUsd: operatingPlanSubscriptionUsd,
        subscriptionKrw: operatingPlanSubscriptionKrw,
        apiBudgetKrw: OPERATING_PLAN_API_BUDGET_KRW,
        apiForecastKrw: operatingPlanApiKrw,
        apiForecastSource: operatingPlanApiSourceLabel,
        usdToKrwRate: OPERATING_PLAN_USD_TO_KRW,
        forecastTotalKrw: operatingPlanForecastTotal,
      },
      generatedAt: new Date().toISOString(),
      forecastMethod: `${fixedCostForecastMethodLabel(operatingPlanSubscriptionKrw)} - 5월 이후는 AI 도구 결재 현황의 현재 월 고정 비용을 예측 기준으로 두고 실측 API 월환산 비용을 추가`,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ai-cost-dashboard-snapshot.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setToast("엑셀 기반 비용 스냅샷을 내보냈습니다.");
    window.setTimeout(() => setToast(""), 2400);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <Gauge size={24} />
          </div>
          <div>
            <h1>전사 AI 사용 현황 대시보드</h1>
            <p>
              {sourceMeta.period} · 원천 {sourceMeta.sourceSheet} {sourceMeta.recordCount}건
            </p>
          </div>
        </div>
        <div className="top-actions">
          <div className="source-chip" title={sourceMeta.fileName}>
            <FileSpreadsheet size={17} />
            {isStoredData ? "저장된 업로드 데이터" : "기본 원천 데이터"}
          </div>
          <label className="upload-button">
            <Upload size={17} />
            {isUploading ? "읽는 중" : "엑셀 업로드"}
            <input
              accept=".xlsx"
              type="file"
              onChange={(event) => {
                void handleUpload(event.currentTarget.files?.[0] ?? null);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <button className="command-button" type="button" onClick={exportSnapshot}>
            <Download size={17} />
            내보내기
          </button>
          <button
            className="command-button"
            disabled={!isStoredData}
            title={isStoredData ? "기본 데이터로 되돌리기" : "저장된 업로드 데이터가 없습니다."}
            type="button"
            onClick={resetDashboard}
          >
            <RotateCcw size={17} />
            초기화
          </button>
        </div>
      </header>

      <nav className="view-tabs" aria-label="대시보드 보기">
        <button
          className={activeView === "adoption" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("adoption")}
        >
          <UserCheck size={17} />
          활용성
        </button>
        <button
          className={activeView === "genspark" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("genspark")}
        >
          <Sparkles size={17} />
          AI 활용 상세 분석
        </button>
        <button
          className={activeView === "approval" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("approval")}
        >
          <WalletCards size={17} />
          AI 도구 결재 현황
        </button>
        <button
          className={activeView === "monthly" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("monthly")}
        >
          <LineChart size={17} />
          월별/예측
        </button>
        <button
          className={activeView === "api" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("api")}
        >
          <Bot size={17} />
          API 사용
        </button>
      </nav>

      {activeView === "api" ? (
        <section className="metric-grid" aria-label="API 사용 핵심 지표">
          <MetricCard
            icon={<Bot size={21} />}
            label={`${apiUsageData.source.period} API 토큰`}
            tone="teal"
            value={formatTokens(apiTotals.totalTokens)}
            footer={`OpenAI · Gemini · Claude`}
          />
          <MetricCard
            icon={<Cpu size={21} />}
            label="수집된 요청"
            tone="green"
            value={`${numberFormat.format(apiTotals.totalRequests)}건`}
            footer="Claude는 요청 수 미제공"
          />
          <MetricCard
            icon={<CircleDollarSign size={21} />}
            label="추정 API 비용"
            tone="amber"
            value={formatUsd(apiTotals.totalCostUsd)}
            footer={apiUsageData.source.mode}
          />
          <MetricCard
            icon={<KeyRound size={21} />}
            label="활성 키/오류율"
            tone="steel"
            value={`${apiTotals.activeKeys}개`}
            footer={`가중 오류율 ${formatRate(apiTotals.avgErrorRate)}`}
          />
        </section>
      ) : activeView === "approval" ? (
        <section className="metric-grid" aria-label="AI 도구 결재 핵심 지표">
          <MetricCard
            icon={<WalletCards size={21} />}
            label="결재 계정"
            tone="teal"
            value={`${numberFormat.format(aiToolApprovalData.totalAccounts)}개`}
            footer={aiToolApprovalData.source.period}
          />
          <MetricCard
            icon={<CircleDollarSign size={21} />}
            label="월 구독료"
            tone="green"
            value={formatManWon(aiToolApprovalData.totalMonthlyKrw)}
            footer={`${formatPreciseUsd(aiToolApprovalData.totalMonthlyUsd)} · ${formatWon(aiToolApprovalData.totalMonthlyKrw)}`}
          />
          <MetricCard
            icon={<ShieldCheck size={21} />}
            label="AI 전용 카드"
            tone="amber"
            value={`${numberFormat.format(aiToolApprovalData.aiDedicatedCardAccounts)}개`}
            footer={formatWon(aiToolApprovalData.aiDedicatedCardKrw)}
          />
          <MetricCard
            icon={<KeyRound size={21} />}
            label="공용 법인 카드"
            tone="steel"
            value={`${numberFormat.format(aiToolApprovalData.namedCorporateCardAccounts)}개`}
            footer={formatWon(aiToolApprovalData.namedCorporateCardKrw)}
          />
        </section>
      ) : activeView === "adoption" ? (
        <section className="metric-grid" aria-label="AI 정액제 활용 핵심 지표">
          <MetricCard
            icon={<UserCheck size={21} />}
            label="관리 생성형 AI 서비스"
            tone="teal"
            value="5종"
            footer={`Gemini · Claude Export · Genspark · Claude Team · Gamma ${gammaUsageData.source.status}`}
          />
          <MetricCard
            icon={<Sparkles size={21} />}
            label="수집된 활용 기록"
            tone="green"
            value={`${numberFormat.format(aiUsageInsight.totalRecords)}건`}
            footer="Claude export와 Genspark 작업 로그 통합"
          />
          <MetricCard
            icon={<Bot size={21} />}
            label="Claude Team 사용"
            tone="amber"
            value={
              claudeTeamUsageData.totalCodeLines > 0
                ? `${numberFormat.format(claudeTeamUsageData.totalCodeLines)}줄`
                : formatTokens(claudeTeamUsageData.totalTokens)
            }
            footer={
              claudeTeamUsageData.totalCodeLines > 0
                ? `${formatPreciseUsd(claudeTeamUsageData.totalNetSpendUsd)} · ${formatTokens(claudeTeamUsageData.totalTokens)} tokens`
                : `${formatPreciseUsd(claudeTeamUsageData.totalNetSpendUsd)} · 요청 ${numberFormat.format(claudeTeamUsageData.totalRequests)}건`
            }
          />
          <MetricCard
            icon={<Gauge size={21} />}
            label="Gamma API 확인"
            tone="steel"
            value={
              typeof gammaUsageData.latestCreditsRemaining === "number"
                ? `${numberFormat.format(gammaUsageData.latestCreditsRemaining)} cr`
                : gammaUsageData.trackedGenerations > 0
                ? `${numberFormat.format(gammaUsageData.totalCreditsDeducted)} cr`
                : `${numberFormat.format(gammaUsageData.themeCount + gammaUsageData.folderCount)}개`
            }
            footer={
              typeof gammaUsageData.latestCreditsRemaining === "number"
                ? `${gammaUsageData.creditSource === "web-crawl" ? "웹 크롤링" : "Generation"} · 테마 ${numberFormat.format(gammaUsageData.themeCount)}`
                : gammaUsageData.trackedGenerations > 0
                ? `Generation ${numberFormat.format(gammaUsageData.trackedGenerations)}건 · 잔여 ${gammaUsageData.latestCreditsRemaining ?? "-"}`
                : `테마 ${numberFormat.format(gammaUsageData.themeCount)} · 폴더 ${numberFormat.format(gammaUsageData.folderCount)}`
            }
          />
        </section>
      ) : activeView === "genspark" ? (
        <section className="metric-grid" aria-label="AI 활용 상세 분석 핵심 지표">
          <MetricCard
            icon={<Sparkles size={21} />}
            label="통합 분석 대상"
            tone="teal"
            value={`${numberFormat.format(aiUsageInsight.totalRecords)}건`}
            footer="작업·대화 로그를 업무 주제 기준으로 재분류"
          />
          <MetricCard
            icon={<Search size={21} />}
            label="실무 산출형 활용"
            tone="green"
            value={`${numberFormat.format(aiUsageInsight.outputOrientedRecords)}건`}
            footer="제안·개발·문서·데이터 산출물 중심"
          />
          <MetricCard
            icon={<FileSpreadsheet size={21} />}
            label="Drive 저장 산출물"
            tone="amber"
            value={`${numberFormat.format(driveArtifactRepositoryData.totals.files)}개`}
            footer={`${driveArtifactsByOwner} · zip 내부 ${numberFormat.format(driveArtifactRepositoryData.zipAnalysisPipeline.totals.extractedFiles)}개`}
          />
        </section>
      ) : (
        <section className="metric-grid" aria-label="핵심 비용 지표">
          <MetricCard
            icon={<CircleDollarSign size={21} />}
            label={`${actualRange} 누적 비용`}
            tone="teal"
            value={formatManWon(sourceMeta.totalActual)}
            footer={`${formatWon(sourceMeta.totalActual)} · ${sourceMeta.recordCount}건`}
          />
          <MetricCard
            icon={<TrendingUp size={21} />}
            label={`${lastActual.label} 비용`}
            tone="coral"
            value={formatManWon(lastActual.amount)}
            footer={`전월 대비 ${formatRate(lastMoM, true)}`}
          />
          <MetricCard
            icon={<CalendarRange size={21} />}
            label={`${forecastRange} API/고정비 반영 예측`}
            tone="amber"
            value={formatManWon(apiAdjustedForecastTotal)}
            footer={`5월 이후 현재 월 고정비 ${formatManWon(operatingPlanSubscriptionKrw)}/월 · ${operatingPlanApiSourceLabel} ${formatManWon(operatingPlanApiKrw)}/월`}
          />
          <MetricCard
            icon={<WalletCards size={21} />}
            label="2025년 연간 대비"
            tone="steel"
            value={formatRate(priorYearRate)}
            footer={`2025년 전체 ${formatManWon(sourceMeta.priorYearTotal)}`}
          />
        </section>
      )}

      {activeView === "monthly" && (
        <MonthlyView
          monthlySeries={monthlySeries}
          forecast={forecast}
          apiAdjustedForecast={apiAdjustedForecast}
          apiAdjustedForecastGrowth={apiAdjustedForecastGrowth}
          apiAdjustedForecastTotal={apiAdjustedForecastTotal}
          apiForecast={apiForecast}
          apiForecastAddedTotal={apiForecastAddedTotal}
          operatingPlanForecastTotal={operatingPlanForecastTotal}
          operatingPlanApiKrw={operatingPlanApiKrw}
          operatingPlanApiSourceLabel={operatingPlanApiSourceLabel}
          operatingPlanMonths={operatingPlanMonths}
          operatingPlanSubscriptionKrw={operatingPlanSubscriptionKrw}
          operatingPlanSubscriptionSummary={operatingPlanSubscriptionSummary}
          operatingPlanSubscriptionUsd={operatingPlanSubscriptionUsd}
          forecastAdjustments={forecastAdjustments}
          forecastBasisActuals={forecastBasisActuals}
          sourceMeta={sourceMeta}
          monthlyActuals={monthlyActuals}
        />
      )}

      {activeView === "adoption" && (
        <AdoptionView
          claudeTeamUsageData={claudeTeamUsageData}
          gammaUsageData={gammaUsageData}
          gensparkUsageData={initialGensparkUsageData}
          workspaceUsageData={workspaceUsageData}
        />
      )}

      {activeView === "genspark" && (
        <GensparkUsageView
          claudeTeamUsageData={claudeTeamUsageData}
          driveRepositoryData={driveArtifactRepositoryData}
          usageData={initialGensparkUsageData}
        />
      )}

      {activeView === "approval" && <AiToolApprovalView approvalData={aiToolApprovalData} />}

      {activeView === "api" && <ApiUsageView apiUsageData={apiUsageData} />}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function MonthlyView({
  apiAdjustedForecast,
  apiAdjustedForecastGrowth,
  apiAdjustedForecastTotal,
  apiForecast,
  apiForecastAddedTotal,
  operatingPlanForecastTotal,
  operatingPlanApiKrw,
  operatingPlanApiSourceLabel,
  operatingPlanMonths,
  operatingPlanSubscriptionKrw,
  operatingPlanSubscriptionSummary,
  operatingPlanSubscriptionUsd,
  forecast,
  forecastAdjustments,
  forecastBasisActuals,
  monthlyActuals,
  monthlySeries,
  sourceMeta,
}: {
  apiAdjustedForecast: Array<
    ForecastPoint & {
      apiUsageKrw: number;
      apiSource: ApiForecastSource;
      apiSourceLabel: string;
      baseForecastKrw: number;
      operatingPlanKrw: number;
      operatingPlanUsd: number;
      isOperatingPlan: boolean;
      totalWithApi: number;
    }
  >;
  apiAdjustedForecastGrowth: number;
  apiAdjustedForecastTotal: number;
  apiForecast: ApiUsageRunRateForecast;
  apiForecastAddedTotal: number;
  operatingPlanForecastTotal: number;
  operatingPlanApiKrw: number;
  operatingPlanApiSourceLabel: string;
  operatingPlanMonths: number;
  operatingPlanSubscriptionKrw: number;
  operatingPlanSubscriptionSummary: string;
  operatingPlanSubscriptionUsd: number;
  forecast: ForecastPoint[];
  forecastAdjustments: DashboardData["forecastAdjustments"];
  forecastBasisActuals: MonthlyActual[];
  monthlyActuals: MonthlyActual[];
  monthlySeries: Array<{
    label: string;
    actual: number | null;
    forecast: number | null;
    operatingPlanForecast: number | null;
    apiUsageForecast: number | null;
    apiSourceLabel: string | null;
    forecastWithApi: number | null;
    forecastBasis: number | null;
    adjustment: number | null;
    fixedPlan: number;
    transactions: number | null;
    status: string;
  }>;
  sourceMeta: SourceMeta;
}) {
  const actualRange = monthRangeLabel(monthlyActuals);
  const forecastRange = monthRangeLabel(forecast);
  const adjustmentTotal = forecastAdjustments.reduce((sum, item) => sum + item.amount, 0);
  const apiForecastProviderSummary = formatApiForecastProviderSummary(apiForecast);
  const actualFixedPlanTotal = operatingPlanSubscriptionKrw * monthlyActuals.length;
  const overFixedPlan = sourceMeta.totalActual - actualFixedPlanTotal;
  const actualFixedPlanRatio = actualFixedPlanTotal > 0 ? sourceMeta.totalActual / actualFixedPlanTotal : 0;

  return (
    <div className="content-grid monthly-view">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Monthly Spend</span>
            <h2>월별 비용과 {forecastRange} 예측</h2>
          </div>
          <span className="state-pill warning">현재 월 고정비 기준</span>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlySeries} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={formatAxisWon} tickLine={false} axisLine={false} width={64} />
              <Tooltip formatter={(value) => formatWon(Number(value))} />
              <Legend />
              <Bar dataKey="actual" name="실적" fill="#0f8b8d" radius={[5, 5, 0, 0]} />
              <Bar dataKey="forecast" name="기존 예측" stackId="forecast" fill="#c58612" radius={[5, 5, 0, 0]} />
              <Bar
                dataKey="operatingPlanForecast"
                name="현재 월 고정비"
                stackId="forecast"
                fill="#5f6f8c"
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="apiUsageForecast"
                name="API 실측/예산"
                stackId="forecast"
                fill="#2f8f46"
                radius={[5, 5, 0, 0]}
              />
              <Line
                dataKey="forecastWithApi"
                name="API/고정비 반영 예측"
                stroke="#2f8f46"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                dataKey="forecastBasis"
                name="실적 보정 기준"
                stroke="#e85d4f"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                dataKey="fixedPlan"
                name="현재 월 고정비 기준"
                stroke="#5f6f8c"
                strokeDasharray="6 4"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Adjustment</span>
            <h2>예측 보정</h2>
          </div>
        </div>
        <div className="forecast-list">
          {monthlyActuals.map((item) => {
            const adjustment = forecastAdjustments.find((entry) => entry.month === item.month);
            const basis = forecastBasisActuals.find((entry) => entry.month === item.month);
            return (
              <article className="forecast-row" key={item.month}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{adjustment?.reason ?? "보정 없음"}</span>
                </div>
                <b>{formatManWon(adjustment?.amount ?? 0)}</b>
                <small>실적 보정 기준 {formatManWon(basis?.amount ?? item.amount)}</small>
              </article>
            );
          })}
        </div>
        <div className="insight-box">
          <Activity size={18} />
          <div>
            <strong>일시 비용 {formatManWon(adjustmentTotal)} 제외</strong>
            <span>실제 지출은 유지하고, 개발/데모용 구글 API 상승분만 예측 산식에서 제외했습니다.</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Forecast</span>
            <h2>예측 요약</h2>
          </div>
        </div>
        <div className="forecast-list">
          {apiAdjustedForecast.map((item) => (
            <article className="forecast-row" key={item.month}>
              <div>
                <strong>{item.label}</strong>
                {item.isOperatingPlan ? (
                  <span>
                    현재 월 고정비 {formatManWon(item.baseForecastKrw)} · {item.apiSourceLabel}{" "}
                    {formatManWon(item.apiUsageKrw)}
                  </span>
                ) : (
                  <span>
                    기존 {formatManWon(item.amount)} · {item.apiSourceLabel} {formatManWon(item.apiUsageKrw)}
                  </span>
                )}
              </div>
              <b>{formatManWon(item.totalWithApi)}</b>
            </article>
          ))}
        </div>
        <div className="insight-box">
          <Activity size={18} />
          <div>
            <strong>
              {forecastRange} API/고정비 반영 합계 {formatManWon(apiAdjustedForecastTotal)}
            </strong>
            <span>
              {OPERATING_PLAN_START_MONTH}부터는 AI 도구 결재 현황 탭의 현재 월 고정 비용{" "}
              {formatManWon(operatingPlanSubscriptionKrw)}을 예측 기준으로 적용합니다.
            </span>
            <span>
              API 반영분 {formatManWon(apiForecastAddedTotal)} · 고정비 적용 기준{" "}
              {formatManWon(operatingPlanForecastTotal)} · 적용월 {operatingPlanMonths}개월 · 고정비 기준 대비{" "}
              {formatRate(apiAdjustedForecastGrowth, true)}
            </span>
            <span>
              현재 월 고정 비용 {formatPreciseUsd(operatingPlanSubscriptionUsd)}/월 · 환율{" "}
              {numberFormat.format(OPERATING_PLAN_USD_TO_KRW)}원 · 현재월 기준 {operatingPlanApiSourceLabel}{" "}
              {formatManWon(operatingPlanApiKrw)}/월
            </span>
            <span>
              API는 해당월 실측이 있으면 그 달의 실측 누계와 잔여기간 run-rate를 먼저 쓰고, 실측이 없는 미래월만
              최신 월환산 비용을 사용합니다.
            </span>
            <span>
              구성: {operatingPlanSubscriptionSummary}
            </span>
            {apiForecast.isReady ? (
              <>
                <span>
                  최근 {apiForecast.measuredDays}일 중 provider별 이상치 {apiForecast.costOutlierDays}건의 초과분{" "}
                  {formatUsd(apiForecast.oneTimeCostUsd)}은 월 반복 비용에서 제외했습니다.
                </span>
                <span>{apiForecastProviderSummary}</span>
                <span>
                  반복 사용량 월환산 {formatTokens(apiForecast.monthlyTokens)} 토큰 · 요청{" "}
                  {numberFormat.format(apiForecast.monthlyRequests)}건 · USD 1 ={" "}
                  {numberFormat.format(apiForecast.usdToKrwRate)}원 가정
                </span>
              </>
            ) : (
              <span>API 사용량 수집이 끝나면 반복 비용과 사용량을 예측에 반영합니다.</span>
            )}
          </div>
        </div>
      </section>



      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Plan Gap</span>
            <h2>현재 월 고정비 기준 대비</h2>
          </div>
        </div>
        <div className="plan-stack">
          <GaugeRow
            label={`${actualRange} 현재 월 고정비 기준`}
            max={sourceMeta.totalActual}
            tone="steel"
            value={actualFixedPlanTotal}
          />
          <GaugeRow
            label="실제 누적 비용"
            max={sourceMeta.totalActual}
            tone="teal"
            value={sourceMeta.totalActual}
          />
          <div className="rule-row">
            <span>초과 비용</span>
            <strong>{formatManWon(overFixedPlan)}</strong>
          </div>
          <div className="rule-row">
            <span>실제/기준 배율</span>
            <strong>{actualFixedPlanRatio.toFixed(2)}x</strong>
          </div>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Actual & Forecast</span>
            <h2>월별 비용 테이블</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>월</th>
                <th>구분</th>
                <th>실제 비용</th>
                <th>예측 제외</th>
                <th>실적 보정 기준</th>
                <th>현재 월 고정비</th>
                <th>API 실측/예산</th>
                <th>API/고정비 반영</th>
                <th>건수</th>
                <th>고정비 기준</th>
                <th>차이</th>
              </tr>
            </thead>
            <tbody>
              {monthlySeries.map((row) => {
                const value = row.actual ?? row.forecast ?? row.operatingPlanForecast ?? 0;
                const comparisonValue = row.forecastWithApi ?? row.forecastBasis ?? value;
                return (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>
                      <span className={`run-status ${row.status}`}>{row.status}</span>
                    </td>
                    <td>{formatWon(value)}</td>
                    <td>{row.adjustment === null ? "-" : formatWon(row.adjustment)}</td>
                    <td>{row.forecastBasis === null ? "-" : formatWon(row.forecastBasis)}</td>
                    <td>{row.operatingPlanForecast === null ? "-" : formatWon(row.operatingPlanForecast)}</td>
                    <td>
                      {row.apiUsageForecast === null ? "-" : formatWon(row.apiUsageForecast)}
                      {row.apiSourceLabel ? <small>{row.apiSourceLabel}</small> : null}
                    </td>
                    <td>{row.forecastWithApi === null ? "-" : formatWon(row.forecastWithApi)}</td>
                    <td>{row.transactions ?? "-"}</td>
                    <td>{formatWon(row.fixedPlan)}</td>
                    <td>{formatWon(comparisonValue - row.fixedPlan)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DepartmentView({
  commonDepartmentShare,
  commonDepartmentTotal,
  departmentCosts,
  monthlyActuals,
  sourceMeta,
}: {
  commonDepartmentShare: number;
  commonDepartmentTotal: number;
  departmentCosts: DashboardData["departmentCosts"];
  monthlyActuals: MonthlyActual[];
  sourceMeta: SourceMeta;
}) {
  const activeDepartments = departmentCosts.filter((item) => item.total > 0);
  const departmentChartData = activeDepartments.map((item) => ({
    name: item.name.replace("(공용)", "").replace("(단독)", ""),
    total: item.total,
  }));
  const monthStackData = monthlyActuals.map((month) => ({
    month: month.label,
    monthKey: month.month,
  }));

  return (
    <div className="content-grid department-view">
      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Departments</span>
            <h2>부서별 누적 비용</h2>
          </div>
          <span className="state-pill warning">공용 집중</span>
        </div>
        <div className="bar-frame">
          <div className="comparison-bars">
            {departmentChartData.map((item, index) => {
              const max = departmentChartData[0].total;
              return (
                <div className="comparison-bar" key={item.name}>
                  <div className="comparison-track">
                    <span
                      style={{
                        height: `${Math.max((item.total / max) * 100, 2)}%`,
                        background: chartColors[index % chartColors.length],
                      }}
                    />
                  </div>
                  <strong>{formatManWon(item.total)}</strong>
                  <small>{item.name}</small>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Monthly Mix</span>
            <h2>월별 부서 구성</h2>
          </div>
        </div>
        <div className="bar-frame">
          <div className="stacked-months">
            {monthStackData.map((month) => {
              const total = activeDepartments.reduce(
                (sum, item) => sum + Number(item.monthly[month.monthKey] ?? 0),
                0,
              );
              return (
                <article className="stacked-month" key={month.month}>
                  <div className="stacked-month-head">
                    <strong>{month.month}</strong>
                    <span>{formatWon(total)}</span>
                  </div>
                  <div className="stacked-track">
                    {activeDepartments.map((item, index) => {
                      const value = Number(item.monthly[month.monthKey] ?? 0);
                      return (
                        <span
                          key={item.name}
                          style={{
                            width: `${total ? (value / total) * 100 : 0}%`,
                            background: chartColors[index % chartColors.length],
                          }}
                          title={`${item.name}: ${formatWon(value)}`}
                        />
                      );
                    })}
                  </div>
                </article>
              );
            })}
            <div className="stacked-legend">
              {activeDepartments.map((item, index) => (
                <span key={item.name}>
                  <i style={{ background: chartColors[index % chartColors.length] }} />
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Cost Ownership</span>
            <h2>부서별 사용 현황</h2>
          </div>
          <span className="state-pill ok">
            공용 {formatManWon(commonDepartmentTotal)} · {formatRate(commonDepartmentShare)}
          </span>
        </div>
        <div className="department-list">
          {departmentCosts.map((item) => {
            const share = sourceMeta.totalActual ? (item.total / sourceMeta.totalActual) * 100 : 0;
            return (
              <article className="department-row" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    원천명 {item.sourceName} · {item.transactions}건
                  </span>
                  <small>{item.ownerNote}</small>
                </div>
                <div className="department-meter" aria-label={`${item.name} 비용 점유율`}>
                  <span style={{ width: `${Math.min(share, 100)}%` }} />
                </div>
                <div className="department-numbers">
                  <strong>{formatWon(item.total)}</strong>
                  <span>{formatRate(share)}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function DetailView({
  categoryCosts,
  filteredTransactions,
  query,
  setQuery,
  vendorCosts,
}: {
  categoryCosts: DashboardData["categoryCosts"];
  filteredTransactions: TransactionCost[];
  query: string;
  setQuery: (value: string) => void;
  vendorCosts: DashboardData["vendorCosts"];
}) {
  return (
    <div className="content-grid detail-view">
      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Tools</span>
            <h2>AI 도구/분류별 비용</h2>
          </div>
        </div>
        <div className="pie-layout">
          <div className="pie-frame">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryCosts}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={2}
                >
                  {categoryCosts.map((entry) => (
                    <Cell fill={entry.color} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatWon(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="category-list">
            {categoryCosts.map((item) => (
              <div className="category-row" key={item.name}>
                <span className="category-dot" style={{ background: item.color }} />
                <strong>{item.name}</strong>
                <b>{formatManWon(item.amount)}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Vendors</span>
            <h2>거래처 상위</h2>
          </div>
        </div>
        <div className="vendor-list">
          {vendorCosts.map((item) => {
            const share = (item.amount / vendorCosts[0].amount) * 100;
            return (
              <article className="vendor-row" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{formatWon(item.amount)}</span>
                </div>
                <div className="vendor-meter" aria-label={`${item.name} 비용 규모`}>
                  <span style={{ width: `${share}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Transactions</span>
            <h2>고액 거래 내역</h2>
          </div>
          <label className="search-box">
            <Search size={17} />
            <input
              placeholder="부서, 품명, 거래처"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>일자</th>
                <th>부서</th>
                <th>품명</th>
                <th>거래처</th>
                <th>분류</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((row) => (
                <tr key={`${row.date}-${row.item}-${row.amount}`}>
                  <td>{row.date}</td>
                  <td>{row.department}</td>
                  <td>
                    <strong>{row.item}</strong>
                  </td>
                  <td>{row.vendor}</td>
                  <td>{row.category}</td>
                  <td>{formatWon(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function GensparkUsageView({
  claudeTeamUsageData,
  driveRepositoryData,
  usageData,
}: {
  claudeTeamUsageData: ClaudeTeamUsageData;
  driveRepositoryData: DriveArtifactRepositoryData;
  usageData: GensparkUsageData;
}) {
  const insight = usageData.insightAnalysis;
  const claudeExport = usageData.chatGptExport;
  const topTopic = insight.topicInsights[0];
  const claudeAccountIdentityDirectory = buildClaudeAccountIdentityDirectory(claudeTeamUsageData);
  const maxClaudeAccountMessages = Math.max(...(claudeExport?.accountUsage.map((account) => account.messages) ?? [1]), 1);
  const maxDriveRepositoryFiles = Math.max(...driveRepositoryData.repositories.map((repository) => repository.fileCount), 1);
  const gensparkDrive = usageData.driveAnalysis;
  const maxGensparkDriveMonth = Math.max(...(gensparkDrive?.monthlyBreakdown.map((month) => month.tasks) ?? [1]), 1);
  const gammaDeckCount = gammaDriveUsageData.deckCount;
  const gammaTotalSlides = gammaDriveUsageData.totalSlides;
  const gammaTopArtifact = gammaDriveUsageData.artifacts[0];
  return (
    <div className="content-grid ai-insight-view">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">AI Usage Insight</span>
            <h2>무엇에 쓰이고 있나</h2>
          </div>
          <div className="panel-header-side">
            <span className="state-pill neutral">{insight.period}</span>
          </div>
        </div>
        <p className="insight-lead">
          도구별 집계를 합치면 AI는 주로 <strong>{topTopic?.topic ?? "실무 문제 해결"}</strong>에 쓰이고 있습니다.
          비용보다 먼저 봐야 할 지표는 어떤 업무가 반복되고, 어느 영역에서 실제 산출물이 만들어지는지입니다.
        </p>
        <div className="topic-chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={insight.topicInsights}
              layout="vertical"
              margin={{ top: 10, right: 18, left: 128, bottom: 8 }}
            >
              <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                dataKey="topic"
                type="category"
                tickLine={false}
                axisLine={false}
                width={132}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${numberFormat.format(Number(value))}건`, "분석 이력"]}
                labelFormatter={(label) => {
                  const row = insight.topicInsights.find((item) => item.topic === label);
                  return row ? `${row.topic} · ${formatRate(row.share)}` : label;
                }}
              />
              <Bar dataKey="tasks" name="분석 이력" radius={[0, 5, 5, 0]}>
                {insight.topicInsights.map((entry) => (
                  <Cell fill={entry.color} key={entry.topic} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="topic-evidence-list">
          {insight.topicInsights.slice(0, 3).map((topic) => (
            <article key={topic.topic}>
              <span className="category-dot" style={{ background: topic.color }} />
              <div>
                <strong>{topic.signal}</strong>
                <span>{topic.businessUse}</span>
              </div>
              <b>{formatRate(topic.share)}</b>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Decision Signals</span>
            <h2>핵심 인사이트</h2>
          </div>
        </div>
        <div className="insight-signal-list">
          {insight.executiveSummary.map((summary, index) => (
            <article className="insight-signal-card" key={summary}>
              <span>{index + 1}</span>
              <strong>{summary}</strong>
            </article>
          ))}
        </div>
      </section>

      {gensparkDrive && (
        <section className="panel panel-wide">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Genspark Drive Audit</span>
              <h2>Genspark 폴더 사용 내역</h2>
            </div>
            <div className="panel-header-side">
              <span className="state-pill ok">Drive 조회</span>
              <span className="state-pill neutral">{gensparkDrive.source.period}</span>
            </div>
          </div>
          <div className="drive-summary-grid">
            <article>
              <span>세션</span>
              <strong>{numberFormat.format(gensparkDrive.totalSessions)}건</strong>
              <small>{gensparkDrive.source.accountLabel}</small>
            </article>
            <article>
              <span>완료/실패</span>
              <strong>
                {numberFormat.format(gensparkDrive.finishedSessions)} / {numberFormat.format(gensparkDrive.failedSessions)}
              </strong>
              <small>대기 {numberFormat.format(gensparkDrive.pendingSessions)}건</small>
            </article>
            <article>
              <span>최다 유형</span>
              <strong>{gensparkDrive.typeBreakdown[0]?.name ?? "-"}</strong>
              <small>{numberFormat.format(gensparkDrive.typeBreakdown[0]?.tasks ?? 0)}건 · {formatRate(gensparkDrive.typeBreakdown[0]?.share ?? 0)}</small>
            </article>
            <article>
              <span>Drive 산출물</span>
              <strong>{numberFormat.format(gensparkDrive.representativeFiles.length)}개 대표</strong>
              <small>{gensparkDrive.directFileSignal}</small>
            </article>
          </div>

          <div className="chatgpt-export-grid compact">
            <div className="chatgpt-export-column">
              <h3>무엇에 쓰였나</h3>
              <div className="claude-topic-list">
                {gensparkDrive.purposeBreakdown.map((purpose) => (
                  <MeterRow
                    color={purpose.color}
                    key={purpose.name}
                    label={`${purpose.name} · ${numberFormat.format(purpose.tasks)}건`}
                    value={purpose.share}
                    valueLabel={formatRate(purpose.share)}
                  />
                ))}
              </div>
            </div>
            <div className="chatgpt-export-column">
              <h3>월별 집중도</h3>
              <div className="claude-topic-list">
                {gensparkDrive.monthlyBreakdown.map((month) => (
                  <MeterRow
                    color={month.color}
                    key={month.name}
                    label={`${month.name} · ${month.note}`}
                    value={(month.tasks / maxGensparkDriveMonth) * 100}
                    valueLabel={`${numberFormat.format(month.tasks)}건`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="table-wrap claude-export-table">
            <table>
              <thead>
                <tr>
                  <th>Drive 파일</th>
                  <th>유형</th>
                  <th>사용 목적</th>
                  <th>크기</th>
                  <th>수정 시각</th>
                </tr>
              </thead>
              <tbody>
                {gensparkDrive.representativeFiles.map((file) => (
                  <tr key={file.url}>
                    <td>
                      <a href={file.url} target="_blank" rel="noreferrer noopener">
                        <strong>{file.title}</strong>
                      </a>
                    </td>
                    <td>{file.fileType}</td>
                    <td>{file.purpose}</td>
                    <td>{file.sizeLabel}</td>
                    <td>{formatKstDateTime(file.modifiedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="insight-box">
            <FileSpreadsheet size={18} />
            <div>
              <strong>{gensparkDrive.source.name}</strong>
              <span>{gensparkDrive.source.note}</span>
              {gensparkDrive.insights.map((driveInsight) => (
                <span key={driveInsight}>{driveInsight}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="panel panel-wide gamma-drive-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Gamma Output Analysis</span>
            <h2>Drive 폴더 기반 Gamma 활용 현황</h2>
          </div>
          <span className="state-pill ok">{gammaDriveUsageData.source.status}</span>
        </div>
        <div className="gamma-drive-summary">
          <div className="gamma-drive-lede">
            <span>분석 대상</span>
            <strong>{numberFormat.format(gammaDeckCount)}개 발표자료</strong>
            <p>{gammaDriveUsageData.businessUse}</p>
            <small>{gammaDriveUsageData.source.note}</small>
          </div>
          <div className="gamma-drive-metrics">
            <div>
              <span>총 분량</span>
              <strong>{numberFormat.format(gammaTotalSlides)}장</strong>
            </div>
            <div>
              <span>핵심 주제</span>
              <strong>{gammaDriveUsageData.primaryTheme}</strong>
            </div>
            <div>
              <span>대표 산출물</span>
              <strong>{gammaTopArtifact?.title ?? "-"}</strong>
            </div>
          </div>
        </div>
        <div className="gamma-topic-grid">
          {gammaDriveUsageData.topicMix.map((topic) => (
            <article className="gamma-topic-card" key={topic.topic}>
              <div>
                <strong>{topic.topic}</strong>
                <span>{numberFormat.format(topic.count)}개 deck</span>
              </div>
              <p>{topic.note}</p>
            </article>
          ))}
        </div>
        <div className="gamma-artifact-list">
          {gammaDriveUsageData.artifacts.slice(0, 6).map((artifact) => (
            <a className="gamma-artifact-row" key={artifact.id} href={artifact.url} target="_blank" rel="noreferrer">
              <div>
                <strong>{artifact.title}</strong>
                <span>{artifact.focus}</span>
              </div>
              <small>
                {artifact.category} · {artifact.slideCount}장
              </small>
            </a>
          ))}
        </div>
        <div className="insight-box">
          <FileText size={18} />
          <div>
            <strong>{gammaDriveUsageData.insights[0]}</strong>
            {gammaDriveUsageData.insights.slice(1).map((insight) => (
              <span key={insight}>{insight}</span>
            ))}
          </div>
        </div>
      </section>

      {claudeExport && (
        <section className="panel panel-wide">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Claude Export Audit</span>
              <h2>Claude 사용 이력 원천 검증</h2>
            </div>
            <div className="panel-header-side">
              <span className="state-pill ok">전체 이력 반영</span>
              <span className="state-pill neutral">{claudeExport.source.period}</span>
            </div>
          </div>
          <div className="claude-export-summary-grid">
            <article>
              <span>대화/메시지</span>
              <strong>{numberFormat.format(claudeExport.totalConversations)}개</strong>
              <small>{numberFormat.format(claudeExport.totalMessages)}메시지 · 첨부 {numberFormat.format(claudeExport.totalAttachments)}개</small>
            </article>
            <article>
              <span>활성 계정</span>
              <strong>{numberFormat.format(claudeExport.userDirectory.activeAccounts)}개</strong>
              <small>{claudeExport.userDirectory.domain} 사용자 {numberFormat.format(claudeExport.userDirectory.totalUsers)}명 중 매핑</small>
            </article>
          </div>

          <div className="chatgpt-export-grid compact">
            <div className="chatgpt-export-column">
              <h3>어디에 쓰이고 있나</h3>
              <div className="claude-topic-list">
                {claudeExport.usageTopics.map((topic) => (
                  <article className="claude-topic-item" key={topic.topic}>
                    <MeterRow
                      color={topic.color}
                      label={`${topic.topic} · ${numberFormat.format(topic.conversations)}대화`}
                      value={topic.messageShare}
                      valueLabel={`${numberFormat.format(topic.messages)}메시지 · ${formatRate(topic.messageShare)}`}
                    />
                    <small>{topic.businessUse}</small>
                    <small>근거: {topic.evidence}</small>
                  </article>
                ))}
              </div>
            </div>
            <div className="chatgpt-export-column">
              <h3>계정별 사용 확인</h3>
              <div className="claude-account-list">
                {claudeExport.accountUsage.map((account) => {
                  const identity = getClaudeAccountIdentity(claudeAccountIdentityDirectory, account.accountLabel);

                  return (
                    <article key={account.accountLabel}>
                      <div>
                        <strong>
                          {account.accountLabel}
                          {identity ? ` · ${identity.displayName}` : ""}
                        </strong>
                        {identity ? <span>{identity.email}</span> : null}
                        <span>{account.primaryUse}</span>
                      </div>
                      <b>{numberFormat.format(account.conversations)}대화</b>
                      <div className="department-meter" aria-label={`${account.accountLabel} 메시지 비중`}>
                        <span style={{ width: `${Math.min((account.messages / maxClaudeAccountMessages) * 100, 100)}%` }} />
                      </div>
                      <small>{numberFormat.format(account.messages)}메시지 · 첨부 {numberFormat.format(account.attachments)}개 · {account.verification}</small>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="insight-box">
            <FileSpreadsheet size={18} />
            <div>
              <strong>users.json·memories.json 반영 기준</strong>
              <span>{claudeExport.userDirectory.privacyNote}</span>
              {claudeExport.memoryUsage.map((memory) => (
                <span key={memory.accountLabel}>
                  {memory.accountLabel}: {numberFormat.format(memory.characters)}자 memory · {memory.signal}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Google Drive Repository</span>
            <h2>Claude Drive 산출물 저장소</h2>
          </div>
          <div className="panel-header-side">
            <span className="state-pill ok">Drive 조회</span>
            <span className="state-pill neutral">{driveRepositoryData.source.period}</span>
          </div>
        </div>
        <div className="drive-summary-grid">
          <article>
            <span>저장소</span>
            <strong>{numberFormat.format(driveRepositoryData.totals.repositories)}명</strong>
            <small>{driveRepositoryData.repositories.map((repository) => repository.owner).join(" · ")}</small>
          </article>
          <article>
            <span>총 파일</span>
            <strong>{numberFormat.format(driveRepositoryData.totals.files)}개</strong>
            <small>Google Drive 직접 포함 파일 기준</small>
          </article>
          <article>
            <span>프롬프트/산출물</span>
            <strong>
              {numberFormat.format(driveRepositoryData.totals.prompts)} / {numberFormat.format(driveRepositoryData.totals.outputs)}
            </strong>
            <small>프롬프트 원문과 응답·문서·데이터 파일</small>
          </article>
          <article>
            <span>Docs/데이터 파일</span>
            <strong>
              {numberFormat.format(driveRepositoryData.totals.documents)} / {numberFormat.format(driveRepositoryData.totals.dataFiles)}
            </strong>
            <small>Google Docs 문서와 엑셀 산출물</small>
          </article>
        </div>

        <div className="drive-repository-grid">
          {driveRepositoryData.repositories.map((repository) => (
            <article className="drive-repository-card" key={repository.owner}>
              <div className="drive-repository-head">
                <div>
                  <span>{repository.role}</span>
                  <strong>{repository.owner}</strong>
                </div>
                <a
                  className="drive-folder-link"
                  href={repository.folderUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  폴더 열기
                </a>
              </div>
              <div className="drive-repository-stats">
                <span>{numberFormat.format(repository.fileCount)}개 파일</span>
                <span>프롬프트 {numberFormat.format(repository.promptCount)}건</span>
                <span>활용도 {repository.utilizationScore}점</span>
              </div>
              <div className="usage-meter-cell">
                <strong>{repository.utilizationLevel}</strong>
                <div className="department-meter" aria-label={`${repository.owner} 저장 파일 비중`}>
                  <span style={{ width: `${Math.min((repository.fileCount / maxDriveRepositoryFiles) * 100, 100)}%` }} />
                </div>
                <small>폴더 수정 {formatKstDateTime(repository.folderModifiedAt)}</small>
              </div>
              <div className="drive-use-case-list">
                {repository.useCaseBreakdown.map((useCase) => (
                  <MeterRow
                    color={useCase.color}
                    key={`${repository.owner}-${useCase.label}`}
                    label={useCase.label}
                    value={useCase.share}
                    valueLabel={`${numberFormat.format(useCase.count)}개 · ${formatRate(useCase.share)}`}
                  />
                ))}
              </div>
              <div className="drive-repository-note">
                {repository.insights.map((insightText) => (
                  <span key={insightText}>{insightText}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="insight-box">
          <FileSpreadsheet size={18} />
          <div>
            <strong>Drive 원천 분석 기준</strong>
            <span>{driveRepositoryData.source.note}</span>
            {driveRepositoryData.insights.map((insightText) => (
              <span key={insightText}>{insightText}</span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function AiToolApprovalView({ approvalData }: { approvalData: AiToolApprovalData }) {
  const maxToolMonthlyKrw = Math.max(...approvalData.toolSummary.map((item) => item.monthlyKrw), 1);
  const maxDepartmentMonthlyKrw = Math.max(...approvalData.departmentSummary.map((item) => item.monthlyKrw), 1);
  const topTool = approvalData.toolSummary[0];
  const topToolTieCount = approvalData.toolSummary.filter((item) => item.monthlyKrw === topTool?.monthlyKrw).length;
  const topDepartment = approvalData.departmentSummary[0];

  return (
    <div className="content-grid approval-view">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Payment Control</span>
            <h2>결재수단별 월 구독료</h2>
          </div>
          <div className="panel-header-side">
            <span className="state-pill neutral">{approvalData.source.period}</span>
          </div>
        </div>
        <div className="approval-payment-grid">
          {approvalData.paymentSummary.map((payment, index) => (
            <article className="approval-payment-card" key={payment.key}>
              <span>{payment.key}</span>
              <strong>{formatWon(payment.monthlyKrw)}</strong>
              <small>
                {numberFormat.format(payment.count)}개 계정 · {formatPreciseUsd(payment.monthlyUsd)} · {formatRate(payment.share)}
              </small>
              <div className="department-meter" aria-label={`${payment.key} 결재 비중`}>
                <span style={{ width: `${Math.min(payment.share, 100)}%`, background: approvalPalette(index) }} />
              </div>
            </article>
          ))}
        </div>
        <div className="approval-meter-list">
          <h3>서비스 계열별 부담</h3>
          {approvalData.categorySummary.map((category, index) => (
            <MeterRow
              color={approvalPalette(index)}
              key={category.key}
              label={`${category.key} · ${numberFormat.format(category.count)}개`}
              value={category.share}
              valueLabel={`${formatWon(category.monthlyKrw)} · ${formatRate(category.share)}`}
            />
          ))}
        </div>
        <div className="insight-box approval-source-note">
          <FileSpreadsheet size={18} />
          <div>
            <strong>{approvalData.source.fileName}</strong>
            <span>{approvalData.source.sheetName} 시트의 결재 관련 컬럼을 반영했습니다.</span>
            <span>{approvalData.source.note}</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Decision Signals</span>
            <h2>결재 관리 포인트</h2>
          </div>
        </div>
        <div className="insight-signal-list">
          {approvalData.insights.map((insight, index) => (
            <article className="insight-signal-card" key={insight}>
              <span>{index + 1}</span>
              <strong>{insight}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Tool Cost Mix</span>
            <h2>도구별 결재 비용</h2>
          </div>
          <span className="state-pill ok">
            최상위 {topTool ? `${topToolTieCount > 1 ? `${topToolTieCount}개 도구` : topTool.key} ${formatWon(topTool.monthlyKrw)}` : "-"}
          </span>
        </div>
        <div className="approval-split-grid">
          <div className="approval-meter-list">
            {approvalData.toolSummary.map((tool, index) => (
              <MeterRow
                color={approvalPalette(index)}
                key={tool.key}
                label={`${tool.key} · ${numberFormat.format(tool.count)}개`}
                value={(tool.monthlyKrw / maxToolMonthlyKrw) * 100}
                valueLabel={`${formatWon(tool.monthlyKrw)} · ${formatPreciseUsd(tool.monthlyUsd)}`}
              />
            ))}
          </div>
          <div className="approval-meter-list">
            <h3>부서별 월액 상위</h3>
            {approvalData.departmentSummary.slice(0, 9).map((department, index) => (
              <MeterRow
                color={approvalPalette(index + 2)}
                key={department.key}
                label={`${department.key} · ${numberFormat.format(department.count)}개`}
                value={(department.monthlyKrw / maxDepartmentMonthlyKrw) * 100}
                valueLabel={`${formatWon(department.monthlyKrw)} · ${formatRate(department.share)}`}
              />
            ))}
            <small className="approval-footnote">
              최상위 부서는 {topDepartment?.key ?? "-"}이며, 계정 소유자/부서 표기에서 부서명을 추출했습니다.
            </small>
          </div>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Approval Ledger</span>
            <h2>AI 도구 결재 상세</h2>
          </div>
          <span className="state-pill neutral">{numberFormat.format(approvalData.records.length)}건</span>
        </div>
        <div className="table-wrap approval-record-table">
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>도구</th>
                <th>계정</th>
                <th>주사용자/부서</th>
                <th>월 구독료</th>
                <th>결재수단</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {approvalData.records.map((record) => (
                <tr key={record.no}>
                  <td>{record.no}</td>
                  <td>
                    <strong>{record.tool}</strong>
                    <small>{record.category}</small>
                  </td>
                  <td>
                    <strong>{record.account}</strong>
                    {record.linkedAccount !== "없음" && <small>연동 {record.linkedAccount}</small>}
                  </td>
                  <td>
                    <strong>{record.owner}</strong>
                    <small>{record.department}</small>
                  </td>
                  <td>
                    <strong>{formatPreciseUsd(record.monthlyUsd)}</strong>
                    <small>{formatWon(record.monthlyKrw)}</small>
                  </td>
                  <td>
                    <span className={`state-pill ${record.paymentMethod === "AI 전용 카드" ? "ok" : "neutral"}`}>
                      {record.paymentMethod}
                    </span>
                  </td>
                  <td>{record.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function approvalPalette(index: number) {
  const colors = ["#0f8b8d", "#2f9e44", "#d9902f", "#476a6f", "#e85d4f", "#6f7fd8", "#8a6f3d"];
  return colors[index % colors.length];
}

function AdoptionView({
  claudeTeamUsageData,
  gammaUsageData,
  gensparkUsageData,
  workspaceUsageData,
}: {
  claudeTeamUsageData: ClaudeTeamUsageData;
  gammaUsageData: GammaUsageData;
  gensparkUsageData: GensparkUsageData;
  workspaceUsageData: GeminiWorkspaceUsageData;
}) {
  const chatGptExport = gensparkUsageData.chatGptExport;
  const mostUsedGeminiApp = workspaceUsageData.appUsage[0];
  const peakGeminiDay = [...workspaceUsageData.dailyUsage].sort((a, b) => b.events - a.events)[0];
  const claudeTopProduct = claudeTeamUsageData.productUsage[0];
  const claudeTopModel = claudeTeamUsageData.modelUsage[0];
  const maxClaudeSpend = Math.max(...claudeTeamUsageData.users.map((user) => user.netSpendUsd), 1);
  const maxClaudeLines = Math.max(...claudeTeamUsageData.users.map((user) => user.codeLines), 1);
  const hasClaudeCodeLines = claudeTeamUsageData.totalCodeLines > 0;
  const claudeTopUser = [...claudeTeamUsageData.users].sort((a, b) =>
    hasClaudeCodeLines ? b.codeLines - a.codeLines : b.netSpendUsd - a.netSpendUsd,
  )[0];
  const gammaPlan = operatingPlanSubscriptions.find((item) => item.label.includes("Gamma"));
  const gammaMonthlyUsd = gammaPlan ? gammaPlan.quantity * gammaPlan.unitUsd : 0;
  const gammaDeckCount = gammaDriveUsageData.deckCount;
  const gammaTotalSlides = gammaDriveUsageData.totalSlides;
  const gammaTrackedLabel =
    typeof gammaUsageData.latestCreditsRemaining === "number"
      ? `${numberFormat.format(gammaUsageData.latestCreditsRemaining)} credits`
      : gammaUsageData.trackedGenerations > 0
      ? `${numberFormat.format(gammaUsageData.totalCreditsDeducted)} credits`
      : `${numberFormat.format(gammaUsageData.themeCount)} themes`;
  const gammaDetail =
    typeof gammaUsageData.latestCreditsRemaining === "number"
      ? `현재 잔여 ${numberFormat.format(gammaUsageData.latestCreditsRemaining)} credits · ${gammaUsageData.creditSource === "web-crawl" ? "웹 크롤링" : "Generation 응답"} 기준`
      : gammaUsageData.trackedGenerations > 0
      ? `Generation ${numberFormat.format(gammaUsageData.trackedGenerations)}건 · 완료 ${numberFormat.format(gammaUsageData.completedGenerations)}건 · 잔여 ${gammaUsageData.latestCreditsRemaining ?? "-"} credits`
      : `테마 ${numberFormat.format(gammaUsageData.themeCount)}개 · 폴더 ${numberFormat.format(gammaUsageData.folderCount)}개 · ${gammaMonthlyUsd ? `${formatUsd(gammaMonthlyUsd)}/월 구독` : "구독 계획 확인"}`;
  const serviceCards: Array<{
    name: string;
    source: string;
    status: string;
    statusTone: string;
    value: string;
    metric: string;
    detail: string;
    note: string;
    color: string;
    icon: ReactNode;
  }> = [
    {
      name: "Gemini",
      source: "Workspace Audit",
      status: workspaceUsageData.source.status,
      statusTone: apiStatusTone(workspaceUsageData.source.status),
      value: `${numberFormat.format(workspaceUsageData.totalEvents)}건`,
      metric: "Workspace 이벤트",
      detail: mostUsedGeminiApp
        ? `최다 앱 ${mostUsedGeminiApp.app} · ${numberFormat.format(mostUsedGeminiApp.events)}건`
        : "앱별 이벤트 수집 대기",
      note: "단일 관리 계정 기준으로 사용자 수 대신 이벤트와 앱 사용 흐름을 봅니다.",
      color: "#0f8b8d",
      icon: <Sparkles size={18} />,
    },
    {
      name: "Claude Export",
      source: "JSON Export",
      status: chatGptExport ? "수집" : "대기",
      statusTone: chatGptExport ? "ok" : "warning",
      value: `${numberFormat.format(chatGptExport?.totalConversations ?? 0)}개`,
      metric: "대화 기록",
      detail: chatGptExport
        ? `${numberFormat.format(chatGptExport.totalMessages)} messages · ${numberFormat.format(chatGptExport.totalAttachments)} attachments`
        : "Claude export 업로드 필요",
      note: chatGptExport?.patterns[0] ?? "Claude export를 주기적으로 가져오면 업무 주제별 활용 추이가 갱신됩니다.",
      color: "#e85d4f",
      icon: <Bot size={18} />,
    },
    {
      name: "Genspark",
      source: "작업 히스토리",
      status: "수집",
      statusTone: "ok",
      value: `${numberFormat.format(gensparkUsageData.totalTasks)}건`,
      metric: "작업 기록",
      detail: `${numberFormat.format(gensparkUsageData.detailedTasks)}건 정밀 분석 · ${numberFormat.format(gensparkUsageData.generatedFileMappedTasks)}건 파일 매핑`,
      note: gensparkUsageData.patterns[0],
      color: "#c58612",
      icon: <FileSpreadsheet size={18} />,
    },
    {
      name: "Claude",
      source: "Team CSV",
      status: "수집",
      statusTone: "ok",
      value: formatTokens(claudeTeamUsageData.totalTokens),
      metric: "Team tokens",
      detail: hasClaudeCodeLines
        ? `${numberFormat.format(claudeTeamUsageData.totalCodeLines)}줄 · ${formatPreciseUsd(claudeTeamUsageData.totalNetSpendUsd)}`
        : `${numberFormat.format(claudeTeamUsageData.totalRequests)} requests · ${formatPreciseUsd(claudeTeamUsageData.totalNetSpendUsd)}`,
      note: claudeTeamUsageData.insights[2],
      color: "#5f6f8c",
      icon: <LineChart size={18} />,
    },
    {
      name: "Gamma",
      source: "Gamma API",
      status: gammaUsageData.source.status,
      statusTone: apiStatusTone(gammaUsageData.source.status),
      value: gammaUsageData.apiKeyConfigured ? gammaTrackedLabel : "대기",
      metric: gammaUsageData.trackedGenerations > 0 ? "차감 크레딧" : "조회 가능 항목",
      detail: gammaDetail,
      note: gammaUsageData.source.note,
      color: "#2f8f46",
      icon: <Activity size={18} />,
    },
  ];
  const readyServiceCount = serviceCards.filter((service) => service.statusTone === "ok").length;
  const outputRecords = gensparkUsageData.insightAnalysis.outputOrientedRecords;
  const guideNeededCount = gensparkUsageData.insightAnalysis.guideNeededCount;
  const gammaCreditsCollected = typeof gammaUsageData.latestCreditsRemaining === "number";
  const axDimensions = [
    {
      name: "활용 확산",
      score: Math.min(20, 8 + readyServiceCount * 2),
      signal: `${readyServiceCount}/5 서비스 데이터`,
      note: "주요 생성형 AI 서비스를 한 화면에서 추적하는 기반은 갖춰졌습니다.",
      color: "#0f8b8d",
    },
    {
      name: "산출 생산성",
      score: Math.min(20, 10 + Math.round(outputRecords / 120) + Math.min(3, Math.floor(gammaDeckCount / 4))),
      signal: `${numberFormat.format(outputRecords)}건 + Gamma ${numberFormat.format(gammaDeckCount)}개`,
      note: "제안서, 개발, 문서, 대시보드처럼 실무 산출물 중심 사용이 강합니다.",
      color: "#2f8f46",
    },
    {
      name: "프로세스 내재화",
      score: Math.min(
        20,
        8 +
          (workspaceUsageData.totalEvents >= 50 ? 2 : 0) +
          ((hasClaudeCodeLines ? claudeTeamUsageData.totalCodeLines >= 20000 : claudeTeamUsageData.totalTokens >= 1000000000) ? 3 : 0) +
          (gensparkUsageData.generatedFileMappedTasks > 0 ? 2 : 0),
      ),
      signal: "개발·제안 업무 중심",
      note: "일부 핵심 업무에는 들어왔지만, 전 부서 반복 프로세스까지 닫히지는 않았습니다.",
      color: "#c58612",
    },
    {
      name: "데이터·자동화",
      score: Math.min(
        20,
        7 + readyServiceCount + (chatGptExport ? 2 : 0) + (workspaceUsageData.totalEvents > 0 ? 2 : 0) + (gammaCreditsCollected ? 3 : 0),
      ),
      signal: gammaCreditsCollected ? "웹 크레딧 포함" : "크레딧 세션 보완 필요",
      note: "API, CSV, export, 웹 크롤링을 결합했지만 일부는 수동/세션 의존입니다.",
      color: "#5f6f8c",
    },
    {
      name: "거버넌스·개선",
      score: Math.min(
        20,
        9 +
          (guideNeededCount > 0 ? 2 : 0) +
          (claudeTeamUsageData.totalNetSpendUsd > 0 ? 2 : 0) +
          (gammaCreditsCollected ? 2 : 0) +
          (gammaDeckCount > 0 ? 1 : 0),
      ),
      signal: `${numberFormat.format(guideNeededCount)}개 가이드 후보`,
      note: "비용·사용 현황은 보이기 시작했지만 성과 기준과 프롬프트 표준화가 필요합니다.",
      color: "#7d6ca7",
    },
  ];
  const axLevelScore = Math.round((axDimensions.reduce((sum, item) => sum + item.score, 0) / axDimensions.length / 4) * 10) / 10;
  const axLevelLabel =
    axLevelScore < 2.5
      ? "AX 탐색기"
      : axLevelScore < 3.5
        ? "업무 생산성 도입기"
        : axLevelScore < 4.3
          ? "AX 확산·내재화 전환기"
          : "AX 운영 고도화 단계";
  const axStrengths = [
    `5종 서비스 중 ${readyServiceCount}종에서 실제 수집 신호가 확인됩니다.`,
    `Claude export·Genspark 통합 분석 ${numberFormat.format(gensparkUsageData.insightAnalysis.totalRecords)}건 중 산출형 활용이 ${numberFormat.format(outputRecords)}건입니다.`,
    hasClaudeCodeLines
      ? `Claude Team은 ${numberFormat.format(claudeTeamUsageData.totalCodeLines)}줄의 Claude Code 활용과 ${formatTokens(claudeTeamUsageData.totalTokens)} 토큰 사용이 확인됩니다.`
      : `Claude Team은 6월 상반기 spend report에서 ${formatTokens(claudeTeamUsageData.totalTokens)} 토큰과 ${numberFormat.format(claudeTeamUsageData.totalRequests)}건 요청이 확인됩니다.`,
    `Gamma Drive 폴더에서 ${numberFormat.format(gammaDeckCount)}개 발표자료와 약 ${numberFormat.format(gammaTotalSlides)}장 분량의 스마트 안전관리 제안 산출물이 확인됩니다.`,
    "API 비용, Workspace 이벤트, Team CSV, 작업 로그를 한 대시보드에서 함께 보는 운영 체계가 만들어졌습니다.",
  ];
  const axGaps = [
    gammaDeckCount > 0
      ? "Gamma 산출물은 확보됐지만 유사 deck이 많아 최종본 선별과 근거 검증 태그가 필요합니다."
      : gammaCreditsCollected
      ? "Gamma 크레딧은 웹 크롤링으로 보강됐지만 로그인 세션 만료 시 재인증이 필요합니다."
      : "Gamma 잔여 크레딧은 아직 로그인 세션 저장 전이라 일일 자동 수집이 완전히 닫히지 않았습니다.",
    "Claude export와 Genspark는 export/크롤링 기반이라 실시간 사용자별 활용률까지는 약합니다.",
    "AI 사용 기록과 최종 산출물의 제출, 매출, 업무시간 절감 성과가 아직 자동 연결되지 않습니다.",
    "반복 업무별 프롬프트 템플릿과 검증 기준이 표준화되지 않아 재작업 가능성이 남아 있습니다.",
  ];
  const axActions = [
    "제안서, 개발 오류 해결, 회의록, 법령 검토 등 핵심 업무별 표준 프롬프트 템플릿을 만든다.",
    "AI 사용 로그에 업무 목적, 산출물 유형, 실제 제출/배포 여부, 재사용 가능 여부 태그를 붙인다.",
    "Gamma Drive 폴더의 신규 deck을 제목, 주제, 슬라이드 수, 최종본 여부로 분류해 영업 산출물 저장소로 관리한다.",
    "월 1회 AX 리뷰에서 비용, 활용량, 산출물, 보완 과제를 같은 기준으로 보고한다.",
  ];

  return (
    <div className="content-grid adoption-view">
      <section className="panel panel-wide ax-insight-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">AX Diagnosis</span>
            <h2>사내 AX 수준과 실행 인사이트</h2>
          </div>
          <span className="state-pill ok">Level {axLevelScore.toFixed(1)} / 5</span>
        </div>
        <div className="ax-insight-layout">
          <div className="ax-score-card">
            <span>현재 수준</span>
            <strong>{axLevelScore.toFixed(1)} / 5</strong>
            <b>{axLevelLabel}</b>
            <p>현재는 생성형 AI를 실무 산출물 생산에 쓰는 단계에서, 전사 업무 프로세스와 성과 관리로 확장하는 전환 구간입니다.</p>
            <div className="ax-score-track" aria-label={`AX 수준 ${axLevelScore.toFixed(1)}점`}>
              <span style={{ width: `${Math.min((axLevelScore / 5) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="ax-dimension-grid">
            {axDimensions.map((dimension) => (
              <article className="ax-dimension-card" key={dimension.name}>
                <div>
                  <strong>{dimension.name}</strong>
                  <span>{dimension.signal}</span>
                </div>
                <b>{dimension.score}/20</b>
                <div className="ax-dimension-meter">
                  <span style={{ width: `${dimension.score * 5}%`, background: dimension.color }} />
                </div>
                <small>{dimension.note}</small>
              </article>
            ))}
          </div>
        </div>
        <div className="ax-insight-columns">
          <div className="ax-insight-column">
            <h3>잘된 점</h3>
            {axStrengths.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="ax-insight-column">
            <h3>미비점</h3>
            {axGaps.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="ax-insight-column">
            <h3>보완 대책</h3>
            {axActions.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Service Portfolio</span>
            <h2>생성형 AI 서비스별 활용 현황</h2>
          </div>
          <span className="state-pill neutral">5종 관리</span>
        </div>
        <div className="service-usage-grid">
          {serviceCards.map((service) => (
            <article className="service-usage-card" key={service.name} style={{ borderTopColor: service.color }}>
              <div className="service-usage-head">
                <span className="service-usage-icon" style={{ color: service.color }}>
                  {service.icon}
                </span>
                <div>
                  <span>{service.source}</span>
                  <strong>{service.name}</strong>
                </div>
                <span className={`state-pill ${service.statusTone}`}>{service.status}</span>
              </div>
              <div className="service-usage-value">
                <strong>{service.value}</strong>
                <span>{service.metric}</span>
              </div>
              <p>{service.detail}</p>
              <small>{service.note}</small>
            </article>
          ))}
        </div>
        <div className="insight-box">
          <ShieldCheck size={18} />
          <div>
            <strong>활용성 탭은 서비스별 원천 데이터 상태를 함께 보여줍니다.</strong>
            <span>Gemini는 단일 계정 기준이라 활성 사용자 지표를 제거하고 이벤트·앱 사용량 중심으로 바꿨습니다.</span>
            <span>Gamma는 API 테마·폴더와 Generation ID, 웹 크레딧 스냅샷을 기준으로 연결 상태를 추적합니다.</span>
          </div>
        </div>
      </section>

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Gemini Workspace</span>
            <h2>{workspaceUsageData.source.period} 이벤트 추이</h2>
          </div>
          <span className={`state-pill ${apiStatusTone(workspaceUsageData.source.status)}`}>
            {workspaceUsageData.source.status}
          </span>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={workspaceUsageData.dailyUsage} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={54} allowDecimals={false} />
              <Tooltip formatter={(value, name) => [`${numberFormat.format(Number(value))}건`, name]} />
              <Legend />
              <Bar dataKey="events" name="Workspace 이벤트" fill="#0f8b8d" radius={[4, 4, 0, 0]} />
              <Line dataKey="events" name="이벤트 추세" stroke="#e85d4f" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="insight-box">
          <Gauge size={18} />
          <div>
            <strong>
              누적 {numberFormat.format(workspaceUsageData.totalEvents)}건
              {peakGeminiDay ? ` · 피크 ${peakGeminiDay.label} ${numberFormat.format(peakGeminiDay.events)}건` : ""}
            </strong>
            <span>{workspaceUsageData.source.note}</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Apps</span>
            <h2>Gemini 앱별 이벤트</h2>
          </div>
        </div>
        <div className="api-provider-list">
          {workspaceUsageData.appUsage.length > 0 ? (
            workspaceUsageData.appUsage.map((app) => (
              <article className="api-provider-card" key={app.app}>
                <div className="api-provider-head">
                  <span className="category-dot" style={{ background: "#0f8b8d" }} />
                  <strong>{app.app}</strong>
                  <span className="state-pill neutral">{numberFormat.format(app.events)}건</span>
                </div>
                <MeterRow
                  color="#0f8b8d"
                  label="이벤트 비중"
                  value={workspaceUsageData.totalEvents ? (app.events / workspaceUsageData.totalEvents) * 100 : 0}
                  valueLabel={`${numberFormat.format(app.events)}건`}
                />
              </article>
            ))
          ) : (
            <article className="api-provider-card">
              <div className="api-provider-head">
                <span className="category-dot" style={{ background: "#5f6f8c" }} />
                <strong>앱별 데이터 없음</strong>
                <span className="state-pill neutral">대기</span>
              </div>
              <small>Workspace Audit 이벤트가 수집되면 앱 단위 활용도가 채워집니다.</small>
            </article>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Exports</span>
            <h2>Claude Export·Genspark 활용 로그</h2>
          </div>
        </div>
        <div className="api-provider-list">
          <article className="api-provider-card">
            <div className="api-provider-head">
              <span className="category-dot" style={{ background: "#e85d4f" }} />
              <strong>Claude Export</strong>
              <span className="state-pill ok">Export</span>
            </div>
            <div className="api-provider-stats">
              <span>{numberFormat.format(chatGptExport?.totalConversations ?? 0)} 대화</span>
              <span>{numberFormat.format(chatGptExport?.totalMessages ?? 0)} 메시지</span>
              <span>{numberFormat.format(chatGptExport?.conversationsWithFiles ?? 0)} 첨부 대화</span>
            </div>
            <small>{chatGptExport?.patterns[1] ?? "Claude export를 업로드하면 대화·첨부 기반 활용성이 채워집니다."}</small>
          </article>
          <article className="api-provider-card">
            <div className="api-provider-head">
              <span className="category-dot" style={{ background: "#c58612" }} />
              <strong>Genspark</strong>
              <span className="state-pill ok">작업 로그</span>
            </div>
            <div className="api-provider-stats">
              <span>{numberFormat.format(gensparkUsageData.totalTasks)} 작업</span>
              <span>{numberFormat.format(gensparkUsageData.proposalAutomationTasks)} 제안 자동화</span>
              <span>{numberFormat.format(gensparkUsageData.generatedFileMappedTasks)} 파일 매핑</span>
            </div>
            <small>{gensparkUsageData.patterns[1]}</small>
          </article>
          <article className="api-provider-card">
            <div className="api-provider-head">
              <span className="category-dot" style={{ background: "#2f8f46" }} />
              <strong>Gamma</strong>
              <span className={`state-pill ${apiStatusTone(gammaUsageData.source.status)}`}>
                {gammaUsageData.source.status}
              </span>
            </div>
            <div className="api-provider-stats">
              <span>테마 {numberFormat.format(gammaUsageData.themeCount)}개</span>
              <span>폴더 {numberFormat.format(gammaUsageData.folderCount)}개</span>
              <span>
                {typeof gammaUsageData.latestCreditsRemaining === "number"
                  ? `잔여 ${numberFormat.format(gammaUsageData.latestCreditsRemaining)} credits`
                  : gammaUsageData.trackedGenerations > 0
                  ? `${numberFormat.format(gammaUsageData.totalCreditsDeducted)} credits`
                  : "Generation ID 대기"}
              </span>
            </div>
            <div className="gamma-api-detail-list">
              {gammaUsageData.webCreditSnapshot && (
                <span>
                  웹 크롤링: {gammaUsageData.webCreditSnapshot.source.collectedAt.slice(0, 16).replace("T", " ")} ·{" "}
                  {gammaUsageData.webCreditSnapshot.matchedText || "크레딧 텍스트 확인"}
                </span>
              )}
              {gammaUsageData.sampleThemes.length > 0 && (
                <span>테마: {gammaUsageData.sampleThemes.map((theme) => theme.name).join(", ")}</span>
              )}
              {gammaUsageData.sampleFolders.length > 0 && (
                <span>폴더: {gammaUsageData.sampleFolders.map((folder) => folder.name).join(", ")}</span>
              )}
              {gammaUsageData.generations.slice(0, 3).map((generation) => (
                <span key={generation.generationId}>
                  {generation.generationId}: {generation.status} · {numberFormat.format(generation.creditsDeducted)} credits
                  {typeof generation.creditsRemaining === "number"
                    ? ` · 잔여 ${numberFormat.format(generation.creditsRemaining)}`
                    : ""}
                </span>
              ))}
            </div>
            <small>{gammaUsageData.source.note}</small>
          </article>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Claude Team Plan</span>
            <h2>Claude Team 정액제 사용 현황</h2>
          </div>
          <span className="state-pill neutral">{claudeTeamUsageData.source.period}</span>
        </div>
        <div className="api-summary-panel claude-team-summary-panel">
          <article className="api-summary-item">
            <span>활성 사용자</span>
            <strong>{numberFormat.format(claudeTeamUsageData.activeUsers)}명</strong>
            <span>좌석 {numberFormat.format(claudeTeamUsageData.licensedUsers)}명 기준</span>
          </article>
          <article className="api-summary-item">
            <span>Spend report</span>
            <strong>{formatPreciseUsd(claudeTeamUsageData.totalNetSpendUsd)}</strong>
            <span>요청 {numberFormat.format(claudeTeamUsageData.totalRequests)}건</span>
          </article>
          <article className="api-summary-item">
            <span>토큰</span>
            <strong>{formatTokens(claudeTeamUsageData.totalTokens)}</strong>
            <span>Prompt {formatTokens(claudeTeamUsageData.totalPromptTokens)} · Completion {formatTokens(claudeTeamUsageData.totalCompletionTokens)}</span>
          </article>
          <article className="api-summary-item">
            <span>{hasClaudeCodeLines ? "Claude Code Lines" : "Code lines 원천"}</span>
            <strong>{hasClaudeCodeLines ? `${numberFormat.format(claudeTeamUsageData.totalCodeLines)}줄` : "미제공"}</strong>
            <span>
              {hasClaudeCodeLines
                ? `Code export 사용자 ${numberFormat.format(claudeTeamUsageData.codeUsers)}명`
                : "이번 CSV는 spend report 기준"}
            </span>
          </article>
        </div>
        <div className="claude-team-grid">
          <div className="claude-team-column">
            <h3>제품별 사용</h3>
            <div className="forecast-list">
              {claudeTeamUsageData.productUsage.map((product) => (
                <MeterRow
                  color={product.product === "Claude Code" ? "#5f6f8c" : "#0f8b8d"}
                  key={product.product}
                  label={`${product.product} · ${numberFormat.format(product.userCount)}명`}
                  value={claudeTeamUsageData.totalNetSpendUsd ? (product.spendUsd / claudeTeamUsageData.totalNetSpendUsd) * 100 : 0}
                  valueLabel={`${formatPreciseUsd(product.spendUsd)} · ${numberFormat.format(product.requests)}건`}
                />
              ))}
            </div>
          </div>
          <div className="claude-team-column">
            <h3>모델별 비용</h3>
            <div className="forecast-list">
              {claudeTeamUsageData.modelUsage.map((model) => (
                <MeterRow
                  color={model.model.includes("opus") ? "#5f6f8c" : model.model.includes("sonnet") ? "#2f8f46" : "#c58612"}
                  key={model.model}
                  label={`${model.model} · ${numberFormat.format(model.userCount)}명`}
                  value={claudeTeamUsageData.totalNetSpendUsd ? (model.spendUsd / claudeTeamUsageData.totalNetSpendUsd) * 100 : 0}
                  valueLabel={`${formatPreciseUsd(model.spendUsd)} · ${formatTokens(model.tokens)}`}
                />
              ))}
            </div>
          </div>
          <div className="claude-team-column">
            <h3>판단 포인트</h3>
            <div className="insight-box stacked">
              <Bot size={18} />
              <div>
                <strong>정액제는 비용보다 활성 사용자와 산출량을 함께 봐야 함</strong>
                {claudeTeamUsageData.insights.map((insight) => (
                  <span key={insight}>{insight}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="insight-box">
          <ShieldCheck size={18} />
          <div>
            <strong>CSV 원천 결합 기준</strong>
            <span>{claudeTeamUsageData.source.note}</span>
            <span>
              최다 사용자는 {claudeTopUser?.email ?? "-"} · 최다 제품은 {claudeTopProduct?.product ?? "-"} · 최다 모델은{" "}
              {claudeTopModel?.model ?? "-"}입니다.
            </span>
          </div>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Claude Accounts</span>
            <h2>Claude Team 계정별 사용 현황</h2>
          </div>
          <span className="state-pill neutral">
            Spend {numberFormat.format(claudeTeamUsageData.spendUsers)}명 ·{" "}
            {hasClaudeCodeLines ? `Code lines ${numberFormat.format(claudeTeamUsageData.codeUsers)}명` : "Code lines 미제공"}
          </span>
        </div>
        <div className="table-wrap claude-team-table">
          <table>
            <thead>
              <tr>
                <th>계정</th>
                <th>이름</th>
                <th>활용 단계</th>
                <th>Spend</th>
                <th>요청</th>
                <th>토큰</th>
                <th>{hasClaudeCodeLines ? "Code Lines" : "Code Lines 원천"}</th>
                <th>제품/모델</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {claudeTeamUsageData.users.map((user) => (
                <tr key={user.email}>
                  <td>
                    <strong>{user.email}</strong>
                  </td>
                  <td>
                    <strong>{user.displayName}</strong>
                  </td>
                  <td>
                    <span className={`state-pill ${claudeTeamLevelTone(user.level)}`}>
                      {claudeTeamLevelLabel(user.level)}
                    </span>
                  </td>
                  <td>
                    <div className="claude-usage-cell">
                      <strong>{formatPreciseUsd(user.netSpendUsd)}</strong>
                      <div className="department-meter" aria-label={`${user.email} Claude spend 비중`}>
                        <span style={{ width: `${Math.min((user.netSpendUsd / maxClaudeSpend) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>{user.requests ? numberFormat.format(user.requests) : "-"}</td>
                  <td>{user.totalTokens ? formatTokens(user.totalTokens) : "-"}</td>
                  <td>
                    {hasClaudeCodeLines ? (
                      <div className="claude-usage-cell">
                        <strong>{numberFormat.format(user.codeLines)}줄</strong>
                        <div className="department-meter" aria-label={`${user.email} Claude Code lines 비중`}>
                          <span style={{ width: `${Math.min((user.codeLines / maxClaudeLines) * 100, 100)}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="state-pill neutral">미제공</span>
                    )}
                  </td>
                  <td>
                    <strong>{user.products.length > 0 ? user.products.join(", ") : "Claude Code"}</strong>
                    <small>{user.models.length > 0 ? user.models.join(", ") : "lines export only"}</small>
                  </td>
                  <td>{user.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ApiUsageView({ apiUsageData }: { apiUsageData: ApiUsageData }) {
  const totalCost = apiUsageData.providers.reduce((sum, item) => sum + item.costUsd, 0);
  const totalTokens = apiUsageData.providers.reduce((sum, item) => sum + item.inputTokens + item.outputTokens, 0);
  const highestCostProvider = [...apiUsageData.providers].sort((a, b) => b.costUsd - a.costUsd)[0];
  const highestTokenDay = [...apiUsageData.dailyUsage].sort((a, b) => b.totalTokens - a.totalTokens)[0];
  const providerTokens = new Map(
    apiUsageData.providers.map((provider) => [provider.provider, provider.inputTokens + provider.outputTokens]),
  );

  return (
    <div className="content-grid api-view">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">API Usage</span>
            <h2>{apiUsageData.source.period} 토큰 사용량과 비용</h2>
          </div>
          <span className="state-pill neutral">{apiUsageData.source.generatedAt}</span>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={apiUsageData.dailyUsage} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="tokens"
                tickFormatter={formatTokenAxis}
                tickLine={false}
                axisLine={false}
                width={58}
              />
              <YAxis
                yAxisId="cost"
                orientation="right"
                tickFormatter={(value) => formatUsd(Number(value))}
                tickLine={false}
                axisLine={false}
                width={54}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === "비용"
                    ? [formatUsd(Number(value)), name]
                    : [`${formatTokens(Number(value))} 토큰`, name]
                }
              />
              <Legend />
              <Bar yAxisId="tokens" dataKey="openaiTokens" name="OpenAI 토큰" fill="#0f8b8d" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="tokens" dataKey="geminiTokens" name="Gemini 토큰" fill="#c58612" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="tokens" dataKey="claudeTokens" name="Claude 토큰" fill="#5f6f8c" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="cost"
                dataKey="costUsd"
                name="비용"
                stroke="#e85d4f"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Providers</span>
            <h2>공급자별 상태</h2>
          </div>
        </div>
        <div className="api-provider-list">
          {apiUsageData.providers.map((provider) => (
            <article className="api-provider-card" key={provider.provider}>
              <div className="api-provider-head">
                <span className="category-dot" style={{ background: provider.color }} />
                <strong>{provider.label}</strong>
                <span className={`state-pill ${apiStatusTone(provider.status)}`}>{provider.status}</span>
              </div>
              <div className="api-provider-stats">
                <span>{formatTokens(provider.inputTokens + provider.outputTokens)} 토큰</span>
                <span>{formatRequestCount(provider.requests, provider.inputTokens + provider.outputTokens)}</span>
                <span>{formatUsd(provider.costUsd)}</span>
              </div>
              <MeterRow
                color={provider.color}
                label="쿼터 사용률"
                value={provider.quotaUsedRate}
                valueLabel={formatRate(provider.quotaUsedRate)}
              />
              <small>{provider.note}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel panel-wide api-summary-panel">
        <div className="api-summary-item">
          <span>총 토큰</span>
          <strong>{formatTokens(totalTokens)}</strong>
        </div>
        <div className="api-summary-item">
          <span>총 비용</span>
          <strong>{formatUsd(totalCost)}</strong>
        </div>
        <div className="api-summary-item">
          <span>최대 비용 공급자</span>
          <strong>{highestCostProvider.provider}</strong>
        </div>
        <div className="api-summary-item">
          <span>최대 사용일</span>
          <strong>{highestTokenDay.label}</strong>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Models</span>
            <h2>모델별 사용량</h2>
          </div>
          <span className="state-pill neutral">비용 추정</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>공급자</th>
                <th>모델</th>
                <th>요청</th>
                <th>입력 토큰</th>
                <th>출력 토큰</th>
                <th>비용</th>
                <th>응답</th>
                <th>오류율</th>
              </tr>
            </thead>
            <tbody>
              {apiUsageData.models.map((row) => (
                <tr key={`${row.provider}-${row.model}`}>
                  <td>{row.provider}</td>
                  <td>
                    <strong>{row.model}</strong>
                  </td>
                  <td>{formatRequestCount(row.requests, row.inputTokens + row.outputTokens)}</td>
                  <td>{formatTokens(row.inputTokens)}</td>
                  <td>{formatTokens(row.outputTokens)}</td>
                  <td>{formatUsd(row.costUsd)}</td>
                  <td>{formatLatency(row.avgLatencyMs)}</td>
                  <td>{formatRate(row.errorRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Keys</span>
            <h2>API 키 상태</h2>
          </div>
          <span className="state-pill neutral">브라우저 미저장</span>
        </div>
        <div className="key-health-grid">
          {apiUsageData.keyHealth.map((key) => (
            <article className="key-health-card" key={`${key.provider}-${key.name}`}>
              <div>
                <strong>{key.name}</strong>
                <span>
                  {key.provider} · {key.scope}
                </span>
              </div>
              <div>
                <span>{formatKeyRequestCount(key.requests, providerTokens.get(key.provider) ?? 0)}</span>
                <span>마지막 사용 {key.lastUsed}</span>
              </div>
              <span className={`state-pill ${keyStatusTone(key.status)}`}>{key.status}</span>
              <small>{key.note}</small>
            </article>
          ))}
        </div>
        <div className="insight-box">
          <ShieldCheck size={18} />
          <div>
            <strong>키는 클라이언트 번들에 포함하지 않음</strong>
            <span>실제 수집 단계에서는 서버 또는 로컬 스크립트의 환경변수에서만 읽도록 분리합니다.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function workspaceLevelLabel(level: GeminiWorkspaceUserUsageLevel) {
  if (level === "High") return "높은 활용";
  if (level === "Medium") return "중간 활용";
  if (level === "Low") return "낮은 활용";
  return "미활용";
}

function workspaceLevelTone(level: GeminiWorkspaceUserUsageLevel) {
  if (level === "High" || level === "Medium") return "ok";
  if (level === "Low") return "warning";
  return "neutral";
}

function claudeTeamLevelLabel(level: ClaudeTeamUsageLevel) {
  if (level === "High") return "높은 활용";
  if (level === "Medium") return "중간 활용";
  return "낮은 활용";
}

function claudeTeamLevelTone(level: ClaudeTeamUsageLevel) {
  if (level === "High") return "ok";
  if (level === "Medium") return "warning";
  return "neutral";
}

function MetricCard({
  footer,
  icon,
  label,
  tone,
  value,
}: {
  footer: string;
  icon: ReactNode;
  label: string;
  tone: MetricTone;
  value: string;
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{footer}</small>
      </div>
    </article>
  );
}

function MeterRow({
  color,
  label,
  value,
  valueLabel,
}: {
  color: string;
  label: string;
  value: number;
  valueLabel: string;
}) {
  return (
    <div className="gauge-row">
      <div>
        <span>{label}</span>
        <strong>{valueLabel}</strong>
      </div>
      <div className="gauge-track">
        <span style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
    </div>
  );
}

function GaugeRow({
  label,
  max,
  tone,
  value,
}: {
  label: string;
  max: number;
  tone: "teal" | "steel";
  value: number;
}) {
  const rate = Math.min((value / max) * 100, 100);
  return (
    <div className="gauge-row">
      <div>
        <span>{label}</span>
        <strong>{formatManWon(value)}</strong>
      </div>
      <div className={`gauge-track ${tone}`}>
        <span style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
}

export default App;
