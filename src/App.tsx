import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Columns3,
  Cpu,
  Database,
  Download,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LineChart,
  ListOrdered,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
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
  selectPreferredApiUsageData,
  type ApiKeyStatusValue,
  type ApiProviderStatus,
  type ApiUsageData,
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
import { chatGptUsageData } from "./data/chatGptUsageData";
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
  individualUtilizationData,
  type IndividualEvaluationLevel,
  type IndividualUtilizationUser,
} from "./data/individualUtilizationData";
import { executiveWorkforceInsightData } from "./data/executiveWorkforceInsightData";
import {
  individualProfileDataByEmail,
  type IndividualProfileData,
} from "./data/individualProfileData";
import {
  approvalMonthlyTotalsForMonth,
  buildApprovalPersonCostSummary,
  initialAiToolApprovalData,
  type AiToolApprovalData,
  type AiToolApprovalRecord,
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
import {
  buildProductivityExecutiveModel,
  type ProductivityExecutiveModel,
  type ProductivitySourceFreshness,
} from "./lib/productivityCohort";
import {
  buildClaudeProductivitySignals,
  type ClaudeProductivityLevel,
} from "./lib/claudeProductivity";
import { buildDriveArtifactDailyTrend } from "./lib/driveArtifactTrend";
import { buildIntegratedConversationAnalysis } from "./lib/integratedConversationAnalysis";
import {
  isDriveArtifactTrendSnapshot,
  selectPreferredDriveArtifactTrendSnapshot,
  type DriveArtifactTrendSnapshot,
} from "./lib/driveArtifactTrendSnapshot";
import {
  isGensparkDriveSnapshot,
  selectPreferredGensparkDriveSnapshot,
  type GensparkDriveSnapshot,
} from "./lib/gensparkDriveSnapshot";

type ViewKey = "overview" | "monthly" | "adoption" | "approval";
type LayoutMode = "command" | "editorial" | "signal";
type ViewHeaderMetric = {
  label: string;
  value: string;
  detail: string;
  tone: MetricTone;
  icon: ReactNode;
};

type ViewHeaderModel = {
  eyebrow: string;
  title: string;
  description: string;
  freshness: string;
  metrics: ViewHeaderMetric[];
};

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
const DASHBOARD_LAYOUT_KEY = "ai-control-hub-layout";
const API_FORECAST_MONTH_DAYS = 30.4;
const API_FORECAST_USD_TO_KRW = 1400;
const OPERATING_PLAN_START_MONTH = "2026-05";
const OPERATING_PLAN_USD_TO_KRW = 1485;
const OPERATING_PLAN_API_BUDGET_KRW = 280000;
const DRIVE_TREND_POLL_INTERVAL_MS = 15 * 60 * 1000;
const GENSPARK_DRIVE_POLL_INTERVAL_MS = 15 * 60 * 1000;

const numberFormat = new Intl.NumberFormat("ko-KR");

function loadInitialDashboardState() {
  const storedData = loadStoredDashboardData();
  return {
    data: storedData ?? initialDashboardData,
    isStoredData: Boolean(storedData),
  };
}

function loadInitialLayoutMode(): LayoutMode {
  if (typeof window === "undefined") return "signal";
  const stored = window.localStorage.getItem(DASHBOARD_LAYOUT_KEY);
  return stored === "command" || stored === "editorial" || stored === "signal"
    ? stored
    : "signal";
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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ko-KR", {
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
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }

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

function currentKstMonthKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  return `${year}-${month}`;
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
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(loadInitialLayoutMode);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialState.data);
  const [isStoredData, setIsStoredData] = useState(initialState.isStoredData);
  const [apiUsageData, setApiUsageData] = useState<ApiUsageData>(initialApiUsageData);
  const [individualSelectedMonth, setIndividualSelectedMonth] = useState(
    individualUtilizationData.months[individualUtilizationData.months.length - 1] ?? "",
  );
  const [driveArtifactTrendSnapshot, setDriveArtifactTrendSnapshot] =
    useState<DriveArtifactTrendSnapshot | null>(null);
  const [gensparkDriveSnapshot, setGensparkDriveSnapshot] =
    useState<GensparkDriveSnapshot | null>(null);

  useEffect(() => {
    let isMounted = true;
    const snapshotUrls = [`${import.meta.env.BASE_URL}api-usage-snapshot.local.json`, "/api/api-usage"];

    async function loadApiUsageData() {
      let preferredSnapshot = initialApiUsageData;

      for (const url of snapshotUrls) {
        try {
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) continue;
          const data: unknown = await response.json();
          if (isApiUsageData(data)) {
            preferredSnapshot = selectPreferredApiUsageData(preferredSnapshot, data);
            if (isMounted) setApiUsageData(preferredSnapshot);
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

  useEffect(() => {
    let isMounted = true;
    const snapshotUrls = [
      `${import.meta.env.BASE_URL}genspark-drive-artifacts-snapshot.json`,
      `${import.meta.env.BASE_URL}genspark-drive-artifacts-snapshot.local.json`,
      "/api/genspark-drive-artifacts",
    ];

    async function loadGensparkDriveSnapshot() {
      for (const url of snapshotUrls) {
        try {
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) continue;
          const data: unknown = await response.json();
          if (!isGensparkDriveSnapshot(data) || !isMounted) continue;
          setGensparkDriveSnapshot((current) =>
            selectPreferredGensparkDriveSnapshot(current, data),
          );
        } catch {
          // Static deployments can omit the runtime API; retain the last verified snapshot.
        }
      }
    }

    void loadGensparkDriveSnapshot();
    const pollId = window.setInterval(
      () => void loadGensparkDriveSnapshot(),
      GENSPARK_DRIVE_POLL_INTERVAL_MS,
    );

    return () => {
      isMounted = false;
      window.clearInterval(pollId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const snapshotUrls = [
      `${import.meta.env.BASE_URL}drive-artifact-trend-snapshot.json`,
      `${import.meta.env.BASE_URL}drive-artifact-trend-snapshot.local.json`,
      "/api/drive-artifact-trend",
    ];

    async function loadDriveArtifactTrendSnapshot() {
      for (const url of snapshotUrls) {
        try {
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) continue;
          const data: unknown = await response.json();
          if (!isDriveArtifactTrendSnapshot(data) || !isMounted) continue;
          setDriveArtifactTrendSnapshot((current) =>
            selectPreferredDriveArtifactTrendSnapshot(current, data),
          );
        } catch {
          // Static deployments can omit the runtime API; retain the last verified graph.
        }
      }
    }

    void loadDriveArtifactTrendSnapshot();
    const pollId = window.setInterval(
      () => void loadDriveArtifactTrendSnapshot(),
      DRIVE_TREND_POLL_INTERVAL_MS,
    );

    return () => {
      isMounted = false;
      window.clearInterval(pollId);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DASHBOARD_LAYOUT_KEY, layoutMode);
  }, [layoutMode]);

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
  const claudeTeamUsageData = initialClaudeTeamUsageData;
  const aiToolApprovalData = initialAiToolApprovalData;
  const gensparkUsageData = useMemo<GensparkUsageData>(
    () => ({
      ...initialGensparkUsageData,
      driveAnalysis:
        gensparkDriveSnapshot ?? initialGensparkUsageData.driveAnalysis,
    }),
    [gensparkDriveSnapshot],
  );
  const productivityModel = useMemo(
    () =>
      buildProductivityExecutiveModel({
        monthlyActuals,
        approvalData: aiToolApprovalData,
        chatGptData: chatGptUsageData,
        claudeTeamData: claudeTeamUsageData,
        driveData: driveArtifactRepositoryData,
        driveTrendData: driveArtifactTrendSnapshot,
        gensparkData: gensparkUsageData,
      }),
    [driveArtifactTrendSnapshot, gensparkUsageData, monthlyActuals],
  );
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
  const currentBillingMonth = currentKstMonthKey();
  const currentApprovalTotals = approvalMonthlyTotalsForMonth(aiToolApprovalData, currentBillingMonth);
  const operatingPlanSubscriptionUsd = currentApprovalTotals.monthlyUsd;
  const operatingPlanSubscriptionKrw = Math.round(currentApprovalTotals.monthlyKrw);
  const fixedApiServiceRecords = currentApprovalTotals.records.filter((record) => record.category === "AI API");
  const fixedApiServiceMonthlyKrw = Math.round(
    fixedApiServiceRecords.reduce((sum, record) => sum + record.monthlyKrw, 0),
  );
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
        const monthApprovalTotals = approvalMonthlyTotalsForMonth(aiToolApprovalData, item.month);
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
          monthApprovalTotals.monthlyUsd,
          monthApprovalTotals.monthlyKrw,
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
      fixedPlan: approvalMonthlyTotalsForMonth(aiToolApprovalData, item.month).monthlyKrw,
      transactions: item.transactions,
      apiSourceLabel: null,
      status: "실적",
    })),
    ...forecast.map((item) => {
      const monthApprovalTotals = approvalMonthlyTotalsForMonth(aiToolApprovalData, item.month);
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
        monthApprovalTotals.monthlyUsd,
        monthApprovalTotals.monthlyKrw,
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
        fixedPlan: operatingPlan.applies ? operatingPlan.forecastBaseKrw : monthApprovalTotals.monthlyKrw,
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
      gensparkUsageData,
      aiToolApprovalData,
      apiForecast,
      apiAdjustedForecast,
      operatingPlan: {
        startMonth: OPERATING_PLAN_START_MONTH,
        currentBillingMonth,
        subscriptions: aiToolApprovalData.toolSummary,
        subscriptionUsd: operatingPlanSubscriptionUsd,
        subscriptionKrw: operatingPlanSubscriptionKrw,
        monthlyFixedCosts: Object.fromEntries(
          forecast.map((item) => [
            item.month,
            approvalMonthlyTotalsForMonth(aiToolApprovalData, item.month).monthlyKrw,
          ]),
        ),
        apiBudgetKrw: OPERATING_PLAN_API_BUDGET_KRW,
        apiForecastKrw: operatingPlanApiKrw,
        apiForecastSource: operatingPlanApiSourceLabel,
        usdToKrwRate: OPERATING_PLAN_USD_TO_KRW,
        forecastTotalKrw: operatingPlanForecastTotal,
      },
      generatedAt: new Date().toISOString(),
      forecastMethod: `${fixedCostForecastMethodLabel(operatingPlanSubscriptionKrw)} - AI 도구 결재 현황의 적용 시작월별 고정 비용을 예측 기준으로 두고 실측 API 월환산 비용을 추가. GH AI Agent 개발용 AI API 고정비 150만원은 2026-08부터 반영`,
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

  let viewHeader: ViewHeaderModel | null = null;
  if (activeView === "adoption") {
    viewHeader = {
      eyebrow: "Individual Utilization",
      title: "개인별 활용성",
      description: "개인별 요청·토큰·대화 프롬프트·Code Lines를 월별로 비교하며 Claude Code 상세 미수집을 구분합니다.",
      freshness: `${individualUtilizationData.source.spend.period} · ${formatKstDateTime(individualUtilizationData.source.generatedAt)}`,
      metrics: [
        {
          icon: <UserCheck size={19} />,
          label: "활동 사용자",
          value: `${individualUtilizationData.totals.users}명`,
          detail: "현재까지 관측된 계정",
          tone: "teal",
        },
        {
          icon: <Bot size={19} />,
          label: "누적 요청",
          value: `${numberFormat.format(individualUtilizationData.totals.requests)}건`,
          detail: individualUtilizationData.source.spend.period,
          tone: "steel",
        },
        {
          icon: <Sparkles size={19} />,
          label: "Code Lines",
          value: `${numberFormat.format(individualUtilizationData.totals.codeLines)}줄`,
          detail: `${individualUtilizationData.months.length}개월 합계`,
          tone: "green",
        },
        {
          icon: <Activity size={19} />,
          label: "누적 토큰",
          value: formatTokens(individualUtilizationData.totals.totalTokens),
          detail: `입력 ${formatTokens(individualUtilizationData.totals.promptTokens)} · 완료 ${formatTokens(individualUtilizationData.totals.completionTokens)}`,
          tone: "amber",
        },
      ],
    };
  } else if (activeView === "approval") {
    const leadingCategory = aiToolApprovalData.categorySummary[0];
    viewHeader = {
      eyebrow: "Subscription Control",
      title: "AI 도구 결재 현황",
      description: "계정·결재수단·서비스·부서별 월 고정비를 한 번에 확인하고 비용 집중 구간을 관리합니다.",
      freshness: aiToolApprovalData.source.period,
      metrics: [
        {
          icon: <CircleDollarSign size={19} />,
          label: "월 구독료",
          value: formatManWon(aiToolApprovalData.totalMonthlyKrw),
          detail: `${formatPreciseUsd(aiToolApprovalData.totalMonthlyUsd)} USD 항목 + 원화 고정비`,
          tone: "green",
        },
        {
          icon: <WalletCards size={19} />,
          label: "결재 항목",
          value: `${numberFormat.format(aiToolApprovalData.totalAccounts)}개`,
          detail: "월 구독 기준",
          tone: "teal",
        },
        {
          icon: <ShieldCheck size={19} />,
          label: "AI 전용 카드",
          value: `${numberFormat.format(aiToolApprovalData.aiDedicatedCardAccounts)}개`,
          detail: formatWon(aiToolApprovalData.aiDedicatedCardKrw),
          tone: "amber",
        },
        {
          icon: <Gauge size={19} />,
          label: "최대 비용 계열",
          value: leadingCategory?.key ?? "-",
          detail: leadingCategory ? `${formatWon(leadingCategory.monthlyKrw)} · ${formatRate(leadingCategory.share)}` : "-",
          tone: "steel",
        },
      ],
    };
  } else if (activeView === "monthly") {
    viewHeader = {
      eyebrow: "Cost & Forecast",
      title: "월별 비용과 예측",
      description: "확정 실적, 월별 적용 고정비, 실측 API를 분리해 월별 비용 흐름과 다음 분기 최소 지출을 보여줍니다.",
      freshness: `${actualRange} 확정 · ${forecastRange} 예측`,
      metrics: [
        {
          icon: <CircleDollarSign size={19} />,
          label: `${lastActual.label} 확정 비용`,
          value: formatManWon(lastActual.amount),
          detail: `전월 대비 ${formatRate(lastMoM, true)}`,
          tone: "coral",
        },
        {
          icon: <FileSpreadsheet size={19} />,
          label: `${actualRange} 누적`,
          value: formatManWon(sourceMeta.totalActual),
          detail: `${numberFormat.format(sourceMeta.recordCount)}건`,
          tone: "teal",
        },
        {
          icon: <CalendarRange size={19} />,
          label: `${forecastRange} 예측`,
          value: formatManWon(apiAdjustedForecastTotal),
          detail: "고정비 + API",
          tone: "amber",
        },
        {
          icon: <WalletCards size={19} />,
          label: "현재 월 고정비",
          value: formatManWon(operatingPlanSubscriptionKrw),
          detail: `${monthLabel(currentBillingMonth)} · GH AI Agent API 포함`,
          tone: "steel",
        },
      ],
    };
  }

  return (
    <main className={`app-shell layout-${layoutMode}`}>
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <Gauge size={24} />
          </div>
          <div>
            <h1>AI CONTROL HUB</h1>
            <p>전사 AI 비용 · 활용 · 산출 운영 대시보드</p>
          </div>
        </div>
        <div className="topbar-tools">
          <div className="layout-switcher" role="radiogroup" aria-label="대시보드 레이아웃">
            <button
              aria-checked={layoutMode === "command"}
              className={layoutMode === "command" ? "is-selected" : ""}
              role="radio"
              title="옵션 1 · 경영 지휘센터"
              type="button"
              onClick={() => setLayoutMode("command")}
            >
              <LayoutDashboard size={16} />
              <span>1 지휘센터</span>
            </button>
            <button
              aria-checked={layoutMode === "editorial"}
              className={layoutMode === "editorial" ? "is-selected" : ""}
              role="radio"
              title="옵션 2 · 투자에서 성과까지 흐름 보드"
              type="button"
              onClick={() => setLayoutMode("editorial")}
            >
              <Columns3 size={16} />
              <span>2 흐름보드</span>
            </button>
            <button
              aria-checked={layoutMode === "signal"}
              className={layoutMode === "signal" ? "is-selected" : ""}
              role="radio"
              title="옵션 3 · 운영 신호 매트릭스"
              type="button"
              onClick={() => setLayoutMode("signal")}
            >
              <Table2 size={16} />
              <span>3 신호매트릭스</span>
            </button>
          </div>
          <div className="top-actions">
            <div className="source-chip" title={sourceMeta.fileName}>
              <FileSpreadsheet size={17} />
              {isStoredData ? "업로드 데이터" : "기본 데이터"}
            </div>
            <label className="upload-button" title="AI 비용 엑셀 업로드">
              <Upload size={17} />
              <span>{isUploading ? "읽는 중" : "업로드"}</span>
              <input
                accept=".xlsx"
                type="file"
                onChange={(event) => {
                  void handleUpload(event.currentTarget.files?.[0] ?? null);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <button className="command-button" title="현재 스냅샷 내보내기" type="button" onClick={exportSnapshot}>
              <Download size={17} />
              <span>스냅샷</span>
            </button>
            <button
              className="command-button icon-command"
              disabled={!isStoredData}
              title={isStoredData ? "기본 데이터로 되돌리기" : "저장된 업로드 데이터가 없습니다."}
              type="button"
              onClick={resetDashboard}
            >
              <RotateCcw size={17} />
              <span className="sr-only">초기화</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="view-tabs" aria-label="대시보드 보기">
        <button
          className={activeView === "overview" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("overview")}
        >
          <Activity size={17} />
          경영 인사이트
        </button>
        <button
          className={activeView === "adoption" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("adoption")}
        >
          <UserCheck size={17} />
          개인별 활용성
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
      </nav>

      {viewHeader && <DashboardViewHeader model={viewHeader} />}

      {activeView === "overview" ? (
        <section className="metric-grid" aria-label="비용과 생산성 핵심 지표">
          <MetricCard
            icon={<UserCheck size={21} />}
            label={`${productivityModel.currentMonthLabel} Claude 활성`}
            tone="teal"
            value={`${productivityModel.activeUsers}/${productivityModel.licensedUsers}명`}
            footer={`활성률 ${formatRate(productivityModel.activationRate)} · 멤버 CSV ${initialClaudeTeamUsageData.source.generatedAt}`}
          />
          <MetricCard
            icon={<UserCheck size={21} />}
            label="Claude Team Plan 보급"
            tone="green"
            value={`${executiveWorkforceInsightData.teamPlanUsers}/${executiveWorkforceInsightData.eligibleEmployees}명`}
            footer={`${formatRate(executiveWorkforceInsightData.teamPlanCoverageRate)} · Standard ${executiveWorkforceInsightData.teamPlanStandardUsers} / Premium ${executiveWorkforceInsightData.teamPlanPremiumUsers}`}
          />
          <MetricCard
            icon={<CircleDollarSign size={21} />}
            label={`${productivityModel.currentMonthLabel} 최소 비용`}
            tone="amber"
            value={formatManWon(productivityModel.currentFixedCostKrw)}
            footer="현재 고정 구독비 · API/변동비 미포함"
          />
          <MetricCard
            icon={<ShieldCheck size={21} />}
            label={`${productivityModel.lastClosedMonthLabel} 최근 확정 비용`}
            tone="steel"
            value={formatManWon(productivityModel.lastClosedCostKrw)}
            footer={`사용 데이터 대비 ${productivityModel.lagMonths}개월 후행`}
          />
        </section>
      ) : activeView === "approval" ? (
        <section className="metric-grid" aria-label="AI 도구 결재 핵심 지표">
          <MetricCard
            icon={<WalletCards size={21} />}
            label="결재 항목"
            tone="teal"
            value={`${numberFormat.format(aiToolApprovalData.totalAccounts)}개`}
            footer={aiToolApprovalData.source.period}
          />
          <MetricCard
            icon={<CircleDollarSign size={21} />}
            label="월 구독료"
            tone="green"
            value={formatManWon(aiToolApprovalData.totalMonthlyKrw)}
            footer={`${formatPreciseUsd(aiToolApprovalData.totalMonthlyUsd)} USD 항목 · 원화 고정비 ${formatWon(fixedApiServiceMonthlyKrw)}`}
          />
          <MetricCard
            icon={<ShieldCheck size={21} />}
            label="AI 전용 카드"
            tone="amber"
            value={`${numberFormat.format(aiToolApprovalData.aiDedicatedCardAccounts)}개`}
            footer={formatWon(aiToolApprovalData.aiDedicatedCardKrw)}
          />
          <MetricCard
            icon={<Bot size={21} />}
            label="API 계약 고정비"
            tone="steel"
            value={formatManWon(fixedApiServiceMonthlyKrw)}
            footer="플랫폼개발팀 · 2026년 8월부터"
          />
        </section>
      ) : activeView === "adoption" ? null : (
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
            footer={`${monthLabel(currentBillingMonth)} 고정비 ${formatManWon(operatingPlanSubscriptionKrw)}/월 · GH AI Agent API 150만원 포함`}
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
          currentBillingMonth={currentBillingMonth}
          fixedApiServiceMonthlyKrw={fixedApiServiceMonthlyKrw}
          forecastAdjustments={forecastAdjustments}
          forecastBasisActuals={forecastBasisActuals}
          sourceMeta={sourceMeta}
          monthlyActuals={monthlyActuals}
        />
      )}

      {activeView === "overview" && (
        <ExecutiveDesignOverview layoutMode={layoutMode} model={productivityModel} />
      )}

      {activeView === "adoption" && (
        <AdoptionView
          selectedMonth={individualSelectedMonth}
          onSelectedMonthChange={setIndividualSelectedMonth}
        />
      )}

      {activeView === "approval" && <AiToolApprovalView approvalData={aiToolApprovalData} />}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function DashboardViewHeader({ model }: { model: ViewHeaderModel }) {
  return (
    <section className="view-summary" aria-labelledby="view-summary-title">
      <div className="view-summary-copy">
        <div>
          <span className="eyebrow">{model.eyebrow}</span>
          <h2 id="view-summary-title">{model.title}</h2>
          <p>{model.description}</p>
        </div>
        <span className="view-freshness">
          <Database size={15} />
          {model.freshness}
        </span>
      </div>
      <div className="view-summary-metrics">
        {model.metrics.map((metric) => (
          <article className={`view-summary-metric ${metric.tone}`} key={metric.label}>
            <span className="view-summary-icon">{metric.icon}</span>
            <div>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ExecutiveDesignOverview({
  layoutMode,
  model,
}: {
  layoutMode: LayoutMode;
  model: ProductivityExecutiveModel;
}) {
  const [range, setRange] = useState<"3m" | "6m" | "all">("6m");
  const trendSeries = useMemo(
    () =>
      model.costUsageSeries.map((item) => ({
        ...item,
        conversations: item.claudeConversations,
      })),
    [model.costUsageSeries],
  );
  const visibleSeries =
    range === "all" ? trendSeries : trendSeries.slice(range === "3m" ? -3 : -6);
  const workforce = executiveWorkforceInsightData;

  const chart = (
    <div className="decision-chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={visibleSeries} margin={{ top: 16, right: 10, left: 0, bottom: 2 }}>
          <CartesianGrid stroke="#dce3e7" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="cost"
            tickFormatter={formatAxisWon}
            tickLine={false}
            axisLine={false}
            width={58}
          />
          <YAxis
            yAxisId="signal"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value, name) => {
              const label = String(name);
              const formattedValue = label.startsWith("AI 비용")
                ? formatWon(Number(value))
                : `${numberFormat.format(Number(value))}건`;
              return [formattedValue, name];
            }}
          />
          <Legend />
          <Bar
            dataKey="costKrw"
            name="AI 비용(확정/최소)"
            yAxisId="cost"
            fill="#2563eb"
            maxBarSize={40}
            radius={[4, 4, 0, 0]}
          />
          <Line
            dataKey="conversations"
            name="Claude 통합 대화"
            yAxisId="signal"
            type="monotone"
            stroke="#ef5a47"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#ef5a47" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const rangeControl = (
    <div className="range-switch" aria-label="차트 기간" role="group">
      <button className={range === "3m" ? "is-active" : ""} type="button" onClick={() => setRange("3m")}>
        3개월
      </button>
      <button className={range === "6m" ? "is-active" : ""} type="button" onClick={() => setRange("6m")}>
        6개월
      </button>
      <button className={range === "all" ? "is-active" : ""} type="button" onClick={() => setRange("all")}>
        누적
      </button>
    </div>
  );

  const stageSignals = [
    {
      step: "1",
      label: "보급",
      value: formatRate(workforce.teamPlanCoverageRate),
      detail: `${workforce.teamPlanUsers}/${workforce.eligibleEmployees}명 Team Plan`,
      direction: "현황",
      tone: "teal",
    },
    {
      step: "2",
      label: "측정",
      value: `${workforce.tokenMeasuredUsers}/${workforce.tokenMeasurementTarget}명`,
      detail: `원천 연결 대기 ${workforce.tokenPendingUsers.length}명`,
      direction: "3명 대기",
      tone: "blue",
    },
    {
      step: "3",
      label: "평가",
      value: "2트랙",
      detail: "개발자 코드 · 비개발자 결과물",
      direction: "운영 기준",
      tone: "green",
    },
  ];

  if (layoutMode === "command") {
    return (
      <section className="design-overview command-overview" aria-label="경영 지휘센터">
        <div className="overview-title-row">
          <div>
            <span className="eyebrow">Executive Command Center</span>
            <h2>Team Plan 보급, 토큰 측정, 직군별 활용 기준을 한 화면에서 판단</h2>
          </div>
        </div>
        <ExecutiveWorkforceDecisionBoard model={model} />
      </section>
    );
  }

  if (layoutMode === "editorial") {
    return (
      <section className="design-overview editorial-overview" aria-label="투자에서 성과까지 흐름 보드">
        <div className="overview-title-row editorial-title-row">
          <div>
            <span className="eyebrow">Investment to Outcome</span>
            <h2>현재 비용에서 전사 Team Plan 전환까지, 투자 흐름으로 읽는 운영 보드</h2>
          </div>
          {rangeControl}
        </div>
        <ExecutiveWorkforceDecisionBoard model={model} />
        <div className="editorial-flow" aria-label="AI 투자 흐름">
          {[
            ["비용", formatManWon(model.currentFixedCostKrw), "현재 월 최소"],
            ["Team Plan", formatRate(workforce.teamPlanCoverageRate), `${workforce.teamPlanUsers}/${workforce.eligibleEmployees}명`],
            ["토큰 측정", `${workforce.tokenMeasuredUsers}/${workforce.tokenMeasurementTarget}명`, `${workforce.tokenPendingUsers.length}명 연결 대기`],
            ["순수 신규", `${workforce.pureAdditionalSeats}석`, `전환 ${workforce.conversionSeats} + 신규 ${workforce.pureAdditionalSeats}`],
          ].map(([label, value, detail], index) => (
            <div className={`flow-step flow-step-${index + 1}`} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
              {index < 3 && <ArrowRight size={20} aria-hidden="true" />}
            </div>
          ))}
        </div>
        <div className="editorial-chart-area">
          <div className="section-heading">
            <div>
              <strong>월별 비용·대화 활동 추이</strong>
              <span>비용은 확정·고정비 최소값, 대화는 통합 수집 기준</span>
            </div>
          </div>
          {chart}
        </div>
        <div className="editorial-bottom">
          <section className="management-notes">
            <div className="section-heading">
              <div>
                <strong>경영 판단 메모</strong>
                <span>측정값과 잠정 신호를 분리해 해석합니다.</span>
              </div>
            </div>
            <ol>
              <li>
                <span>01</span>
                <p>Team Plan 보급률은 {formatRate(workforce.teamPlanCoverageRate)}로, {workforce.eligibleEmployees}명 중 {workforce.teamPlanUsers}명이 사용 중입니다.</p>
              </li>
              <li>
                <span>02</span>
                <p>개인 계정 {workforce.personalConversionAccounts.length}건과 공용 계정 {workforce.sharedConversionAccounts.length}건을 Team Plan으로 전환하면 순수 신규 수량은 {workforce.pureAdditionalSeats}석입니다.</p>
              </li>
              <li>
                <span>03</span>
                <p>토큰 미연결 {workforce.tokenPendingUsers.length}명을 추가한 뒤 개발자는 토큰·Code Lines, 비개발자는 토큰·생성 결과물로 구분 평가합니다.</p>
              </li>
            </ol>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section className="design-overview signal-overview" aria-label="운영 신호 매트릭스">
      <div className="overview-title-row">
        <div>
          <span className="eyebrow">Signal Matrix</span>
          <h2>비용 대비 Team Plan 보급·측정·평가 신호</h2>
        </div>
        {rangeControl}
      </div>
      <ExecutiveWorkforceDecisionBoard model={model} />
      <div className="signal-main-grid">
        <section className="signal-chart-area">
          <div className="section-heading">
            <div>
              <strong>비용·대화 활동 신호</strong>
              <span>월별 비용과 통합 대화량을 동일한 축에서 비교합니다.</span>
            </div>
          </div>
          {chart}
        </section>
        <section className="signal-summary">
          <div className="section-heading">
            <div>
              <strong>신호 요약</strong>
              <span>AX 1~3단계 자동 집계</span>
            </div>
          </div>
          <div className="signal-stage-list">
            {stageSignals.map((stage) => (
              <div className="signal-stage-row" key={stage.step}>
                <span className={`signal-step ${stage.tone}`}>{stage.step}</span>
                <div>
                  <b>AX {stage.step}단계 · {stage.label}</b>
                  <small>{stage.detail}</small>
                </div>
                <strong>{stage.value}</strong>
                <span className={`direction-badge ${stage.direction === "감소" ? "down" : ""}`}>
                  {stage.direction}
                </span>
              </div>
            ))}
          </div>
          <div className="attention-list">
            <strong>
              <AlertTriangle size={16} /> 주의 필요
            </strong>
            <p>당월 비용은 고정 구독비 최소값이며 API·변동비는 확정 대기입니다.</p>
            <p>대화 분류는 {model.classifiedActivityMonthLabel}까지이며, 개인별 토큰 측정 원천은 3명 연결 대기입니다.</p>
          </div>
        </section>
      </div>
      <div className="signal-bottom-grid">
        <section className="source-matrix">
          <div className="section-heading">
            <div>
              <strong>소스 및 커버리지</strong>
              <span>최신 수집 상태와 해석 범위</span>
            </div>
          </div>
          <div className="source-matrix-table" role="table" aria-label="데이터 소스 커버리지">
            {model.sourceFreshness.slice(0, 4).map((source) => (
              <div className="source-matrix-row" role="row" key={source.source}>
                <strong role="cell">{source.source}</strong>
                <span role="cell">
                  <CheckCircle2 size={15} /> {source.status}
                </span>
                <span role="cell">{source.asOf}</span>
                <small role="cell">{source.coverage}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="manager-actions">
          <div className="section-heading">
            <div>
              <strong>관리자 액션</strong>
              <span>이번 주 우선 확인 항목</span>
            </div>
          </div>
          <ol>
            <li>
              <span>1</span>
              <div>
                <b>Team Plan 전환안 결정</b>
                <small>개인 2건 · 공용 2건 · 순수 신규 {workforce.pureAdditionalSeats}석</small>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <b>토큰 측정 원천 연결</b>
                <small>{workforce.tokenPendingUsers.map((user) => user.name).join(" · ")}</small>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <b>직군별 평가 기준 적용</b>
                <small>개발자 Code Lines · 비개발자 생성 결과물</small>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </section>
  );
}

function ExecutiveWorkforceDecisionBoard({ model }: { model: ProductivityExecutiveModel }) {
  const workforce = executiveWorkforceInsightData;
  const projectedMonthlyKrw = model.currentFixedCostKrw + workforce.netMonthlyChangeKrw;

  return (
    <section className="workforce-decision-board" aria-label="Team Plan 보급 및 활용 측정 의사결정">
      <div className="workforce-kpi-strip">
        <article>
          <span className="workforce-kpi-icon blue"><CircleDollarSign size={18} /></span>
          <div>
            <small>현재 월 최소 비용</small>
            <strong>{formatManWon(model.currentFixedCostKrw)}</strong>
            <p>구독료와 API 계약 고정비 포함</p>
          </div>
        </article>
        <article>
          <span className="workforce-kpi-icon teal"><UserCheck size={18} /></span>
          <div>
            <small>Team Plan 보급률</small>
            <strong>{formatRate(workforce.teamPlanCoverageRate)}</strong>
            <p>{workforce.teamPlanUsers}/{workforce.eligibleEmployees}명 · Standard {workforce.teamPlanStandardUsers} / Premium {workforce.teamPlanPremiumUsers}</p>
          </div>
        </article>
        <article>
          <span className="workforce-kpi-icon amber"><Gauge size={18} /></span>
          <div>
            <small>토큰 측정 커버리지</small>
            <strong>{workforce.tokenMeasuredUsers}/{workforce.tokenMeasurementTarget}명</strong>
            <p>현재 {workforce.tokenMeasuredUsers}명 · 원천 연결 대기 {workforce.tokenPendingUsers.length}명</p>
          </div>
        </article>
        <article>
          <span className="workforce-kpi-icon green"><Sparkles size={18} /></span>
          <div>
            <small>순수 신규 Team Plan</small>
            <strong>{workforce.pureAdditionalSeats}석</strong>
            <p>기존 {workforce.teamPlanUsers} + 전환 {workforce.conversionSeats} + 신규 {workforce.pureAdditionalSeats} = {workforce.eligibleEmployees}명</p>
          </div>
        </article>
      </div>

      <div className="workforce-analysis-grid">
        <section className="workforce-coverage-panel">
          <div className="section-heading">
            <div>
              <strong>Team Plan 보급 및 전환 구조</strong>
              <span>{workforce.source.workforceBasis} · 현재 결재 현황 기준</span>
            </div>
            <span className="state-pill neutral">목표 100%</span>
          </div>
          <div className="coverage-score-row">
            <strong>{workforce.teamPlanUsers}<small>명 Team Plan</small></strong>
            <span>/</span>
            <b>{workforce.eligibleEmployees}<small>명 대상</small></b>
          </div>
          <div className="coverage-track" aria-label={`Team Plan 보급률 ${formatRate(workforce.teamPlanCoverageRate)}`}>
            <span style={{ width: `${workforce.teamPlanCoverageRate}%` }} />
          </div>
          <div className="coverage-legend">
            <span><i className="tracked" />기존 Team Plan {workforce.teamPlanUsers}명</span>
            <span><i className="convert" />전환 대상 {workforce.conversionSeats}건</span>
            <span><i className="gap" />순수 신규 {workforce.pureAdditionalSeats}석</span>
          </div>
          <div className="tracked-user-groups">
            <p><b>현재 Team Plan {workforce.teamPlanUsers}명</b>Standard {workforce.teamPlanStandardUsers}명 · Premium {workforce.teamPlanPremiumUsers}명</p>
            <p><b>개인 계정 전환 {workforce.personalConversionAccounts.length}건</b>{workforce.personalConversionAccounts.map((account) => `${account.name} (${account.currentPlan})`).join(" · ")}</p>
            <p><b>공용 계정 전환 {workforce.sharedConversionAccounts.length}건</b>{workforce.sharedConversionAccounts.map((account) => `${account.name} (${account.currentPlan})`).join(" · ")}</p>
          </div>
        </section>

        <section className="workforce-intensity-panel">
          <div className="section-heading">
            <div>
              <strong>토큰 측정 및 직군별 평가</strong>
              <span>{workforce.source.tokenPeriod} · 현재 {workforce.tokenMeasuredUsers}명 / 목표 {workforce.tokenMeasurementTarget}명</span>
            </div>
          </div>
          <div className="tracked-user-groups">
            <p><b>원천 연결 대기 {workforce.tokenPendingUsers.length}명</b>{workforce.tokenPendingUsers.map((user) => user.name).join(" · ")}</p>
          </div>
          <div className="usage-segment-list">
            {workforce.usageSegments.map((segment) => (
              <div className={`usage-segment ${segment.key}`} key={segment.key}>
                <div className="usage-segment-heading">
                  <b>{segment.label}</b>
                  <span>{segment.count}명</span>
                  <small>{segment.criteria}</small>
                </div>
                <div className="usage-segment-track">
                  <span style={{ width: `${(segment.count / workforce.tokenMeasuredUsers) * 100}%` }} />
                </div>
                <p>{segment.users.join(" · ")}</p>
              </div>
            ))}
          </div>
          <div className="usage-interpretation">
            <p>
              <b>{workforce.evaluationFramework.developer.label}</b>
              {workforce.evaluationFramework.developer.measures.join(" + ")} · {workforce.evaluationFramework.developer.description}
            </p>
            <p>
              <b>{workforce.evaluationFramework.nonDeveloper.label}</b>
              {workforce.evaluationFramework.nonDeveloper.measures.join(" + ")} · {workforce.evaluationFramework.nonDeveloper.description}
            </p>
          </div>
        </section>

        <aside className="workforce-investment-panel">
          <div className="investment-kicker">Decision</div>
          <h3>4건 전환 + 15석 신규로 41명 Team Plan 체계</h3>
          <p>개인·공용 Claude 4건을 Standard로 전환하고 순수 신규 {workforce.pureAdditionalSeats}석을 추가하는 비교 시나리오입니다.</p>
          <div className="cost-bridge">
            <div><span>현재 최소 비용</span><strong>{formatManWon(model.currentFixedCostKrw)}</strong></div>
            <ArrowRight size={17} />
            <div><span>월 순변화</span><strong>{workforce.netMonthlyChangeKrw < 0 ? "절감 " : "+"}{formatManWon(Math.abs(workforce.netMonthlyChangeKrw))}</strong></div>
            <ArrowRight size={17} />
            <div><span>시나리오 최소</span><strong>{formatManWon(projectedMonthlyKrw)}</strong></div>
          </div>
          <ul>
            <li><CheckCircle2 size={15} /><span><b>기존 비팀플랜 4건 전환</b>개인 2건 · 공용 2건을 개인 Team Plan으로 전환</span></li>
            <li><CheckCircle2 size={15} /><span><b>순수 신규 {workforce.pureAdditionalSeats}석 추가</b>기존 22명과 전환 4명을 제외한 수량</span></li>
            <li><CheckCircle2 size={15} /><span><b>총 {workforce.totalTeamPlanActions}건 조치</b>전환 {workforce.conversionSeats}건 + 신규 {workforce.pureAdditionalSeats}석</span></li>
          </ul>
          <footer>현재 비팀플랜 4건 {formatManWon(workforce.currentConversionCostKrw)} → Standard {workforce.totalTeamPlanActions}석 {formatManWon(workforce.proposedTeamPlanActionCostKrw)} · {workforce.source.conversionAssumption}</footer>
        </aside>
      </div>
    </section>
  );
}

function ExecutiveOverviewView({ model }: { model: ProductivityExecutiveModel }) {
  const latestCohort = model.cohorts[model.cohorts.length - 1];
  const activityScale = Math.max(
    model.axKpis.activity.conversationsPerActiveDay,
    model.axKpis.activity.previousConversationsPerActiveDay,
    1,
  );
  const outputScale = Math.max(
    model.axKpis.output.outputsPerObservedDay,
    model.axKpis.output.previousOutputsPerObservedDay,
    1,
  );
  const outputYieldScale = Math.max(
    model.axKpis.output.outputsPerConversation,
    model.axKpis.output.previousOutputsPerConversation,
    1,
  );

  return (
    <div className="content-grid executive-view">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Cohort Trend</span>
            <h2>사용월 기준 비용과 활동</h2>
          </div>
          <div className="panel-header-side">
            <span className="state-pill ok">비용 확정월 정렬</span>
            <span className="state-pill neutral">대화 세션 + Drive 결과 신호</span>
          </div>
        </div>
        <p className="insight-lead">
          청구 확인월이 아니라 실제 사용월에 비용을 연결합니다. Claude 활동은 Claude Export와 Drive 대화 기록을 한
          계열로 원천 합산하며, 결과는 압축·로그·프롬프트를 제외한 Drive 산출 파일 신호입니다.
        </p>
        <div className="executive-chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={model.costUsageSeries} margin={{ top: 18, right: 12, left: 6, bottom: 4 }}>
              <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="cost"
                tickFormatter={formatAxisWon}
                tickLine={false}
                axisLine={false}
                width={62}
              />
              <YAxis
                yAxisId="usage"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={42}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "확정 AI 비용"
                    ? formatWon(Number(value))
                    : `${numberFormat.format(Number(value))}${String(name).includes("대화") ? "대화" : "개"}`,
                  name,
                ]}
              />
              <Legend />
              <Bar
                dataKey="chatGptConversations"
                name="ChatGPT 대화"
                yAxisId="usage"
                fill="#2f8f46"
                stackId="conversations"
                maxBarSize={34}
              />
              <Bar
                dataKey="claudeConversations"
                name="Claude 통합 대화"
                yAxisId="usage"
                fill="#0f8b8d"
                stackId="conversations"
                radius={[4, 4, 0, 0]}
                maxBarSize={34}
              />
              <Bar
                dataKey="driveOutputSignals"
                name="Drive 산출 신호"
                yAxisId="usage"
                fill="#c58612"
                radius={[4, 4, 0, 0]}
                maxBarSize={34}
              />
              <Line
                dataKey="costKrw"
                name="확정 AI 비용"
                yAxisId="cost"
                type="monotone"
                stroke="#e85d4f"
                strokeWidth={3}
                dot={{ r: 4, fill: "#e85d4f" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="daily-activity-block">
          <div className="daily-activity-head">
            <div>
              <span className="eyebrow">Drive Prompt Activity</span>
              <h3>Claude Drive 일별 대화 기록과 산출 신호</h3>
            </div>
            <span className="state-pill neutral">세션 식별자 중복 제거</span>
          </div>
          <div className="daily-activity-summary">
            <div>
              <span>Drive 대화 기록</span>
              <strong>{numberFormat.format(model.claudeConversations)}건</strong>
            </div>
            <div>
              <span>본문 확인 프롬프트</span>
              <strong>{numberFormat.format(model.drivePromptRecords)}건</strong>
            </div>
            <div>
              <span>대화 발생일</span>
              <strong>{numberFormat.format(model.conversationActiveDays)}일</strong>
            </div>
            <div>
              <span>활성일 평균</span>
              <strong>{model.conversationDailyAverage.toFixed(1)}건</strong>
            </div>
            <div>
              <span>Drive 결과 신호</span>
              <strong>{numberFormat.format(model.driveOutputs)}개</strong>
            </div>
          </div>
          <div className="daily-activity-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={model.dailyDriveActivity} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis
                  yAxisId="conversations"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={34}
                />
                <YAxis
                  yAxisId="outputs"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={38}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${numberFormat.format(Number(value))}${name === "Claude Drive 대화" ? "건" : "개"}`,
                    name,
                  ]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
                />
                <Bar
                  dataKey="claudeConversations"
                  name="Claude Drive 대화"
                  yAxisId="conversations"
                  fill="#0f8b8d"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                />
                <Line
                  dataKey="driveOutputSignals"
                  name="Drive 산출 신호"
                  yAxisId="outputs"
                  type="monotone"
                  stroke="#c58612"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <small className="daily-activity-note">
            Drive 대화 {numberFormat.format(model.claudeConversations)}건은 세션백업·대화기록을 중복 제거한 추정치이고,
            본문 확인 프롬프트 {numberFormat.format(model.drivePromptRecords)}건은 대표 기록 분류값이므로 서로 더하지 않습니다.
            월별 그래프의 Claude 통합 대화는 이 값에 Claude Export를 더한 원천 합산 신호이며, 결과 신호는 실제 채택·품질
            확정 건수가 아닙니다.
          </small>
        </div>
        <div className="insight-box">
          <CalendarRange size={18} />
          <div>
            <strong>{model.lastClosedMonthLabel}까지 비용 확정</strong>
            <span>
              최신 사용월은 {model.currentMonthLabel}이며 비용 원천은 {model.lagMonths}개월 후행합니다. 비용 자료가 들어오면
              해당 사용월 코호트만 재계산합니다.
            </span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Current Pulse</span>
            <h2>{model.currentMonthLabel} 생산성 잠정치</h2>
          </div>
          <span className="state-pill warning">잠정</span>
        </div>
        <div className="productivity-meter-list">
          <MeterRow
            color="#0f8b8d"
            label="Claude Team 활성률"
            value={model.activationRate}
            valueLabel={formatRate(model.activationRate)}
          />
          <MeterRow
            color="#2f8f46"
            label="Claude Code 사용 계정률"
            value={model.codeUserRate}
            valueLabel={formatRate(model.codeUserRate)}
          />
          <MeterRow
            color="#5f6f8c"
            label="Claude Drive 결과·산출 신호 비중"
            value={(model.driveOutputs / model.observableRepositoryOutputs) * 100}
            valueLabel={`${numberFormat.format(model.driveOutputs)}개`}
          />
          <MeterRow
            color="#c58612"
            label="Genspark 산출 비중"
            value={(model.gensparkOutputs / model.observableRepositoryOutputs) * 100}
            valueLabel={`${numberFormat.format(model.gensparkOutputs)}개`}
          />
        </div>
        <div className="current-output-grid">
          <div>
            <span>{model.classifiedActivityMonthLabel} Claude 통합 대화</span>
            <strong>{numberFormat.format(model.currentMonthClaudeCombinedConversations)}건</strong>
            <small>
              Export {numberFormat.format(model.currentMonthClaudeExportConversations)} + Drive{" "}
              {numberFormat.format(model.currentMonthClaudeConversations)}
            </small>
          </div>
          <div>
            <span>{model.classifiedOutputMonthLabel} Drive 산출 신호</span>
            <strong>{numberFormat.format(model.currentMonthDriveOutputs)}개</strong>
          </div>
          <div>
            <span>Claude 요청</span>
            <strong>{numberFormat.format(model.requests)}건</strong>
          </div>
          <div>
            <span>Claude Code</span>
            <strong>{numberFormat.format(model.codeLines)}줄</strong>
          </div>
        </div>
        <div className="insight-box compact-insight">
          <Activity size={18} />
          <div>
            <strong>사용 확산은 확인, 생산성 효과는 잠정</strong>
            <span>실제 업무 채택·재사용·절감시간 데이터가 추가되기 전에는 ROI로 확정하지 않습니다.</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Cost Interpretation</span>
            <h2>비용 판단 기준</h2>
          </div>
        </div>
        <div className="plan-stack cost-rule-stack">
          <div className="rule-row">
            <span>현재 월 최소 비용</span>
            <strong>{formatWon(model.currentFixedCostKrw)}</strong>
          </div>
          <div className="rule-row">
            <span>최근 확정 비용</span>
            <strong>{formatWon(model.lastClosedCostKrw)}</strong>
          </div>
          <div className="rule-row">
            <span>비용 후행 시차</span>
            <strong>{model.lagMonths}개월</strong>
          </div>
          <div className="rule-row">
            <span>당월 변동비</span>
            <strong>확정 대기</strong>
          </div>
        </div>
        <div className="insight-box compact-insight">
          <CircleDollarSign size={18} />
          <div>
            <strong>고정비는 최소값, API 비용은 별도</strong>
            <span>Claude Team Spend와 시트 구독료는 청구 의미가 확인되기 전까지 중복 합산하지 않습니다.</span>
          </div>
        </div>
      </section>

      <section className="panel panel-wide ax-kpi-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">AX Execution KPI</span>
            <h2>도입·활동·산출 단계별 현황</h2>
          </div>
          <div className="panel-header-side">
            <span className="state-pill ok">자동 계산</span>
            <span className="state-pill neutral">성과·품질은 별도 검증</span>
          </div>
        </div>
        <p className="insight-lead">
          단일 종합점수로 섞지 않고 AX 실행 과정을 세 단계로 분리합니다. 도입은 계정 활성, 활동은 Drive 대화 기록,
          산출은 중복 제거된 Drive 결과 파일 신호를 사용합니다.
        </p>
        <div className="ax-kpi-stage-grid">
          <section className="ax-kpi-stage">
            <div className="ax-kpi-stage-head">
              <div className="ax-kpi-stage-title">
                <span className="ax-kpi-step">1</span>
                <div>
                  <span>도입 KPI</span>
                  <strong>접근성과 사용 기반</strong>
                </div>
              </div>
              <span className="state-pill ok">높음</span>
            </div>
            <div className="ax-kpi-headline">
              <strong>{formatRate(model.activationRate)}</strong>
              <span>Claude 활성률</span>
            </div>
            <div className="ax-kpi-meter-list">
              <MeterRow
                color="#0f8b8d"
                label="Claude 활성 계정"
                value={model.activationRate}
                valueLabel={`${model.activeUsers}/${model.licensedUsers}명`}
              />
              <MeterRow
                color="#2f8f46"
                label="Claude Code 사용 계정"
                value={model.codeUserRate}
                valueLabel={`${model.codeUsers}/${model.licensedUsers}명`}
              />
              <MeterRow
                color="#7d6ca7"
                label="Drive 대화 증빙 커버리지"
                value={model.axKpis.adoption.evidenceCoverageRate}
                valueLabel={`${model.axKpis.adoption.evidenceContributors}/${model.activeUsers}명`}
              />
            </div>
            <p className="ax-kpi-interpretation">
              계정 도입은 충분하지만, 대화·산출 증빙이 연결된 사용자는 {model.axKpis.adoption.evidenceContributors}명입니다.
              전사 활용 비교를 위해 저장소 연결 범위를 넓혀야 합니다.
            </p>
          </section>

          <section className="ax-kpi-stage">
            <div className="ax-kpi-stage-head">
              <div className="ax-kpi-stage-title">
                <span className="ax-kpi-step">2</span>
                <div>
                  <span>활동 KPI</span>
                  <strong>사용 지속성과 강도</strong>
                </div>
              </div>
              <span className="state-pill ok">증가</span>
            </div>
            <div className="ax-kpi-headline">
              <strong>{model.axKpis.activity.conversationsPerActiveDay.toFixed(1)}건</strong>
              <span>{model.classifiedActivityMonthLabel} Drive 활성일 평균 대화</span>
            </div>
            <div className="ax-kpi-comparison" aria-label="월별 일평균 대화 세션 비교">
              <div>
                <span>이전 월</span>
                <div className="ax-kpi-comparison-track">
                  <i
                    style={{
                      width: `${(model.axKpis.activity.previousConversationsPerActiveDay / activityScale) * 100}%`,
                      background: "#93a39b",
                    }}
                  />
                </div>
                <strong>{model.axKpis.activity.previousConversationsPerActiveDay.toFixed(1)}</strong>
              </div>
              <div>
                <span>현재 월</span>
                <div className="ax-kpi-comparison-track">
                  <i
                    style={{
                      width: `${(model.axKpis.activity.conversationsPerActiveDay / activityScale) * 100}%`,
                      background: "#0f8b8d",
                    }}
                  />
                </div>
                <strong>{model.axKpis.activity.conversationsPerActiveDay.toFixed(1)}</strong>
              </div>
            </div>
            <div className="ax-kpi-meter-list compact">
              <MeterRow
                color="#0f8b8d"
                label="대화 세션 지속률"
                value={model.axKpis.activity.activeDayRate}
                valueLabel={`${model.axKpis.activity.activeDays}/${model.axKpis.activity.observedDays}일`}
              />
              <MeterRow
                color="#c58612"
                label="상위 사용자 집중도"
                value={model.axKpis.activity.topContributorShare}
                valueLabel={`${model.axKpis.activity.topContributor} ${formatRate(model.axKpis.activity.topContributorShare)}`}
              />
            </div>
            <p className="ax-kpi-interpretation">
              Drive 활성일 평균 대화는 이전 월보다 {formatRate(model.axKpis.activity.dailyGrowthRate, true)} 증가했습니다. 활동은
              지속적이지만 Drive 증빙이 특정 사용자에게 집중돼 있습니다.
            </p>
          </section>

          <section className="ax-kpi-stage">
            <div className="ax-kpi-stage-head">
              <div className="ax-kpi-stage-title">
                <span className="ax-kpi-step">3</span>
                <div>
                  <span>산출 KPI</span>
                  <strong>결과 생성과 전환</strong>
                </div>
              </div>
              <span className={`state-pill ${model.axKpis.output.dailyGrowthRate >= 0 ? "ok" : "warning"}`}>
                {model.axKpis.output.dailyGrowthRate >= 0 ? "증가" : "감소"}
              </span>
            </div>
            <div className="ax-kpi-headline">
              <strong>{model.axKpis.output.outputsPerConversation.toFixed(2)}개</strong>
              <span>{model.classifiedOutputMonthLabel} Drive 대화당 산출 신호</span>
            </div>
            <div className="ax-kpi-dual-comparison">
              <div>
                <span>일평균 산출</span>
                <div className="ax-kpi-comparison">
                  <div>
                    <span>이전</span>
                    <div className="ax-kpi-comparison-track">
                      <i
                        style={{
                          width: `${(model.axKpis.output.previousOutputsPerObservedDay / outputScale) * 100}%`,
                          background: "#93a39b",
                        }}
                      />
                    </div>
                    <strong>{model.axKpis.output.previousOutputsPerObservedDay.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span>현재</span>
                    <div className="ax-kpi-comparison-track">
                      <i
                        style={{
                          width: `${(model.axKpis.output.outputsPerObservedDay / outputScale) * 100}%`,
                          background: "#c58612",
                        }}
                      />
                    </div>
                    <strong>{model.axKpis.output.outputsPerObservedDay.toFixed(1)}</strong>
                  </div>
                </div>
              </div>
              <div>
                <span>대화 세션당 산출</span>
                <div className="ax-kpi-comparison">
                  <div>
                    <span>이전</span>
                    <div className="ax-kpi-comparison-track">
                      <i
                        style={{
                          width: `${(model.axKpis.output.previousOutputsPerConversation / outputYieldScale) * 100}%`,
                          background: "#93a39b",
                        }}
                      />
                    </div>
                    <strong>{model.axKpis.output.previousOutputsPerConversation.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span>현재</span>
                    <div className="ax-kpi-comparison-track">
                      <i
                        style={{
                          width: `${(model.axKpis.output.outputsPerConversation / outputYieldScale) * 100}%`,
                          background: "#2f8f46",
                        }}
                      />
                    </div>
                    <strong>{model.axKpis.output.outputsPerConversation.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
            <MeterRow
              color="#e85d4f"
              label="최대 산출일 비중"
              value={model.axKpis.output.peakShare}
              valueLabel={`${model.axKpis.output.peakDate.slice(5)} · ${model.axKpis.output.peakOutputs}개`}
            />
            <p className="ax-kpi-interpretation">
              일평균 산출은 {formatRate(model.axKpis.output.dailyGrowthRate, true)}, 대화 세션당 산출은{" "}
              {formatRate(model.axKpis.output.yieldGrowthRate, true)} 증가했습니다. 배치 작업과 최종 채택 여부는 별도
              확인이 필요합니다.
            </p>
          </section>
        </div>
        <div className="ax-kpi-boundary">
          <ShieldCheck size={17} />
          <span>
            1~3단계는 자동 수집 가능한 실행 선행지표입니다. 시간 절감, 1차 승인, 재작업, 품질과 ROI는 업무 단위
            검증 데이터가 연결된 뒤 성과 KPI로 추가합니다.
          </span>
        </div>
      </section>

      <section className="panel panel-wide cohort-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Monthly Cohorts</span>
            <h2>확정·비용 대기·잠정 월 구분</h2>
          </div>
          <span className="state-pill neutral">{model.cohorts.length}개 월 코호트</span>
        </div>
        <div className="cohort-grid">
          {model.cohorts.map((cohort) => (
            <article className="cohort-column" key={cohort.month}>
              <div className="cohort-head">
                <div>
                  <span>{cohort.label}</span>
                  <strong>{cohort.costKrw === null ? "비용 대기" : formatManWon(cohort.costKrw)}</strong>
                </div>
                <span className={`state-pill ${cohortStatusTone(cohort.status)}`}>{cohort.status}</span>
              </div>
              <small>{cohort.costBasis}</small>
              <div className="cohort-signal-group">
                <b>사용 신호</b>
                {cohort.usageSignals.length > 0 ? (
                  cohort.usageSignals.map((signal) => <span key={signal}>{signal}</span>)
                ) : (
                  <span>동일 월 사용 원천 없음</span>
                )}
              </div>
              <div className="cohort-signal-group">
                <b>산출 신호</b>
                {cohort.outputSignals.length > 0 ? (
                  cohort.outputSignals.map((signal) => <span key={signal}>{signal}</span>)
                ) : (
                  <span>검증 가능한 산출 원천 없음</span>
                )}
              </div>
              <p>{cohort.interpretation}</p>
            </article>
          ))}
        </div>
        {latestCohort && (
          <div className="cohort-footer-note">
            <ShieldCheck size={17} />
            <span>
              {latestCohort.label}은 {latestCohort.status} 상태입니다. 다음 비용 원천이 들어오면 게시월이 아니라 사용월에
              연결해 효율 지표를 갱신합니다.
            </span>
          </div>
        )}
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Source Freshness</span>
            <h2>생산성·비용 원천 상태</h2>
          </div>
          <span className="state-pill neutral">상세 파일 목록 비노출</span>
        </div>
        <div className="table-wrap freshness-table">
          <table>
            <thead>
              <tr>
                <th>원천</th>
                <th>수집 범위</th>
                <th>기준 시각</th>
                <th>상태</th>
                <th>해석 기준</th>
              </tr>
            </thead>
            <tbody>
              {model.sourceFreshness.map((source) => (
                <tr key={source.source}>
                  <td>
                    <strong>{source.source}</strong>
                  </td>
                  <td>{source.coverage}</td>
                  <td>{source.asOf}</td>
                  <td>
                    <span className={`state-pill ${freshnessStatusTone(source)}`}>{source.status}</span>
                  </td>
                  <td>{source.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function cohortStatusTone(status: "확정" | "비용 대기" | "잠정") {
  if (status === "확정") return "ok";
  if (status === "잠정") return "warning";
  return "neutral";
}

function freshnessStatusTone(source: ProductivitySourceFreshness) {
  if (source.status === "확정" || source.status === "전체 폴더 집계") return "ok";
  if (source.status === "수집 점검") return "warning";
  return "neutral";
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
  currentBillingMonth,
  fixedApiServiceMonthlyKrw,
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
  currentBillingMonth: string;
  fixedApiServiceMonthlyKrw: number;
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
  const actualFixedPlanTotal = monthlySeries
    .filter((row) => row.status === "실적")
    .reduce((sum, row) => sum + row.fixedPlan, 0);
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
          <span className="state-pill warning">월별 적용 고정비 기준</span>
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
              <Bar
                dataKey="forecastWithApi"
                name="고정비·API 반영 예측"
                fill="#66758f"
                radius={[5, 5, 0, 0]}
              />
              <Line
                dataKey="fixedPlan"
                name="월별 적용 고정비"
                stroke="#c58612"
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
                    적용 고정비 {formatManWon(item.baseForecastKrw)} · {item.apiSourceLabel}{" "}
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
              예측월별로 AI 도구 결재 현황의 적용 시작월을 반영합니다. GH AI Agent 개발용 AI API 고정비{" "}
              {formatManWon(fixedApiServiceMonthlyKrw)}은 2026년 8월부터 포함됩니다.
            </span>
            <span>
              API 반영분 {formatManWon(apiForecastAddedTotal)} · 고정비 적용 기준{" "}
              {formatManWon(operatingPlanForecastTotal)} · 적용월 {operatingPlanMonths}개월 · 고정비 기준 대비{" "}
              {formatRate(apiAdjustedForecastGrowth, true)}
            </span>
            <span>
              {monthLabel(currentBillingMonth)} 고정 비용 {formatManWon(operatingPlanSubscriptionKrw)}/월 · USD 결재 항목{" "}
              {formatPreciseUsd(operatingPlanSubscriptionUsd)}/월 · 환율{" "}
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
            <h2>월별 적용 고정비 기준 대비</h2>
          </div>
        </div>
        <div className="plan-stack">
          <GaugeRow
            label={`${actualRange} 월별 적용 고정비 기준`}
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
                <th>예측 고정비</th>
                <th>건수</th>
                <th>월별 적용 고정비</th>
              </tr>
            </thead>
            <tbody>
              {monthlySeries.map((row) => {
                const value = row.actual ?? row.forecast ?? row.operatingPlanForecast ?? 0;
                return (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>
                      <span className={`run-status ${row.status}`}>{row.status}</span>
                    </td>
                    <td>{formatWon(value)}</td>
                    <td>{row.operatingPlanForecast === null ? "-" : formatWon(row.operatingPlanForecast)}</td>
                    <td>{row.transactions ?? "-"}</td>
                    <td>{formatWon(row.fixedPlan)}</td>
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
  driveTrendSnapshot,
  usageData,
}: {
  claudeTeamUsageData: ClaudeTeamUsageData;
  driveRepositoryData: DriveArtifactRepositoryData;
  driveTrendSnapshot: DriveArtifactTrendSnapshot | null;
  usageData: GensparkUsageData;
}) {
  const insight = usageData.insightAnalysis;
  const claudeExport = usageData.chatGptExport;
  const topTopic = insight.topicInsights[0];
  const maxDriveRepositoryFiles = Math.max(...driveRepositoryData.repositories.map((repository) => repository.fileCount), 1);
  const maxDriveRepositoryDepth = Math.max(
    ...driveRepositoryData.repositories.map((repository) => repository.inventory.maxDepth),
    1,
  );
  const driveArtifactTrendSource = driveTrendSnapshot ?? driveRepositoryData;
  const driveArtifactTrend = useMemo(
    () => buildDriveArtifactDailyTrend(driveArtifactTrendSource),
    [driveArtifactTrendSource],
  );
  const driveArtifactTrendData = useMemo(
    () =>
      driveArtifactTrend.points.map((point) => ({
        ...point,
        ...point.ownerCounts,
      })),
    [driveArtifactTrend],
  );
  const driveOwnerColors = ["#0f8b8d", "#e85d4f", "#5f6f8c", "#c58612"];
  const driveTrendTotalFiles =
    driveTrendSnapshot?.totals.files ?? driveRepositoryData.totals.files;
  const driveTrendDirectFiles =
    driveTrendSnapshot?.totals.directFiles ?? driveRepositoryData.totals.directFiles;
  const driveTrendNestedFiles =
    driveTrendSnapshot?.totals.nestedFiles ?? driveRepositoryData.totals.nestedFiles;
  const driveActivity = driveRepositoryData.activityAnalysis;
  const drivePromptEvidence = driveActivity.promptEvidence;
  const integratedConversationAnalysis = useMemo(
    () =>
      buildIntegratedConversationAnalysis({
        chatGpt: chatGptUsageData,
        claudeExport,
        driveActivity,
      }),
    [claudeExport, driveActivity],
  );
  const gensparkDrive = usageData.driveAnalysis;
  const gammaArtifactCount = gammaDriveUsageData.artifactCount;
  const gammaTotalPages = gammaDriveUsageData.totalPages;
  const gammaTopArtifact = gammaDriveUsageData.artifacts[0];
  const [analysisSection, setAnalysisSection] = useState<
    "patterns" | "conversations" | "outputs"
  >("patterns");
  const analysisSections: Array<{
    key: "patterns" | "conversations" | "outputs";
    label: string;
    detail: string;
    icon: ReactNode;
  }> = [
    {
      key: "patterns",
      label: "업무 패턴",
      detail: `${insight.topicInsights.length}개 업무군`,
      icon: <ListOrdered size={18} />,
    },
    {
      key: "conversations",
      label: "통합 대화 분석",
      detail: `${numberFormat.format(integratedConversationAnalysis.conversationSignals)}건 · 3개 원천`,
      icon: <Bot size={18} />,
    },
    {
      key: "outputs",
      label: "산출물",
      detail: `Drive ${numberFormat.format(driveTrendTotalFiles)}개`,
      icon: <FileText size={18} />,
    },
  ];
  return (
    <div className="content-grid ai-insight-view">
      <section className="analysis-section-switcher panel-wide" aria-label="AI 활용 상세 분석 범위">
        <div className="analysis-switcher-copy">
          <span className="eyebrow">Analysis Scope</span>
          <strong>확인할 분석 범위</strong>
          <span>업무 흐름, 통합 대화, 산출물 기준으로 정리했습니다.</span>
        </div>
        <div className="analysis-section-tabs" role="tablist" aria-label="상세 분석 보기">
          {analysisSections.map((section) => (
            <button
              aria-selected={analysisSection === section.key}
              className={`analysis-section-tab ${analysisSection === section.key ? "is-active" : ""}`}
              key={section.key}
              onClick={() => setAnalysisSection(section.key)}
              role="tab"
              type="button"
            >
              {section.icon}
              <span>
                <strong>{section.label}</strong>
                <small>{section.detail}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      {analysisSection === "patterns" && (
        <>
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
        </>
      )}

      {analysisSection === "conversations" && (
        <section className="panel panel-wide integrated-conversation-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Unified Conversation Intelligence</span>
              <h2>ChatGPT·Claude 통합 대화 분석</h2>
            </div>
            <div className="panel-header-side">
              <span className="state-pill ok">3개 원천 통합</span>
              <span className="state-pill neutral">{integratedConversationAnalysis.period}</span>
            </div>
          </div>
          <p className="insight-lead">
            ChatGPT Export, Claude Team Export, Claude Drive 대화·프롬프트 기록을 하나의 활동 흐름으로
            통합했습니다. 총계는 원천별 대화 신호의 합이며, Claude Export와 Drive 사이의 잠재적 중복은
            고유 대화로 단정하지 않습니다.
          </p>

          <div className="claude-export-summary-grid">
            <article>
              <span>통합 대화 신호</span>
              <strong>{numberFormat.format(integratedConversationAnalysis.conversationSignals)}건</strong>
              <small>원천 3종 합산 · 고유 대화 수 아님</small>
            </article>
            <article>
              <span>확인된 메시지</span>
              <strong>{numberFormat.format(integratedConversationAnalysis.knownMessages)}건</strong>
              <small>ChatGPT + Claude Team Export</small>
            </article>
            <article>
              <span>첨부·산출 연결 신호</span>
              <strong>{numberFormat.format(integratedConversationAnalysis.linkedFileSignals)}개</strong>
              <small>대화 자산, 첨부, Drive 결과 신호 합산</small>
            </article>
            <article>
              <span>Claude Team 활성</span>
              <strong>{numberFormat.format(claudeTeamUsageData.activeUsers)}명</strong>
              <small>라이선스 {numberFormat.format(claudeTeamUsageData.licensedUsers)}명 중 활성</small>
            </article>
          </div>

          <div className="integrated-conversation-grid">
            <div className="integrated-conversation-section">
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow">Monthly Flow</span>
                  <h3>월별 통합 대화 흐름</h3>
                </div>
                <small>막대: 원천별 대화 신호 · 선: 합계</small>
              </div>
              <div className="integrated-conversation-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={integratedConversationAnalysis.monthlyUsage}
                    margin={{ top: 16, right: 14, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={42} />
                    <Tooltip
                      formatter={(value, name) => [
                        `${numberFormat.format(Number(value))}건`,
                        name,
                      ]}
                      labelFormatter={(label) => `${label} 대화 활동`}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="chatGpt" name="ChatGPT" stackId="conversation" fill="#2f8f46" />
                    <Bar dataKey="claudeExport" name="Claude Team" stackId="conversation" fill="#0f8b8d" />
                    <Bar
                      dataKey="claudeDrive"
                      name="Claude Drive"
                      stackId="conversation"
                      fill="#c58612"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      dataKey="total"
                      name="통합 합계"
                      type="monotone"
                      stroke="#28343b"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="integrated-conversation-section">
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow">Work Themes</span>
                  <h3>통합 업무 주제</h3>
                </div>
                <small>ChatGPT + Claude Team 분류 · Drive는 미분류</small>
              </div>
              <div className="claude-topic-list integrated-topic-list">
                {integratedConversationAnalysis.topicUsage.map((topic) => (
                  <article className="claude-topic-item" key={topic.topic}>
                    <MeterRow
                      color={topic.color}
                      label={topic.topic}
                      value={topic.share}
                      valueLabel={`${numberFormat.format(topic.conversations)}건 · ${formatRate(topic.share)}`}
                    />
                    <small>{topic.note}</small>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="integrated-conversation-section source-reconciliation-section">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">Source Reconciliation</span>
                <h3>통합 원천 범위</h3>
              </div>
              <small>원천별 최신 수치를 통합 화면에서 대조</small>
            </div>
            <div className="table-wrap claude-export-table">
              <table>
                <thead>
                  <tr>
                    <th>원천</th>
                    <th>대화 신호</th>
                    <th>메시지</th>
                    <th>전체 비중</th>
                    <th>수집 기간</th>
                    <th>집계 기준</th>
                  </tr>
                </thead>
                <tbody>
                  {integratedConversationAnalysis.sources.map((source) => (
                    <tr key={source.key}>
                      <td>
                        <span className="source-label-cell">
                          <i style={{ background: source.color }} />
                          <strong>{source.label}</strong>
                        </span>
                      </td>
                      <td>{numberFormat.format(source.conversations)}건</td>
                      <td>{source.messages === null ? "산출 불가" : `${numberFormat.format(source.messages)}건`}</td>
                      <td>{formatRate((source.conversations / integratedConversationAnalysis.conversationSignals) * 100)}</td>
                      <td>{source.period}</td>
                      <td>{source.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="integrated-conversation-grid evidence-grid">
            <div className="integrated-conversation-section">
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow">Drive Account Link</span>
                  <h3>Claude Drive 사용자 연결</h3>
                </div>
                <small>대화·프롬프트와 결과 신호</small>
              </div>
              <div className="table-wrap claude-export-table compact-table">
                <table>
                  <thead>
                    <tr>
                      <th>사용자/저장소</th>
                      <th>대화</th>
                      <th>본문 확인</th>
                      <th>결과 신호</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driveActivity.byOwner.map((owner) => (
                      <tr key={owner.owner}>
                        <td><strong>{owner.owner}</strong></td>
                        <td>{numberFormat.format(owner.conversations)}</td>
                        <td>{numberFormat.format(owner.promptRecords)}</td>
                        <td>{numberFormat.format(owner.outputSignals)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="integrated-conversation-section team-plan-evidence">
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow">Team Plan Link</span>
                  <h3>Claude Team 활동 연결</h3>
                </div>
                <small>{claudeTeamUsageData.source.period}</small>
              </div>
              <dl className="integrated-evidence-list">
                <div>
                  <dt>대화 활성 계정</dt>
                  <dd>{numberFormat.format(claudeExport?.userDirectory.activeAccounts ?? 0)}명</dd>
                </div>
                <div>
                  <dt>Team 요청</dt>
                  <dd>{numberFormat.format(claudeTeamUsageData.totalRequests)}건</dd>
                </div>
                <div>
                  <dt>Code Lines</dt>
                  <dd>{numberFormat.format(claudeTeamUsageData.totalCodeLines)}줄</dd>
                </div>
                <div>
                  <dt>교차 확인 계정</dt>
                  <dd>{numberFormat.format(claudeTeamUsageData.source.verification.matchedAccounts)}명</dd>
                </div>
              </dl>
              <p>{claudeTeamUsageData.source.verification.note}</p>
            </div>
          </div>

          <div className="insight-box">
            <ShieldCheck size={18} />
            <div>
              <strong>통합 수치 해석 기준</strong>
              <span>
                Claude Team 요청 수는 API·도구 호출량이므로 대화 건수에 다시 더하지 않고 운영 강도 보조지표로만 연결했습니다.
              </span>
              <span>{drivePromptEvidence.definition}</span>
              <span>Drive 결과 신호와 대화 첨부는 최종 승인 산출물 수가 아니라 결과 연결 가능성을 나타냅니다.</span>
            </div>
          </div>
        </section>
      )}

      {analysisSection === "outputs" && gensparkDrive && (
        <section className="panel panel-wide">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Genspark Drive Audit</span>
              <h2>Genspark 폴더 사용 내역</h2>
            </div>
            <div className="panel-header-side">
              <span className="state-pill ok">
                {gensparkDrive.source.schedule ?? "Drive 조회"}
              </span>
              <span className="state-pill neutral">{gensparkDrive.source.period}</span>
            </div>
          </div>
          <div className="drive-summary-grid">
            <article>
              <span>Drive 파일</span>
              <strong>{numberFormat.format(gensparkDrive.totalFiles)}개</strong>
              <small>
                개별 산출{" "}
                {numberFormat.format(
                  gensparkDrive.individualArtifacts ?? gensparkDrive.totalFiles,
                )}
                개
                {typeof gensparkDrive.archiveFiles === "number"
                  ? ` · 아카이브 ${numberFormat.format(gensparkDrive.archiveFiles)}개`
                  : ""}
              </small>
            </article>
            <article>
              <span>최상위 프로젝트</span>
              <strong>{numberFormat.format(gensparkDrive.projectCount)}개</strong>
              <small>폴더 {gensparkDrive.folderCount}개 · 개별 파일 {gensparkDrive.rootFileCount}개</small>
            </article>
            <article>
              <span>저장 규모</span>
              <strong>{gensparkDrive.totalSizeLabel}</strong>
              <small>최신 산출 {gensparkDrive.latestOutputDate}</small>
            </article>
            <article>
              <span>최다 파일 유형</span>
              <strong>{gensparkDrive.typeBreakdown[0]?.name ?? "-"}</strong>
              <small>{numberFormat.format(gensparkDrive.typeBreakdown[0]?.tasks ?? 0)}건 · {formatRate(gensparkDrive.typeBreakdown[0]?.share ?? 0)}</small>
            </article>
          </div>

          <div className="chatgpt-export-grid compact">
            <div className="chatgpt-export-column">
              <h3>산출물 유형</h3>
              <div className="claude-topic-list">
                {gensparkDrive.typeBreakdown.map((fileType) => (
                  <MeterRow
                    color={fileType.color}
                    key={fileType.name}
                    label={`${fileType.name} · ${fileType.note}`}
                    value={fileType.share}
                    valueLabel={`${numberFormat.format(fileType.tasks)}개`}
                  />
                ))}
              </div>
            </div>
            <div className="chatgpt-export-column">
              <h3>프로젝트별 산출물</h3>
              <div className="claude-topic-list">
                {gensparkDrive.projectBreakdown.map((project) => (
                  <MeterRow
                    color={project.color}
                    key={project.name}
                    label={`${project.name} · ${project.note}`}
                    value={project.share}
                    valueLabel={`${numberFormat.format(project.tasks)}개`}
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
              <span>{gensparkDrive.directFileSignal}</span>
              {gensparkDrive.insights.map((driveInsight) => (
                <span key={driveInsight}>{driveInsight}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {analysisSection === "outputs" && (
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
            <strong>{numberFormat.format(gammaArtifactCount)}개 산출물</strong>
            <p>{gammaDriveUsageData.businessUse}</p>
            <small>{gammaDriveUsageData.source.note}</small>
          </div>
          <div className="gamma-drive-metrics">
            <div>
              <span>총 분량</span>
              <strong>{numberFormat.format(gammaTotalPages)}장</strong>
            </div>
            <div>
              <span>파일 구성</span>
              <strong>
                Slides {numberFormat.format(gammaDriveUsageData.googleSlidesCount)} · PDF{" "}
                {numberFormat.format(gammaDriveUsageData.pdfCount)}
              </strong>
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
                <span>{numberFormat.format(topic.count)}개 산출물</span>
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
                {artifact.format} · {artifact.category} · {artifact.slideCount}장
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
      )}

      {analysisSection === "outputs" && (
      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Google Drive Repository</span>
            <h2>Claude Drive 산출물 저장소</h2>
          </div>
          <div className="panel-header-side">
            <span className="state-pill ok">Drive 조회</span>
            <span className="state-pill neutral">
              {driveTrendSnapshot?.source.period ?? driveRepositoryData.source.period}
            </span>
          </div>
        </div>
        <div className="drive-summary-grid">
          <article>
            <span>저장소</span>
            <strong>{numberFormat.format(driveRepositoryData.totals.repositories)}개</strong>
            <small>{driveRepositoryData.repositories.map((repository) => repository.owner).join(" · ")}</small>
          </article>
          <article>
            <span>총 파일</span>
            <strong>{numberFormat.format(driveTrendTotalFiles)}개</strong>
            <small>그래프 원천 · 루트와 모든 하위 폴더 재귀 집계</small>
          </article>
          <article>
            <span>직접/하위 파일</span>
            <strong>
              {numberFormat.format(driveTrendDirectFiles)} / {numberFormat.format(driveTrendNestedFiles)}
            </strong>
            <small>
              하위 폴더 포함률{" "}
              {formatRate(
                driveTrendTotalFiles > 0
                  ? (driveTrendNestedFiles / driveTrendTotalFiles) * 100
                  : 0,
              )}
            </small>
          </article>
          <article>
            <span>고유/중복 추정</span>
            <strong>
              {numberFormat.format(driveRepositoryData.totals.uniqueFiles)} / {numberFormat.format(driveRepositoryData.totals.duplicateCopies)}
            </strong>
            <small>최근 콘텐츠 분석 · 파일명·크기·형식 조합 기준</small>
          </article>
        </div>

        <div className="drive-trend-section">
          <div className="drive-trend-head">
            <div>
              <span className="eyebrow">Daily Creation</span>
              <h3>날짜별 저장 파일 증감</h3>
            </div>
            <div className="drive-trend-stats">
              <span>
                <strong>{driveTrendSnapshot ? "자동 갱신" : "기본 집계"}</strong> ·{" "}
                {driveTrendSnapshot?.source.collectedAt ?? driveRepositoryData.source.collectedAt}
              </span>
              <span>
                최근 생성 <strong>{driveArtifactTrend.latestDay?.label ?? "-"}</strong> · {numberFormat.format(driveArtifactTrend.latestDay?.total ?? 0)}개
              </span>
              <span>
                일일 최고 <strong>{driveArtifactTrend.peakDay?.label ?? "-"}</strong> · {numberFormat.format(driveArtifactTrend.peakDay?.total ?? 0)}개
              </span>
              <span>
                생성 발생일 <strong>{numberFormat.format(driveArtifactTrend.activeDays)}일</strong>
              </span>
            </div>
          </div>
          <div className="drive-trend-chart" aria-label="Claude Drive 날짜별 신규 저장 파일과 누적 파일 추이">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={driveArtifactTrendData} margin={{ top: 18, right: 16, left: 4, bottom: 2 }}>
                <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
                <YAxis yAxisId="daily" tickLine={false} axisLine={false} allowDecimals={false} width={36} />
                <YAxis
                  yAxisId="cumulative"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={42}
                />
                <Tooltip
                  labelFormatter={(label) => `${label} 생성`}
                  formatter={(value, name) => [`${numberFormat.format(Number(value))}개`, name]}
                />
                <Legend iconType="circle" />
                {driveArtifactTrend.owners.map((owner, index) => (
                  <Bar
                    dataKey={owner}
                    fill={driveOwnerColors[index % driveOwnerColors.length]}
                    key={owner}
                    name={`${owner} 신규`}
                    stackId="owner"
                    yAxisId="daily"
                    radius={index === driveArtifactTrend.owners.length - 1 ? [4, 4, 0, 0] : 0}
                    maxBarSize={38}
                  />
                ))}
                <Line
                  dataKey="cumulative"
                  name="전체 누적"
                  yAxisId="cumulative"
                  type="monotone"
                  stroke="#2f8f46"
                  strokeWidth={3}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="drive-trend-note">
            <span>
              막대는 한국시간 기준 일별 신규 저장 파일, 선은 전체 누적 파일입니다. 기간 이전 생성시각 {numberFormat.format(driveArtifactTrend.openingFiles)}개는 시작 잔액입니다.
            </span>
            <strong>누적 {numberFormat.format(driveArtifactTrend.points[driveArtifactTrend.points.length - 1]?.cumulative ?? 0)}개 · 그래프 원천 {numberFormat.format(driveTrendTotalFiles)}개 일치</strong>
          </div>
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
                <span>하위 {numberFormat.format(repository.inventory.nestedFileCount)}개</span>
                <span>폴더 {numberFormat.format(repository.inventory.folderCount)}개</span>
                <span>활용도 {repository.utilizationScore}점</span>
              </div>
              <div className="usage-meter-cell">
                <strong>{repository.utilizationLevel}</strong>
                <div className="department-meter" aria-label={`${repository.owner} 저장 파일 비중`}>
                  <span style={{ width: `${Math.min((repository.fileCount / maxDriveRepositoryFiles) * 100, 100)}%` }} />
                </div>
                <small>
                  최대 {repository.inventory.maxDepth}/{maxDriveRepositoryDepth}단계 · 최근 수정 {formatKstDateTime(repository.folderModifiedAt)}
                </small>
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
      )}

    </div>
  );
}

function AiToolApprovalView({ approvalData }: { approvalData: AiToolApprovalData }) {
  const maxToolMonthlyKrw = Math.max(...approvalData.toolSummary.map((item) => item.monthlyKrw), 1);
  const maxDepartmentMonthlyKrw = Math.max(...approvalData.departmentSummary.map((item) => item.monthlyKrw), 1);
  const topTool = approvalData.toolSummary[0];
  const topToolTieCount = approvalData.toolSummary.filter((item) => item.monthlyKrw === topTool?.monthlyKrw).length;
  const topDepartment = approvalData.departmentSummary[0];
  const personCostSummary = buildApprovalPersonCostSummary(approvalData.records);
  const topPersonCost = personCostSummary.people[0];

  return (
    <div className="content-grid approval-view">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Payment Control</span>
            <h2>서비스 계열별 월 구독료</h2>
          </div>
          <div className="panel-header-side">
            <span className="state-pill neutral">{approvalData.source.period}</span>
          </div>
        </div>
        <div className="approval-meter-list">
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
          {approvalData.insights.slice(2).map((insight, index) => (
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
            <span className="eyebrow">Cost Per Person</span>
            <h2>인당 월 사용 비용</h2>
          </div>
          <div className="panel-header-side">
            <span className="state-pill neutral">{numberFormat.format(personCostSummary.personCount)}명</span>
            <span className="state-pill ok">인당 평균 {formatWon(personCostSummary.averageMonthlyKrw)}</span>
          </div>
        </div>
        <div className="table-wrap approval-person-cost-table">
          <table>
            <thead>
              <tr>
                <th>순위</th>
                <th>사용자/부서</th>
                <th>사용 도구</th>
                <th>결재 항목</th>
                <th>월 사용 비용</th>
              </tr>
            </thead>
            <tbody>
              {personCostSummary.people.map((person, index) => (
                <tr key={person.name}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{person.name}</strong>
                    <small>{person.departments.join(" · ")}</small>
                  </td>
                  <td>
                    <strong>{person.tools.join(" · ")}</strong>
                  </td>
                  <td>{numberFormat.format(person.itemCount)}개</td>
                  <td>
                    <strong>{formatWon(person.monthlyKrw)}</strong>
                    <small>{person.monthlyUsd > 0 ? `${formatPreciseUsd(person.monthlyUsd)} USD` : "원화 고정비"}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <small className="approval-footnote approval-person-cost-note">
          개인 할당 구독료 {formatWon(personCostSummary.personalMonthlyKrw)}을 기준으로 집계했습니다. 전사·공용·계약 비용 {formatWon(personCostSummary.sharedMonthlyKrw)}은 인당 평균에서 제외했습니다.
          {topPersonCost ? ` 최고 월 비용은 ${topPersonCost.name} ${formatWon(topPersonCost.monthlyKrw)}입니다.` : ""}
        </small>
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
                valueLabel={`${formatWon(tool.monthlyKrw)} · ${tool.monthlyUsd > 0 ? formatPreciseUsd(tool.monthlyUsd) : "원화 고정비"}`}
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
                <th>적용 시작</th>
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
                    <strong>{record.billingCurrency === "KRW" ? "원화 고정비" : formatPreciseUsd(record.monthlyUsd)}</strong>
                    <small>{formatWon(record.monthlyKrw)}</small>
                  </td>
                  <td>
                    <span className={`state-pill ${record.paymentMethod === "AI 전용 카드" ? "ok" : "neutral"}`}>
                      {record.paymentMethod}
                    </span>
                  </td>
                  <td>{record.startMonth ? monthLabel(record.startMonth) : "기존"}</td>
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

type IndividualSortKey = "productivity" | "code" | "prompts" | "tokens";

function AdoptionView({
  selectedMonth,
  onSelectedMonthChange,
}: {
  selectedMonth: string;
  onSelectedMonthChange: (month: string) => void;
}) {
  const data = individualUtilizationData;
  const [sortKey, setSortKey] = useState<IndividualSortKey>("productivity");
  const [query, setQuery] = useState("");
  const [selectedProfileEmail, setSelectedProfileEmail] = useState<string | null>(null);
  const periodLabel = fullMonthLabel(selectedMonth);
  const trendData = data.monthlyTrend.map((item) => ({
    ...item,
    totalTokens: data.monthlySpend[item.key]?.totals.totalTokens ?? null,
  }));
  const selectedMonthlySpend = data.monthlySpend[selectedMonth] ?? null;
  const coverageNote = selectedMonthlySpend
    ? `${selectedMonthlySpend.period}${selectedMonthlySpend.coverage === "partial" ? " · 부분 누적" : ""}`
    : "월별 Spend 미수집";

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return data.users
      .map((user) => {
        const evaluation = user.monthEvaluations[selectedMonth];
        const monthlySpend = selectedMonthlySpend?.users[user.email] ?? null;
        return { user, evaluation, monthlySpend };
      })
      .filter(({ user }) =>
        normalizedQuery.length === 0 ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.displayName.toLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) => {
        if (a.user.measurementStatus !== b.user.measurementStatus) {
          const statusRank = (user: IndividualUtilizationUser) => {
            if (user.measurementStatus === "measured") return 0;
            if (user.measurementStatus === "source-uncollected") return 1;
            return 2;
          };
          return statusRank(a.user) - statusRank(b.user);
        }
        const aEvaluation = a.evaluation;
        const bEvaluation = b.evaluation;
        const value = (row: typeof a) => {
          if (sortKey === "productivity") return row.evaluation?.productivityScore ?? 0;
          if (sortKey === "code") return row.evaluation?.codeLines ?? 0;
          if (sortKey === "prompts") return row.evaluation?.humanPrompts ?? 0;
          return row.monthlySpend?.totalTokens ?? 0;
        };
        return value(b) - value(a) ||
          (bEvaluation?.humanPrompts ?? 0) - (aEvaluation?.humanPrompts ?? 0) ||
          a.user.email.localeCompare(b.user.email);
      });
  }, [data.users, query, selectedMonth, selectedMonthlySpend, sortKey]);

  const measuredRowCount = rows.filter((row) => row.user.measurementStatus === "measured").length;
  const sharedAccountRowCount = rows.filter(
    (row) => row.user.measurementStatus === "shared-account-unmeasured",
  ).length;
  const sourceUncollectedRowCount = rows.filter(
    (row) => row.user.measurementStatus === "source-uncollected",
  ).length;

  const periodSummary = useMemo(
    () =>
      rows.reduce(
        (summary, row) => {
          const evaluation = row.evaluation;
          if (!evaluation) return summary;
          if (evaluation.conversations > 0 || evaluation.humanPrompts > 0 || (evaluation.codeLines ?? 0) > 0) {
            summary.activeUsers += 1;
          }
          summary.codeLines += evaluation.codeLines ?? 0;
          return summary;
        },
        {
          activeUsers: 0,
          codeLines: 0,
        },
      ),
    [rows],
  );

  const monthlySpendSummary = useMemo(() => {
    if (!selectedMonthlySpend) return null;
    const measuredSpendRows = rows.filter(
      (row) => row.user.measurementStatus === "measured" && row.monthlySpend,
    );
    if (measuredSpendRows.length === 0) return null;
    return measuredSpendRows.reduce(
      (summary, row) => {
        if (!row.monthlySpend) return summary;
        summary.requests += row.monthlySpend.requests;
        summary.totalTokens += row.monthlySpend.totalTokens;
        return summary;
      },
      { requests: 0, totalTokens: 0 },
    );
  }, [rows, selectedMonthlySpend]);

  const selectedProfile = selectedProfileEmail
    ? individualProfileDataByEmail[selectedProfileEmail] ?? null
    : null;

  if (selectedProfile) {
    const selectedUser = data.users.find((user) => user.email === selectedProfile.email);
    if (selectedUser) {
      return (
        <IndividualProfileView
          onBack={() => setSelectedProfileEmail(null)}
          profile={selectedProfile}
          selectedMonth={selectedMonth}
          user={selectedUser}
        />
      );
    }
  }

  return (
    <div className="content-grid individual-utilization-view">
      <section className="panel panel-wide individual-control-panel">
        <div className="individual-period-copy">
          <span className="eyebrow">Period Analysis</span>
          <div className="individual-period-title">
            <h2>{periodLabel} 개인별 활용 평가</h2>
            <span className="state-pill warning">{coverageNote}</span>
          </div>
          <p>
            대화 Export의 프롬프트·활성일과 월별 Code Lines를 결합하며, Claude Code 상세 미수집은 0으로 처리하지 않습니다.
          </p>
        </div>
        <div className="individual-controls">
          <label className="individual-select-control">
            <span>기간</span>
            <select
              aria-label="분석 기간"
              value={selectedMonth}
              onChange={(event) => onSelectedMonthChange(event.target.value)}
            >
              {data.months.map((key) => (
                <option key={key} value={key}>
                  {fullMonthLabel(key)}
                </option>
              ))}
            </select>
          </label>
          <label className="individual-select-control">
            <span>정렬</span>
            <select
              aria-label="개인별 활용 정렬"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as IndividualSortKey)}
            >
              <option value="productivity">생산성 신호</option>
              <option value="code">Code Lines</option>
              <option value="prompts">프롬프트</option>
              <option value="tokens">월 누적 토큰</option>
            </select>
          </label>
          <label className="individual-search-control">
            <Search size={16} />
            <input
              aria-label="이름 또는 계정 검색"
              placeholder="이름 또는 계정 검색"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="individual-period-summary" aria-label={`${periodLabel} 핵심 활용 지표`}>
        <article>
          <span><UserCheck size={17} />활동 사용자</span>
          <strong>{periodSummary.activeUsers}명</strong>
          <small>
            {sharedAccountRowCount > 0 || sourceUncollectedRowCount > 0
              ? `측정 ${measuredRowCount}명 · 공통 계정 ${sharedAccountRowCount}명 · 미수집 ${sourceUncollectedRowCount}명`
              : `관측 ${measuredRowCount}명 중`}
          </small>
        </article>
        <article>
          <span><Bot size={17} />월 누적 요청</span>
          <strong>{monthlySpendSummary ? `${numberFormat.format(monthlySpendSummary.requests)}건` : "미수집"}</strong>
          <small>{coverageNote}</small>
        </article>
        <article>
          <span><FileText size={17} />Code Lines</span>
          <strong>{numberFormat.format(periodSummary.codeLines)}줄</strong>
          <small>사용자별 월 합계</small>
        </article>
        <article>
          <span><Activity size={17} />월 누적 토큰</span>
          <strong>{monthlySpendSummary ? formatTokens(monthlySpendSummary.totalTokens) : "미수집"}</strong>
          <small>{coverageNote}</small>
        </article>
      </section>

      <section className="panel panel-wide individual-trend-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Utilization Trend</span>
            <h2>월별 Code Lines와 토큰 사용량 추이</h2>
          </div>
          <span className="state-pill neutral">{data.months.length}개월</span>
        </div>
        <div className="chart-frame individual-trend-chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="code"
                tickFormatter={(value) => formatTokens(Number(value))}
                tickLine={false}
                axisLine={false}
                width={62}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="tokens"
                orientation="right"
                tickFormatter={(value) => formatTokens(Number(value))}
                tickLine={false}
                axisLine={false}
                width={62}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "Code Lines"
                    ? `${numberFormat.format(Number(value))}줄`
                    : `${formatTokens(Number(value))} 토큰`,
                  name,
                ]}
              />
              <Legend />
              <Bar yAxisId="code" dataKey="codeLines" name="Code Lines" fill="#0f8b8d" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="tokens"
                dataKey="totalTokens"
                name="월 누적 토큰"
                stroke="#e85d4f"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel panel-wide individual-table-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Individual Scorecard</span>
            <h2>{periodLabel} 개인별 활용·생산성 평가</h2>
          </div>
          <span className="state-pill neutral">{rows.length}명</span>
        </div>
        <div className="table-wrap individual-utilization-table">
          <table>
            <thead>
              <tr>
                <th>순위</th>
                <th>사용자</th>
                <th>생산성 신호</th>
                <th>대화 프롬프트</th>
                <th>대화 활성일</th>
                <th>Code Lines</th>
                <th>월 누적 사용량</th>
                <th>주요 사용 범위</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ user, evaluation, monthlySpend }, index) => {
                const metricsMeasured = user.measurementStatus === "measured";
                const metricsUncollected = !metricsMeasured;
                const productivityScore = evaluation?.productivityScore ?? 0;
                const productivityLevel = evaluation?.productivityLevel ?? "unobserved";
                return (
                  <tr key={user.email}>
                    <td><span className="individual-rank">{index + 1}</span></td>
                    <td>
                      {individualProfileDataByEmail[user.email] ? (
                        <button
                          aria-label={`${user.displayName} 개인 상세 보기`}
                          className="individual-user-link"
                          onClick={() => setSelectedProfileEmail(user.email)}
                          type="button"
                        >
                          <span>
                            <strong>{user.displayName}</strong>
                            {user.displayAccount && <small>{user.displayAccount}</small>}
                          </span>
                          <ChevronRight size={17} />
                        </button>
                      ) : (
                        <>
                          <strong>{user.displayName}</strong>
                          {user.displayAccount && <small>{user.displayAccount}</small>}
                        </>
                      )}
                    </td>
                    <td>
                      {metricsMeasured ? (
                        <IndividualScoreBadge
                          level={productivityLevel}
                          score={productivityScore}
                        />
                      ) : metricsUncollected ? <span className="state-pill neutral">미수집</span> : null}
                    </td>
                    <td>
                      {metricsMeasured ? (
                        <IndividualActivityCoverageCell
                          detailsMissing={evaluation?.codeActivityDetailsMissing ?? false}
                          unit="건"
                          value={evaluation?.humanPrompts ?? 0}
                        />
                      ) : metricsUncollected ? <span className="state-pill neutral">미수집</span> : null}
                    </td>
                    <td>
                      {metricsMeasured ? (
                        <IndividualActivityCoverageCell
                          detailsMissing={evaluation?.codeActivityDetailsMissing ?? false}
                          unit="일"
                          value={evaluation?.activeDays ?? 0}
                        />
                      ) : metricsUncollected ? <span className="state-pill neutral">미수집</span> : null}
                    </td>
                    <td>
                      {metricsMeasured ? (
                        evaluation?.codeLines == null
                          ? <span className="state-pill neutral">월 단위</span>
                          : `${numberFormat.format(evaluation.codeLines)}줄`
                      ) : metricsUncollected ? <span className="state-pill neutral">미수집</span> : null}
                    </td>
                    <td>
                      {metricsMeasured ? (monthlySpend ? (
                        <>
                          <strong>{formatTokens(monthlySpend.totalTokens)}</strong>
                          <small>{numberFormat.format(monthlySpend.requests)}요청 · {formatPreciseUsd(monthlySpend.netSpendUsd)}</small>
                        </>
                      ) : (
                        <span className="state-pill neutral">월별 Spend 미수집</span>
                      )) : metricsUncollected ? <span className="state-pill neutral">미수집</span> : null}
                    </td>
                    <td>
                      {user.usageScopeOverride ? (
                        <p className="individual-shared-account-scope">{user.usageScopeOverride}</p>
                      ) : (
                        <div className="individual-usage-scope">
                          <div>
                            <span>제품</span>
                            <p>{user.products.join(" · ") || "-"}</p>
                          </div>
                          <div>
                            <span>모델</span>
                            <p>{user.models.join(" · ") || "-"}</p>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="individual-methodology-band" aria-label="개인별 활용 평가 기준">
        <div>
          <span className="eyebrow">Methodology</span>
          <h2>평가 기준과 해석 범위</h2>
        </div>
        <dl>
          <div>
            <dt>활용지수</dt>
            <dd>{data.methodology.activity}</dd>
          </div>
          <div>
            <dt>생산성 신호</dt>
            <dd>{data.methodology.productivity}</dd>
          </div>
          <div>
            <dt>한계</dt>
            <dd>{data.methodology.caveat}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function IndividualProfileView({
  onBack,
  profile,
  selectedMonth,
  user,
}: {
  onBack: () => void;
  profile: IndividualProfileData;
  selectedMonth: string;
  user: IndividualUtilizationUser;
}) {
  const evaluation = user.monthEvaluations[selectedMonth];
  const monthlySpend = individualUtilizationData.monthlySpend[selectedMonth]?.users[user.email] ?? null;
  const approvalRecords = initialAiToolApprovalData.records.filter((record) =>
    record.owner.startsWith(profile.approvalOwner),
  );
  const monthlyFixedKrw = approvalRecords.reduce((sum, record) => sum + record.monthlyKrw, 0);
  const monthlyFixedUsd = approvalRecords.reduce((sum, record) => sum + record.monthlyUsd, 0);
  const metricsMeasured = user.measurementStatus === "measured";
  const activityMetricLabel = profile.drive.activityMetricLabel ?? "Drive 프롬프트";
  const activityMetricDetail = profile.drive.activityMetricDetail ??
    `응답 연결 ${numberFormat.format(profile.drive.pairedSessions)}건`;
  const trendTitle = profile.drive.trendTitle ?? "Drive 프롬프트 일별 추이";
  const trendSeriesLabel = profile.drive.trendSeriesLabel ?? "프롬프트";
  const outputMetricLabel = profile.drive.outputMetricLabel ?? "결과·지원 파일";
  const outputMetricValue = profile.drive.outputMetricValue ?? profile.drive.outputAndSupportFiles;
  const outputMetricDetail = profile.drive.outputMetricDetail ??
    `${profile.drive.fileTotalLabel ?? (profile.attributionMode === "shared" ? "통합 분석 대상" : "전체 저장")} ${numberFormat.format(profile.drive.fileCount)}개 중`;
  const sourceLinks = profile.sourceLinks ?? [
    { label: "Drive 원천", url: profile.drive.folderUrl },
  ];
  const maxTopicCount = Math.max(...profile.promptTopics.map((topic) => topic.count), 1);
  const maxFileCount = Math.max(...profile.fileBreakdown.map((item) => item.count), 1);
  const recentPromptTrend = profile.dailyPromptCounts.map((item) => ({
    ...item,
    label: item.date.slice(5).replace("-", "/"),
  }));

  return (
    <div className="content-grid individual-profile-view">
      <section className="individual-profile-header">
        <button className="individual-profile-back" onClick={onBack} type="button">
          <ArrowLeft size={18} />
          개인별 활용 목록
        </button>
        <div>
          <span className="eyebrow">Individual Cost & Output</span>
          <h2>{profile.displayName}</h2>
          <p>{profile.department} · {profile.accountLabel ?? profile.email}</p>
          {profile.attributionMode === "shared" && (
            <span className="state-pill warning">
              {profile.attributionLabel ?? "공통 계정 기준 · 개인 기여 미분리"}
            </span>
          )}
        </div>
        <div className="individual-profile-drive-links">
          {sourceLinks.map((source) => (
            <a
              className="individual-profile-drive-link"
              href={source.url}
              key={source.url}
              rel="noreferrer"
              target="_blank"
            >
              {source.label}
              <ExternalLink size={16} />
            </a>
          ))}
        </div>
      </section>

      <section className="individual-profile-kpis" aria-label={`${profile.displayName} 비용 및 결과 핵심 지표`}>
        <article>
          <span><CircleDollarSign size={17} />월 고정 투입비</span>
          <strong>{formatWon(monthlyFixedKrw)}</strong>
          <small>{approvalRecords.length}개 구독 · {formatPreciseUsd(monthlyFixedUsd)}</small>
        </article>
        <article>
          <span><Bot size={17} />{activityMetricLabel}</span>
          <strong>{numberFormat.format(profile.drive.promptFiles)}건</strong>
          <small>{activityMetricDetail}</small>
        </article>
        <article>
          <span><FileText size={17} />{outputMetricLabel}</span>
          <strong>{numberFormat.format(outputMetricValue)}개</strong>
          <small>{outputMetricDetail}</small>
        </article>
        <article>
          <span><Gauge size={17} />{fullMonthLabel(selectedMonth)} 생산성</span>
          <strong>{metricsMeasured ? `${evaluation?.productivityScore ?? 0}점` : "개인 미측정"}</strong>
          <small>
            {metricsMeasured
              ? `${individualLevelLabel(evaluation?.productivityLevel ?? "unobserved")} · Code ${numberFormat.format(evaluation?.codeLines ?? 0)}줄`
              : (profile.measurementNote ?? "공통 계정 자료로 개인별 활동을 분리할 수 없습니다.")}
          </small>
        </article>
      </section>

      <section className="panel panel-large individual-profile-cost-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Investment</span>
            <h2>월 투입 비용</h2>
          </div>
          <span className="state-pill ok">합계 {formatWon(monthlyFixedKrw)}</span>
        </div>
        <div className="table-wrap individual-profile-cost-table">
          <table>
            <thead>
              <tr>
                <th>도구</th>
                <th>계정</th>
                <th>월 비용</th>
              </tr>
            </thead>
            <tbody>
              {approvalRecords.map((record) => (
                <tr key={`${record.category}-${record.account}`}>
                  <td>
                    <strong>{record.tool}</strong>
                    <small>{record.category}</small>
                  </td>
                  <td>{record.account}</td>
                  <td>
                    <strong>{formatWon(record.monthlyKrw)}</strong>
                    <small>{formatPreciseUsd(record.monthlyUsd)}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <small className="approval-footnote">
          {profile.costBasisNote ?? "AI 도구 결재 현황의 현재 월 고정 구독료이며 API 변동비는 개인에게 배분하지 않았습니다."}
        </small>
      </section>

      <section className="panel individual-profile-usage-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Usage Signal</span>
            <h2>{fullMonthLabel(selectedMonth)} 개인 활동</h2>
          </div>
        </div>
        <dl className="individual-profile-usage-list">
          <div><dt>월 누적 요청</dt><dd>{metricsMeasured ? (monthlySpend ? `${numberFormat.format(monthlySpend.requests)}건` : "미수집") : "개인 미측정"}</dd></div>
          <div><dt>월 누적 토큰</dt><dd>{metricsMeasured ? (monthlySpend ? formatTokens(monthlySpend.totalTokens) : "미수집") : "개인 미측정"}</dd></div>
          <div><dt>대화 프롬프트</dt><dd>{metricsMeasured ? `${numberFormat.format(evaluation?.humanPrompts ?? 0)}건` : "개인 미측정"}</dd></div>
          <div><dt>Code Lines</dt><dd>{metricsMeasured ? `${numberFormat.format(evaluation?.codeLines ?? 0)}줄` : "개인 미측정"}</dd></div>
        </dl>
      </section>

      <section className="panel panel-wide individual-profile-trend-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Prompt Activity</span>
            <h2>{trendTitle}</h2>
          </div>
          <div className="panel-header-side">
            {profile.monthlyPromptCounts.map((item) => (
              <span className="state-pill neutral" key={item.month}>{monthLabel(item.month)} {item.prompts}건</span>
            ))}
          </div>
        </div>
        <div className="chart-frame individual-profile-trend-chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={recentPromptTrend} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" interval={3} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
              <Tooltip formatter={(value) => [`${numberFormat.format(Number(value))}건`, trendSeriesLabel]} />
              <Bar dataKey="prompts" name={trendSeriesLabel} fill="#0f8b8d" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel panel-wide individual-profile-topic-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Prompt Mix</span>
            <h2>{profile.drive.topicTitle ?? "대화·프롬프트 업무 영역"}</h2>
          </div>
          <span className="state-pill neutral">
            {profile.drive.topicBasisLabel ?? `본문 분석 ${profile.drive.promptFiles}건`}
          </span>
        </div>
        <div className="individual-profile-topic-grid">
          {profile.promptTopics.map((topic) => (
            <article key={topic.label}>
              <div className="individual-profile-topic-head">
                <span className="category-dot" style={{ background: topic.color }} />
                <strong>{topic.label}</strong>
                <b>{numberFormat.format(topic.count)}건</b>
              </div>
              <div className="individual-profile-topic-meter"><span style={{ width: `${(topic.count / maxTopicCount) * 100}%`, background: topic.color }} /></div>
              <p>{topic.description}</p>
              <small>{topic.examples.join(" · ")}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel panel-large individual-profile-file-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Drive Inventory</span>
            <h2>저장 파일 구성</h2>
          </div>
          <span className="state-pill ok">
            {profile.drive.analyzedFileCount
              ? `분석 ${numberFormat.format(profile.drive.analyzedFileCount)}개 · Drive ${numberFormat.format(profile.drive.fileCount)}개`
              : `전체 ${numberFormat.format(profile.drive.fileCount)}개`}
          </span>
        </div>
        <div className="approval-meter-list">
          {profile.fileBreakdown.map((item) => (
            <MeterRow
              color={item.color}
              key={item.label}
              label={item.label}
              value={(item.count / maxFileCount) * 100}
              valueLabel={`${numberFormat.format(item.count)}개 · ${item.description}`}
            />
          ))}
        </div>
      </section>

      <section className="panel individual-profile-highlight-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Output Highlights</span>
            <h2>대표 결과물</h2>
          </div>
        </div>
        <div className="individual-profile-highlight-list">
          {profile.highlights.map((item, index) => (
            <article key={item.title}>
              <span>{index + 1}</span>
              <div>
                <small>{item.category}</small>
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
                <b>{item.result}</b>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel panel-wide individual-profile-source-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Source Coverage</span>
            <h2>수집 범위와 해석</h2>
          </div>
          <span className="state-pill ok">오류 {profile.drive.scanErrors}건</span>
        </div>
        <div className="individual-profile-source-grid">
          <div>
            <strong>{profile.drive.folderName}</strong>
            <span>{profile.drive.period} · {profile.drive.collectedAt}</span>
            <span>
              원천 폴더 {numberFormat.format(profile.drive.rootFolderCount ?? 1)}개 · 하위 폴더 {numberFormat.format(profile.drive.childFolderCount)}개 · 조회 폴더 {numberFormat.format(profile.drive.scannedFolderCount)}개
            </span>
          </div>
          <ul>
            {profile.notes.map((note) => <li key={note}>{note}</li>)}
          </ul>
        </div>
      </section>
    </div>
  );
}

function IndividualScoreBadge({
  level,
  score,
}: {
  level: IndividualEvaluationLevel;
  score: number;
}) {
  return (
    <div className="individual-score-badge">
      <span className={`state-pill ${individualLevelTone(level)}`}>
        {individualLevelLabel(level)}
      </span>
      <div className="individual-score-meter" aria-label={`${individualLevelLabel(level)} ${score}점`}>
        <span style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }} />
      </div>
      <small>{score}점</small>
    </div>
  );
}

function IndividualActivityCoverageCell({
  detailsMissing,
  unit,
  value,
}: {
  detailsMissing: boolean;
  unit: "건" | "일";
  value: number;
}) {
  if (!detailsMissing) return <>{numberFormat.format(value)}{unit}</>;

  return (
    <div className="individual-coverage-cell">
      <strong>{value > 0 ? `${numberFormat.format(value)}${unit}` : "미수집"}</strong>
      <small>Claude Code 미포함</small>
    </div>
  );
}

function LegacyAdoptionView({
  claudeTeamUsageData,
  gensparkUsageData,
  workspaceUsageData,
}: {
  claudeTeamUsageData: ClaudeTeamUsageData;
  gensparkUsageData: GensparkUsageData;
  workspaceUsageData: GeminiWorkspaceUsageData;
}) {
  const claudeExport = gensparkUsageData.chatGptExport;
  const peakGeminiDay = [...workspaceUsageData.dailyUsage].sort((a, b) => b.events - a.events)[0];
  const claudeTopProduct = claudeTeamUsageData.productUsage[0];
  const claudeTopModel = claudeTeamUsageData.modelUsage[0];
  const maxClaudeSpend = Math.max(...claudeTeamUsageData.users.map((user) => user.netSpendUsd), 1);
  const maxClaudeLines = Math.max(...claudeTeamUsageData.users.map((user) => user.codeLines), 1);
  const hasClaudeCodeLines = claudeTeamUsageData.totalCodeLines > 0;
  const claudeUsersByTokens = [...claudeTeamUsageData.users].sort(
    (a, b) => b.totalTokens - a.totalTokens || b.requests - a.requests || a.email.localeCompare(b.email),
  );
  const claudeProductivitySignals = buildClaudeProductivitySignals(claudeTeamUsageData.users);
  const claudeTopUser = [...claudeTeamUsageData.users].sort((a, b) =>
    hasClaudeCodeLines ? b.codeLines - a.codeLines : b.netSpendUsd - a.netSpendUsd,
  )[0];
  const serviceCards: Array<{
    name: string;
    source: string;
    status: string;
    statusTone: string;
    value: string;
    metric: string;
    color: string;
    icon: ReactNode;
  }> = [
    {
      name: "ChatGPT",
      source: "ChatGPT Export",
      status: "수집",
      statusTone: "ok",
      value: `${numberFormat.format(chatGptUsageData.totalConversations)}개`,
      metric: "대화 기록",
      color: "#10a37f",
      icon: <Bot size={18} />,
    },
    {
      name: "Gemini",
      source: "Workspace Audit",
      status: workspaceUsageData.source.status,
      statusTone: apiStatusTone(workspaceUsageData.source.status),
      value: `${numberFormat.format(workspaceUsageData.totalEvents)}건`,
      metric: "Workspace 이벤트",
      color: "#0f8b8d",
      icon: <Sparkles size={18} />,
    },
    {
      name: "Claude Export",
      source: "JSON Export",
      status: claudeExport ? "수집" : "대기",
      statusTone: claudeExport ? "ok" : "warning",
      value: `${numberFormat.format(claudeExport?.totalConversations ?? 0)}개`,
      metric: "대화 기록",
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
      color: "#5f6f8c",
      icon: <LineChart size={18} />,
    },
    {
      name: "Gamma",
      source: "Drive 산출물",
      status: gammaDriveUsageData.source.status,
      statusTone: "ok",
      value: `${numberFormat.format(gammaDriveUsageData.artifactCount)}개`,
      metric: "Gamma 산출물",
      color: "#2f8f46",
      icon: <Activity size={18} />,
    },
  ];
  return (
    <div className="content-grid adoption-view">
      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Service Portfolio</span>
            <h2>서비스 채택 및 연결 현황</h2>
          </div>
          <span className="state-pill neutral">{numberFormat.format(serviceCards.length)}종 관리</span>
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
            </article>
          ))}
        </div>
      </section>

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Gemini Workspace</span>
            <h2>Gemini Workspace 활동 추이</h2>
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
            <h2>Gemini 앱별 사용</h2>
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

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Claude Team Plan</span>
            <h2>Claude Team 좌석 및 사용 강도</h2>
          </div>
          <span className="state-pill neutral">{claudeTeamUsageData.source.period}</span>
        </div>
        <div className="api-summary-panel claude-team-summary-panel">
          <article className="api-summary-item">
            <span>활성 사용자</span>
            <strong>{numberFormat.format(claudeTeamUsageData.activeUsers)}명</strong>
            <span>결재 등록 {numberFormat.format(claudeTeamUsageData.licensedUsers)}명 · 현재 Active {numberFormat.format(claudeTeamUsageData.activeUsers)}명</span>
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
            <h2>Claude Team 계정별 운영 현황</h2>
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
                <th>생산성 신호</th>
                <th>Spend</th>
                <th>요청</th>
                <th aria-sort="descending">토큰</th>
                <th>{hasClaudeCodeLines ? "Code Lines" : "Code Lines 원천"}</th>
                <th>제품/모델</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {claudeUsersByTokens.map((user) => {
                const productivitySignal = claudeProductivitySignals.get(user.email);
                return (
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
                      <span
                        className={`state-pill ${claudeProductivityTone(productivitySignal?.level)}`}
                        title={productivitySignal?.detail}
                      >
                        {productivitySignal?.label ?? "산정 대기"}
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
                      <strong>{user.products.length > 0 ? user.products.join(", ") : "사용 이력 없음"}</strong>
                      <small>{user.models.length > 0 ? user.models.join(", ") : "집계 기간 기준"}</small>
                    </td>
                    <td>{user.note}</td>
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

function ApiUsageView({
  apiUsageData,
  fixedApiServiceRecords,
}: {
  apiUsageData: ApiUsageData;
  fixedApiServiceRecords: AiToolApprovalRecord[];
}) {
  const totalCost = apiUsageData.providers.reduce((sum, item) => sum + item.costUsd, 0);
  const totalTokens = apiUsageData.providers.reduce((sum, item) => sum + item.inputTokens + item.outputTokens, 0);
  const fixedApiMonthlyKrw = fixedApiServiceRecords.reduce((sum, item) => sum + item.monthlyKrw, 0);
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
        {fixedApiServiceRecords.length > 0 && (
          <div className="insight-box">
            <WalletCards size={18} />
            <div>
              <strong>GH AI Agent 개발 API 계약 고정비 {formatManWon(fixedApiMonthlyKrw)}/월</strong>
              <span>플랫폼개발팀 · 2026년 8월부터 · 위 공급자별 실측 API 변동비와 별도 집계</span>
            </div>
          </div>
        )}
      </section>

      <section className="panel panel-wide api-summary-panel">
        <div className="api-summary-item">
          <span>총 토큰</span>
          <strong>{formatTokens(totalTokens)}</strong>
        </div>
        <div className="api-summary-item">
          <span>실측 변동비</span>
          <strong>{formatUsd(totalCost)}</strong>
        </div>
        <div className="api-summary-item">
          <span>계약 고정비</span>
          <strong>{formatWon(fixedApiMonthlyKrw)}</strong>
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

function fullMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return Number.isFinite(year) && Number.isFinite(monthNumber) ? `${year}년 ${monthNumber}월` : month;
}

function individualLevelLabel(level: IndividualEvaluationLevel) {
  if (level === "leading") return "선도";
  if (level === "active") return "활발";
  if (level === "growing") return "성장";
  if (level === "early") return "초기";
  return "관찰 없음";
}

function individualLevelTone(level: IndividualEvaluationLevel) {
  return `individual-${level}`;
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

function claudeProductivityTone(level?: ClaudeProductivityLevel) {
  if (level === "top" || level === "efficient") return "ok";
  if (level === "insufficient") return "warning";
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
