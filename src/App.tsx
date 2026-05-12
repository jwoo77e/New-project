import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Bot,
  Building2,
  CalendarRange,
  CircleDollarSign,
  Cpu,
  Download,
  FileSpreadsheet,
  Gauge,
  KeyRound,
  LineChart,
  PieChart as PieChartIcon,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
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

type ViewKey = "monthly" | "adoption" | "genspark" | "department" | "detail" | "api";

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
const VIEW_ROTATION_INTERVAL_MS = 20000;
const viewRotationOrder: ViewKey[] = ["adoption", "genspark", "monthly", "department", "detail", "api"];
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

function forecastMethodLabel(monthlyActuals: MonthlyActual[]) {
  return `${monthRangeLabel(monthlyActuals)} 월별 실적 단순 선형 추세`;
}

function buildOperatingPlanForecast(
  month: string,
  apiForecastSelection: ApiMonthForecastSelection,
): OperatingPlanForecast {
  if (month < OPERATING_PLAN_START_MONTH) {
    return {
      applies: false,
      subscriptionUsd: 0,
      subscriptionKrw: 0,
      apiKrw: 0,
      apiSource: "none",
      apiSourceLabel: "운영계획 미적용",
      totalKrw: 0,
    };
  }

  const subscriptionUsd = operatingPlanSubscriptions.reduce((sum, item) => sum + item.quantity * item.unitUsd, 0);
  const subscriptionKrw = Math.round(subscriptionUsd * OPERATING_PLAN_USD_TO_KRW);
  const apiKrw = apiForecastSelection.costKrw;

  return {
    applies: true,
    subscriptionUsd,
    subscriptionKrw,
    apiKrw,
    apiSource: apiForecastSelection.source,
    apiSourceLabel: apiForecastSelection.sourceLabel,
    totalKrw: subscriptionKrw + apiKrw,
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

  useEffect(() => {
    const rotationTimer = window.setInterval(() => {
      setActiveView((currentView) => {
        const currentIndex = viewRotationOrder.indexOf(currentView);
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % viewRotationOrder.length;
        return viewRotationOrder[nextIndex];
      });
    }, VIEW_ROTATION_INTERVAL_MS);

    return () => window.clearInterval(rotationTimer);
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
  const forecastTotal = forecast.reduce((sum, item) => sum + item.amount, 0);
  const forecastBasisTotal = forecastBasisActuals.reduce((sum, item) => sum + item.amount, 0);
  const lastActual = monthlyActuals[monthlyActuals.length - 1];
  const previousActual = monthlyActuals[monthlyActuals.length - 2];
  const lastMoM =
    previousActual && previousActual.amount > 0
      ? ((lastActual.amount - previousActual.amount) / previousActual.amount) * 100
      : 0;
  const overFixedPlan = sourceMeta.totalActual - sourceMeta.expectedQuarterFixed;
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
  const workspaceListedUsers = workspaceUsageData.listedUsers ?? workspaceUsageData.users.length;
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
  const operatingPlanSubscriptionUsd = operatingPlanSubscriptions.reduce(
    (sum, item) => sum + item.quantity * item.unitUsd,
    0,
  );
  const operatingPlanSubscriptionKrw = Math.round(operatingPlanSubscriptionUsd * OPERATING_PLAN_USD_TO_KRW);
  const operatingPlanSubscriptionSummary = operatingPlanSubscriptions
    .map((item) => `${item.label} ${item.quantity}`)
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
        const operatingPlan = buildOperatingPlanForecast(item.month, apiSelection);
        const apiUsageKrw = operatingPlan.applies
          ? operatingPlan.apiKrw
          : apiSelection.source === "budget"
            ? 0
            : apiSelection.costKrw;
        const baseForecastKrw = operatingPlan.applies ? operatingPlan.subscriptionKrw : item.amount;

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
  const operatingPlanForecastTotal = apiAdjustedForecast.reduce((sum, item) => sum + item.operatingPlanKrw, 0);
  const operatingPlanMonths = apiAdjustedForecast.filter((item) => item.isOperatingPlan).length;
  const apiAdjustedForecastGrowth =
    forecastBasisTotal > 0 ? ((apiAdjustedForecastTotal - forecastBasisTotal) / forecastBasisTotal) * 100 : 0;

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
      fixedPlan: sourceMeta.expectedMonthlyFixed,
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
      const operatingPlan = buildOperatingPlanForecast(item.month, apiSelection);
      const apiUsageKrw = operatingPlan.applies
        ? operatingPlan.apiKrw
        : apiSelection.source === "budget"
          ? 0
          : apiSelection.costKrw;

      return {
        label: item.label,
        actual: null,
        forecast: operatingPlan.applies ? null : item.amount,
        operatingPlanForecast: operatingPlan.applies ? operatingPlan.subscriptionKrw : null,
        apiUsageForecast: apiUsageKrw,
        apiSourceLabel: apiSelection.sourceLabel,
        forecastWithApi: operatingPlan.applies ? operatingPlan.totalKrw : item.amount + apiUsageKrw,
        forecastBasis: null,
        adjustment: null,
        fixedPlan: operatingPlan.applies ? operatingPlan.totalKrw : sourceMeta.expectedMonthlyFixed,
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
      apiForecast,
      apiAdjustedForecast,
      operatingPlan: {
        startMonth: OPERATING_PLAN_START_MONTH,
        subscriptions: operatingPlanSubscriptions,
        subscriptionUsd: operatingPlanSubscriptionUsd,
        subscriptionKrw: operatingPlanSubscriptionKrw,
        apiBudgetKrw: OPERATING_PLAN_API_BUDGET_KRW,
        apiForecastKrw: operatingPlanApiKrw,
        apiForecastSource: operatingPlanApiSourceLabel,
        usdToKrwRate: OPERATING_PLAN_USD_TO_KRW,
        forecastTotalKrw: operatingPlanForecastTotal,
      },
      generatedAt: new Date().toISOString(),
      forecastMethod: `${forecastMethodLabel(forecastBasisActuals)} - 5월 이후는 정액제 운영계획 구독 기준과 실측 API 월환산 비용으로 대체`,
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
          className={activeView === "monthly" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("monthly")}
        >
          <LineChart size={17} />
          월별/예측
        </button>
        <button
          className={activeView === "department" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("department")}
        >
          <Building2 size={17} />
          부서별
        </button>
        <button
          className={activeView === "detail" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("detail")}
        >
          <PieChartIcon size={17} />
          상세
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
      ) : activeView === "adoption" ? (
        <section className="metric-grid" aria-label="Gemini Workspace 활용 핵심 지표">
          <MetricCard
            icon={<UserCheck size={21} />}
            label={`${workspaceUsageData.source.period} 활성 사용자`}
            tone="teal"
            value={`${numberFormat.format(workspaceUsageData.activeUsers)}명`}
            footer={`대상자 ${numberFormat.format(workspaceListedUsers)}명 · ${workspaceUsageData.source.status}`}
          />
          <MetricCard
            icon={<Gauge size={21} />}
            label="활성화율"
            tone="green"
            value={formatRate(workspaceUsageData.activationRate)}
            footer={`평균 활성일 ${workspaceUsageData.avgActiveDays.toFixed(1)}일`}
          />
          <MetricCard
            icon={<Activity size={21} />}
            label="Workspace Gemini 이벤트"
            tone="amber"
            value={numberFormat.format(workspaceUsageData.totalEvents)}
            footer="현재 대상자 기준"
          />
          <MetricCard
            icon={<Users size={21} />}
            label="미활용 계정"
            tone="steel"
            value={`${numberFormat.format(workspaceUsageData.zeroUsers)}명`}
            footer={`High ${workspaceUsageData.highUsers} · Medium ${workspaceUsageData.mediumUsers} · Low ${workspaceUsageData.lowUsers}`}
          />
        </section>
      ) : activeView === "genspark" ? (
        <section className="metric-grid" aria-label="AI 활용 상세 분석 핵심 지표">
          <MetricCard
            icon={<Sparkles size={21} />}
            label="분석 대상 작업"
            tone="teal"
            value={`${numberFormat.format(initialGensparkUsageData.totalTasks)}건`}
            footer={`${initialGensparkUsageData.source.period} · ${initialGensparkUsageData.source.collectedAt} 수집`}
          />
          <MetricCard
            icon={<Search size={21} />}
            label="정밀 분석 완료"
            tone="green"
            value={`${numberFormat.format(initialGensparkUsageData.detailedTasks)}건`}
            footer={`메타 기반 ${numberFormat.format(initialGensparkUsageData.metadataOnlyTasks)}건 보강`}
          />
          <MetricCard
            icon={<FileSpreadsheet size={21} />}
            label="제안서 자동화"
            tone="amber"
            value={`${numberFormat.format(initialGensparkUsageData.proposalAutomationTasks)}건`}
            footer="공공기관·지자체 스마트 안전관리 제안 중심"
          />
          <MetricCard
            icon={<LineChart size={21} />}
            label="AI 슬라이드 활용"
            tone="steel"
            value="약 80건"
            footer="제안서·발표자료·로드맵 제작의 주력 도구"
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
            label={`${forecastRange} API/구독 반영 예측`}
            tone="amber"
            value={formatManWon(apiAdjustedForecastTotal)}
            footer={`5월 이후 운영계획 ${formatManWon(operatingPlanSubscriptionKrw)}/월 · ${operatingPlanApiSourceLabel} ${formatManWon(operatingPlanApiKrw)}/월`}
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
          overFixedPlan={overFixedPlan}
          forecastTotal={forecastTotal}
          sourceMeta={sourceMeta}
          monthlyActuals={monthlyActuals}
        />
      )}

      {activeView === "adoption" && <AdoptionView workspaceUsageData={workspaceUsageData} />}

      {activeView === "genspark" && <GensparkUsageView usageData={initialGensparkUsageData} />}

      {activeView === "department" && (
        <DepartmentView
          commonDepartmentShare={commonDepartmentShare}
          commonDepartmentTotal={commonDepartment.total}
          departmentCosts={departmentCosts}
          monthlyActuals={monthlyActuals}
          sourceMeta={sourceMeta}
        />
      )}

      {activeView === "detail" && (
        <DetailView
          categoryCosts={categoryCosts}
          filteredTransactions={filteredTransactions}
          query={query}
          setQuery={setQuery}
          vendorCosts={vendorCosts}
        />
      )}

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
  forecastTotal,
  monthlyActuals,
  monthlySeries,
  overFixedPlan,
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
  forecastTotal: number;
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
  overFixedPlan: number;
  sourceMeta: SourceMeta;
}) {
  const actualRange = monthRangeLabel(monthlyActuals);
  const forecastRange = monthRangeLabel(forecast);
  const adjustmentTotal = forecastAdjustments.reduce((sum, item) => sum + item.amount, 0);
  const apiForecastProviderSummary = formatApiForecastProviderSummary(apiForecast);

  return (
    <div className="content-grid monthly-view">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Monthly Spend</span>
            <h2>월별 비용과 {forecastRange} 예측</h2>
          </div>
          <span className="state-pill warning">선형 추세 예측</span>
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
                name="운영계획 구독"
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
                name="API/구독 반영 예측"
                stroke="#2f8f46"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                dataKey="forecastBasis"
                name="예측 기준"
                stroke="#e85d4f"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                dataKey="fixedPlan"
                name="월정액 기준"
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
                <small>예측 기준 {formatManWon(basis?.amount ?? item.amount)}</small>
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
                    운영계획 구독 {formatManWon(item.operatingPlanKrw)} · {item.apiSourceLabel}{" "}
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
              {forecastRange} API/구독 반영 합계 {formatManWon(apiAdjustedForecastTotal)}
            </strong>
            <span>
              {OPERATING_PLAN_START_MONTH}부터는 기존 선형 예측에 증감분을 더하지 않고, 정액제 운영계획 구독{" "}
              {formatManWon(operatingPlanSubscriptionKrw)}과 월별 API 실측 우선 비용을 기준으로 계산합니다.
            </span>
            <span>
              API 반영분 {formatManWon(apiForecastAddedTotal)} · 운영계획 구독 반영분{" "}
              {formatManWon(operatingPlanForecastTotal)} · 운영계획 적용월 {operatingPlanMonths}개월 · 보정 기준 대비{" "}
              {formatRate(apiAdjustedForecastGrowth, true)}
            </span>
            <span>
              운영계획 구독 {formatPreciseUsd(operatingPlanSubscriptionUsd)}/월 · 환율{" "}
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
            <h2>월정액 기준 대비</h2>
          </div>
        </div>
        <div className="plan-stack">
          <GaugeRow
            label={`${actualRange} 월정액 기준`}
            max={sourceMeta.totalActual}
            tone="steel"
            value={sourceMeta.expectedQuarterFixed}
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
            <strong>{(sourceMeta.totalActual / sourceMeta.expectedQuarterFixed).toFixed(2)}x</strong>
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
                <th>예측 기준</th>
                <th>운영계획 구독</th>
                <th>API 실측/예산</th>
                <th>API/구독 반영</th>
                <th>건수</th>
                <th>월정액 기준</th>
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

function GensparkUsageView({ usageData }: { usageData: GensparkUsageData }) {
  const topTool = usageData.toolUsage[0];
  const detailRate = usageData.totalTasks ? (usageData.detailedTasks / usageData.totalTasks) * 100 : 0;

  return (
    <div className="content-grid genspark-view">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">AI Usage Detail</span>
            <h2>주제별 작업 분포</h2>
          </div>
          <span className="state-pill neutral">{usageData.source.collectedAt}</span>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={usageData.categoryUsage} margin={{ top: 12, right: 16, left: 0, bottom: 42 }}>
              <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-28} textAnchor="end" />
              <YAxis tickLine={false} axisLine={false} width={48} allowDecimals={false} />
              <Tooltip
                formatter={(value, name) => [
                  name === "작업" ? `${numberFormat.format(Number(value))}건` : formatRate(Number(value)),
                  name,
                ]}
              />
              <Legend />
              <Bar dataKey="tasks" name="작업" radius={[5, 5, 0, 0]}>
                {usageData.categoryUsage.map((entry) => (
                  <Cell fill={entry.color} key={entry.name} />
                ))}
              </Bar>
              <Line dataKey="share" name="비중" stroke="#e85d4f" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Tools</span>
            <h2>주요 사용 도구</h2>
          </div>
        </div>
        <div className="api-provider-list">
          {usageData.toolUsage.map((tool) => (
            <article className="api-provider-card" key={tool.tool}>
              <div className="api-provider-head">
                <span className="category-dot" style={{ background: tool.color }} />
                <strong>{tool.tool}</strong>
                <span className="state-pill neutral">{tool.share}%</span>
              </div>
              <MeterRow
                color={tool.color}
                label={tool.primaryUse}
                value={(tool.tasks / usageData.totalTasks) * 100}
                valueLabel={`${numberFormat.format(tool.tasks)}건`}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Output Pattern</span>
            <h2>사용 패턴 요약</h2>
          </div>
        </div>
        <div className="pie-layout genspark-pie-layout">
          <div className="pie-frame">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usageData.toolUsage}
                  dataKey="tasks"
                  nameKey="tool"
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={86}
                  paddingAngle={2}
                >
                  {usageData.toolUsage.map((entry) => (
                    <Cell fill={entry.color} key={entry.tool} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${numberFormat.format(Number(value))}건`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="forecast-list">
            <article className="forecast-row">
              <div>
                <strong>정밀 분석률</strong>
                <span>직접 페이지 방문 분석 {numberFormat.format(usageData.detailedTasks)}건</span>
              </div>
              <b>{formatRate(detailRate)}</b>
            </article>
            <article className="forecast-row">
              <div>
                <strong>최다 사용 도구</strong>
                <span>{topTool?.primaryUse ?? "-"}</span>
              </div>
              <b>{topTool?.tool ?? "-"}</b>
            </article>
            <article className="forecast-row">
              <div>
                <strong>생성파일 매핑</strong>
                <span>상세 링크 목록 기준 파일 종류 확인</span>
              </div>
              <b>{numberFormat.format(usageData.generatedFileMappedTasks)}건</b>
            </article>
          </div>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Key Projects</span>
            <h2>주요 사업/고객사별 활용</h2>
          </div>
          <span className="state-pill ok">제안서 중심</span>
        </div>
        <div className="department-list">
          {usageData.topProjects.map((project) => (
            <article className="department-row" key={project.target}>
              <div>
                <strong>
                  {project.rank}. {project.target}
                </strong>
                <span>{project.theme}</span>
                <small>규모/맥락: {project.scale}</small>
              </div>
              <div className="department-meter" aria-label={`${project.target} 작업 비중`}>
                <span style={{ width: `${Math.min((project.tasks / 10) * 100, 100)}%` }} />
              </div>
              <div className="department-numbers">
                <strong>{numberFormat.format(project.tasks)}건</strong>
                <span>{formatRate((project.tasks / usageData.totalTasks) * 100)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Focus Days</span>
            <h2>집중 작업일</h2>
          </div>
        </div>
        <div className="bar-frame">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={usageData.focusDays} margin={{ top: 16, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={48} allowDecimals={false} />
              <Tooltip
                formatter={(value) => `${numberFormat.format(Number(value))}건`}
                labelFormatter={(label) => {
                  const row = usageData.focusDays.find((item) => item.label === label);
                  return row ? `${row.date} · ${row.focus}` : label;
                }}
              />
              <Bar dataKey="tasks" name="작업" fill="#0f8b8d" radius={[5, 5, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Representative Tasks</span>
            <h2>대표 작업 상세</h2>
          </div>
          <span className="state-pill neutral">{usageData.source.note}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>일자</th>
                <th>작업</th>
                <th>요청 요약</th>
                <th>결과</th>
                <th>도구</th>
                <th>산출물</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {usageData.representativeTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.date}</td>
                  <td>
                    <strong>{task.title}</strong>
                    <small>{task.category}</small>
                  </td>
                  <td>{task.request}</td>
                  <td>{task.result}</td>
                  <td>{task.tool}</td>
                  <td>{task.outputs.join(", ")}</td>
                  <td>
                    <span className={`state-pill ${task.status === "완료" ? "ok" : task.status === "진행" ? "warning" : "neutral"}`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="insight-box">
          <Sparkles size={18} />
          <div>
            <strong>Genspark 작업 히스토리를 AI 활용 상세 분석으로 재구성</strong>
            {usageData.patterns.map((pattern) => (
              <span key={pattern}>{pattern}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AdoptionView({ workspaceUsageData }: { workspaceUsageData: GeminiWorkspaceUsageData }) {
  const mostUsedApp = workspaceUsageData.appUsage[0];
  const listedUsers = workspaceUsageData.listedUsers ?? workspaceUsageData.users.length;
  const highAndMediumUsers = workspaceUsageData.highUsers + workspaceUsageData.mediumUsers;
  const activeUserRate =
    workspaceUsageData.activeUsers > 0 ? (highAndMediumUsers / workspaceUsageData.activeUsers) * 100 : 0;
  const adoptionBuckets = [
    { label: "High", value: workspaceUsageData.highUsers, color: "#0f8b8d" },
    { label: "Medium", value: workspaceUsageData.mediumUsers, color: "#2f8f46" },
    { label: "Low", value: workspaceUsageData.lowUsers, color: "#c58612" },
    { label: "Zero", value: workspaceUsageData.zeroUsers, color: "#5f6f8c" },
  ];

  return (
    <div className="content-grid adoption-view">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Gemini Workspace</span>
            <h2>{workspaceUsageData.source.period} 계정별 활용 추이</h2>
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
              <YAxis yAxisId="users" tickLine={false} axisLine={false} width={54} allowDecimals={false} />
              <YAxis yAxisId="events" orientation="right" tickLine={false} axisLine={false} width={54} />
              <Tooltip
                formatter={(value, name) => [
                  `${numberFormat.format(Number(value))}${name === "이벤트" ? "건" : "명"}`,
                  name,
                ]}
              />
              <Legend />
              <Bar
                yAxisId="users"
                dataKey="activeUsers"
                name="활성 사용자"
                fill="#0f8b8d"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="events"
                dataKey="events"
                name="이벤트"
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
            <span className="eyebrow">Adoption Mix</span>
            <h2>활용 단계 분포</h2>
          </div>
        </div>
        <div className="forecast-list">
          {adoptionBuckets.map((bucket) => (
            <MeterRow
              color={bucket.color}
              key={bucket.label}
              label={workspaceLevelLabel(bucket.label as GeminiWorkspaceUserUsageLevel)}
              value={listedUsers ? (bucket.value / listedUsers) * 100 : 0}
              valueLabel={`${numberFormat.format(bucket.value)}명`}
            />
          ))}
        </div>
        <div className="insight-box">
          <Users size={18} />
          <div>
            <strong>실활용 계정 기준 {formatRate(activeUserRate)}가 중간 이상 활용</strong>
            <span>{workspaceUsageData.source.note}</span>
            <span>활용률은 현재 대상자 목록 {numberFormat.format(listedUsers)}명 기준으로 계산합니다.</span>
            {mostUsedApp ? (
              <span>
                최다 사용 앱은 {mostUsedApp.app} · {numberFormat.format(mostUsedApp.events)}건 ·{" "}
                {numberFormat.format(mostUsedApp.activeUsers)}명입니다.
              </span>
            ) : (
              <span>Workspace Reports API 수집이 시작되면 앱별 활용도가 채워집니다.</span>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Apps</span>
            <h2>앱별 활용도</h2>
          </div>
        </div>
        <div className="api-provider-list">
          {workspaceUsageData.appUsage.length > 0 ? (
            workspaceUsageData.appUsage.map((app) => (
              <article className="api-provider-card" key={app.app}>
                <div className="api-provider-head">
                  <span className="category-dot" style={{ background: "#0f8b8d" }} />
                  <strong>{app.app}</strong>
                  <span className="state-pill neutral">{numberFormat.format(app.activeUsers)}명</span>
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
              <small>Reports API 이벤트가 수집되면 Gmail, Docs, Sheets 등 앱 단위로 분리됩니다.</small>
            </article>
          )}
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Accounts</span>
            <h2>Gemini Workspace 대상 계정별 활용 현황</h2>
          </div>
          <span className="state-pill neutral">
            대상자 {numberFormat.format(listedUsers)}명 · 라이선스 {numberFormat.format(workspaceUsageData.licensedUsers)}명
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>계정</th>
                <th>활용 단계</th>
                <th>점수</th>
                <th>활성일</th>
                <th>이벤트</th>
                <th>앱</th>
                <th>주요 액션</th>
                <th>마지막 사용</th>
              </tr>
            </thead>
            <tbody>
              {workspaceUsageData.users.map((user) => (
                <tr key={user.email}>
                  <td>
                    <strong>{user.email}</strong>
                  </td>
                  <td>
                    <span className={`state-pill ${workspaceLevelTone(user.level)}`}>
                      {workspaceLevelLabel(user.level)}
                    </span>
                  </td>
                  <td>{user.score}</td>
                  <td>{numberFormat.format(user.activeDays)}일</td>
                  <td>{numberFormat.format(user.events)}건</td>
                  <td>{user.apps.length > 0 ? user.apps.join(", ") : "-"}</td>
                  <td>{user.topAction}</td>
                  <td>{user.lastUsed}</td>
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
