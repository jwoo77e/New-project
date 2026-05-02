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
  TrendingUp,
  Upload,
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
} from "./data/apiUsageData";
import {
  initialDashboardData,
  type DashboardData,
  type MonthlyActual,
  type SourceMeta,
  type TransactionCost,
} from "./data/aiCostData";
import {
  clearStoredDashboardData,
  loadStoredDashboardData,
  saveStoredDashboardData,
} from "./lib/dashboardStorage";
import { dashboardDataFromExcel } from "./lib/excelDashboard";

type ViewKey = "monthly" | "department" | "detail" | "api";

type ForecastPoint = {
  month: string;
  label: string;
  amount: number;
  lower: number;
  upper: number;
};

type MetricTone = "teal" | "green" | "amber" | "coral" | "steel";

type RobustRunRateForecast = {
  measuredDays: number;
  total: number;
  recurringDaily: number;
  monthlyRecurring: number;
  oneTime: number;
  outlierDays: number;
  upperFence: number;
};

const chartColors = ["#0f8b8d", "#e85d4f", "#c58612", "#2f8f46"];
const API_FORECAST_MONTH_DAYS = 30.4;
const API_FORECAST_USD_TO_KRW = 1400;
const VIEW_ROTATION_INTERVAL_MS = 12000;
const viewRotationOrder: ViewKey[] = ["monthly", "department", "detail", "api"];

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

function quantile(sortedValues: number[], percentile: number) {
  if (sortedValues.length === 0) return 0;
  const position = (sortedValues.length - 1) * percentile;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const weight = position - lowerIndex;
  return sortedValues[lowerIndex] * (1 - weight) + sortedValues[upperIndex] * weight;
}

function buildRobustRunRateForecast(values: number[], monthDays = API_FORECAST_MONTH_DAYS): RobustRunRateForecast {
  const cleanedValues = values.map((value) => Math.max(0, Number.isFinite(value) ? value : 0));
  const measuredDays = Math.max(1, cleanedValues.length);
  if (cleanedValues.length === 0) {
    return {
      measuredDays,
      total: 0,
      recurringDaily: 0,
      monthlyRecurring: 0,
      oneTime: 0,
      outlierDays: 0,
      upperFence: 0,
    };
  }

  const sortedValues = [...cleanedValues].sort((a, b) => a - b);
  const median = quantile(sortedValues, 0.5);
  const q1 = quantile(sortedValues, 0.25);
  const q3 = quantile(sortedValues, 0.75);
  const iqr = q3 - q1;
  const iqrFence = iqr > 0 ? q3 + iqr * 1.5 : median;
  const medianFence = median > 0 ? median * 2 : 0;
  const upperFence = Math.max(median, iqrFence, medianFence);
  const cappedValues = cleanedValues.map((value) => Math.min(value, upperFence));
  const total = cleanedValues.reduce((sum, value) => sum + value, 0);
  const cappedTotal = cappedValues.reduce((sum, value) => sum + value, 0);
  const recurringDaily = cappedTotal / measuredDays;

  return {
    measuredDays,
    total,
    recurringDaily,
    monthlyRecurring: recurringDaily * monthDays,
    oneTime: Math.max(0, total - cappedTotal),
    outlierDays: cleanedValues.filter((value) => value > upperFence).length,
    upperFence,
  };
}

function App() {
  const [initialState] = useState(loadInitialDashboardState);
  const [activeView, setActiveView] = useState<ViewKey>("monthly");
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
      if (document.visibilityState !== "visible") return;

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
  const isApiUsageCollected = apiUsageData.source.generatedAt !== initialApiUsageData.source.generatedAt;
  const apiForecast = useMemo(() => {
    if (!isApiUsageCollected) {
      return {
        isReady: false,
        measuredDays: 0,
        dailyCostUsd: 0,
        monthlyCostUsd: 0,
        monthlyCostKrw: 0,
        oneTimeCostUsd: 0,
        costOutlierDays: 0,
        costUpperFenceUsd: 0,
        monthlyTokens: 0,
        oneTimeTokens: 0,
        tokenOutlierDays: 0,
        monthlyRequests: 0,
        oneTimeRequests: 0,
        requestOutlierDays: 0,
        usdToKrwRate: API_FORECAST_USD_TO_KRW,
        monthDays: API_FORECAST_MONTH_DAYS,
      };
    }

    const costRunRate = buildRobustRunRateForecast(apiUsageData.dailyUsage.map((item) => item.costUsd));
    const tokenRunRate = buildRobustRunRateForecast(apiUsageData.dailyUsage.map((item) => item.totalTokens));
    const requestRunRate = buildRobustRunRateForecast(
      apiUsageData.dailyUsage.map((item) => item.openaiRequests + item.geminiRequests + item.claudeRequests),
    );
    const monthlyCostUsd = costRunRate.monthlyRecurring;
    const monthlyCostKrw = Math.round(monthlyCostUsd * API_FORECAST_USD_TO_KRW);

    return {
      isReady: true,
      measuredDays: costRunRate.measuredDays,
      dailyCostUsd: costRunRate.recurringDaily,
      monthlyCostUsd,
      monthlyCostKrw,
      oneTimeCostUsd: costRunRate.oneTime,
      costOutlierDays: costRunRate.outlierDays,
      costUpperFenceUsd: costRunRate.upperFence,
      monthlyTokens: Math.round(tokenRunRate.monthlyRecurring),
      oneTimeTokens: Math.round(tokenRunRate.oneTime),
      tokenOutlierDays: tokenRunRate.outlierDays,
      monthlyRequests: Math.round(requestRunRate.monthlyRecurring),
      oneTimeRequests: Math.round(requestRunRate.oneTime),
      requestOutlierDays: requestRunRate.outlierDays,
      usdToKrwRate: API_FORECAST_USD_TO_KRW,
      monthDays: API_FORECAST_MONTH_DAYS,
    };
  }, [apiUsageData.dailyUsage, isApiUsageCollected]);
  const apiAdjustedForecast = useMemo(
    () =>
      forecast.map((item) => ({
        ...item,
        apiUsageKrw: apiForecast.monthlyCostKrw,
        totalWithApi: item.amount + apiForecast.monthlyCostKrw,
      })),
    [apiForecast.monthlyCostKrw, forecast],
  );
  const apiAdjustedForecastTotal = apiAdjustedForecast.reduce((sum, item) => sum + item.totalWithApi, 0);
  const apiForecastAddedTotal = apiForecast.monthlyCostKrw * forecast.length;
  const apiAdjustedForecastGrowth =
    forecastBasisTotal > 0 ? ((apiAdjustedForecastTotal - forecastBasisTotal) / forecastBasisTotal) * 100 : 0;

  const monthlySeries = [
    ...monthlyActuals.map((item) => ({
      label: item.label,
      actual: item.amount,
      forecast: null,
      apiUsageForecast: null,
      forecastWithApi: null,
      forecastBasis: forecastBasisActuals.find((basis) => basis.month === item.month)?.amount ?? item.amount,
      adjustment: adjustmentByMonth.get(item.month)?.amount ?? 0,
      fixedPlan: sourceMeta.expectedMonthlyFixed,
      transactions: item.transactions,
      status: "실적",
    })),
    ...forecast.map((item) => ({
      label: item.label,
      actual: null,
      forecast: item.amount,
      apiUsageForecast: apiForecast.monthlyCostKrw,
      forecastWithApi: item.amount + apiForecast.monthlyCostKrw,
      forecastBasis: null,
      adjustment: null,
      fixedPlan: sourceMeta.expectedMonthlyFixed,
      transactions: null,
      status: "예측",
    })),
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
      apiForecast,
      apiAdjustedForecast,
      generatedAt: new Date().toISOString(),
      forecastMethod: `${forecastMethodLabel(forecastBasisActuals)} - 개발/데모용 구글 API 일시 비용 제외 후 최근 API 비용 월환산 반영`,
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
            <h1>AI 관련 비용 대시보드</h1>
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
            label={`${forecastRange} API 반영 예측`}
            tone="amber"
            value={formatManWon(apiAdjustedForecastTotal)}
            footer={`기존 ${formatManWon(forecastTotal)} + 반복 API ${formatManWon(apiForecast.monthlyCostKrw)}/월`}
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
          forecastAdjustments={forecastAdjustments}
          forecastBasisActuals={forecastBasisActuals}
          overFixedPlan={overFixedPlan}
          forecastTotal={forecastTotal}
          sourceMeta={sourceMeta}
          monthlyActuals={monthlyActuals}
        />
      )}

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
      totalWithApi: number;
    }
  >;
  apiAdjustedForecastGrowth: number;
  apiAdjustedForecastTotal: number;
  apiForecast: {
    isReady: boolean;
    measuredDays: number;
    dailyCostUsd: number;
    monthlyCostUsd: number;
    monthlyCostKrw: number;
    oneTimeCostUsd: number;
    costOutlierDays: number;
    costUpperFenceUsd: number;
    monthlyTokens: number;
    oneTimeTokens: number;
    tokenOutlierDays: number;
    monthlyRequests: number;
    oneTimeRequests: number;
    requestOutlierDays: number;
    usdToKrwRate: number;
    monthDays: number;
  };
  apiForecastAddedTotal: number;
  forecast: ForecastPoint[];
  forecastAdjustments: DashboardData["forecastAdjustments"];
  forecastBasisActuals: MonthlyActual[];
  forecastTotal: number;
  monthlyActuals: MonthlyActual[];
  monthlySeries: Array<{
    label: string;
    actual: number | null;
    forecast: number | null;
    apiUsageForecast: number | null;
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
                dataKey="apiUsageForecast"
                name="API 월환산"
                stackId="forecast"
                fill="#2f8f46"
                radius={[5, 5, 0, 0]}
              />
              <Line
                dataKey="forecastWithApi"
                name="API 반영 예측"
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
                <span>
                  기존 {formatManWon(item.amount)} · API {formatManWon(item.apiUsageKrw)} 반영
                </span>
              </div>
              <b>{formatManWon(item.totalWithApi)}</b>
            </article>
          ))}
        </div>
        <div className="insight-box">
          <Activity size={18} />
          <div>
            <strong>
              {forecastRange} API 반영 합계 {formatManWon(apiAdjustedForecastTotal)}
            </strong>
            <span>
              기존 예측 {formatManWon(forecastTotal)}에 반복 API 월환산 {formatManWon(apiForecast.monthlyCostKrw)}을
              {" "}
              {forecast.length}개월 더했습니다.
            </span>
            <span>
              API 추가분 합계 {formatManWon(apiForecastAddedTotal)} · 보정 기준 대비{" "}
              {formatRate(apiAdjustedForecastGrowth, true)}
            </span>
            {apiForecast.isReady ? (
              <>
                <span>
                  최근 {apiForecast.measuredDays}일 중 이상치 {apiForecast.costOutlierDays}일의 초과분{" "}
                  {formatUsd(apiForecast.oneTimeCostUsd)}은 월 반복 비용에서 제외했습니다.
                </span>
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
                <th>API 월환산</th>
                <th>API 반영 예측</th>
                <th>건수</th>
                <th>월정액 기준</th>
                <th>차이</th>
              </tr>
            </thead>
            <tbody>
              {monthlySeries.map((row) => {
                const value = row.actual ?? row.forecast ?? 0;
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
                    <td>{row.apiUsageForecast === null ? "-" : formatWon(row.apiUsageForecast)}</td>
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
