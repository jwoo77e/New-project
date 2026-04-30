import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BellRing,
  Check,
  ChevronRight,
  CircleDollarSign,
  Download,
  Gauge,
  PauseCircle,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RangeKey = "7d" | "14d" | "30d";
type ViewKey = "overview" | "budget" | "logs";
type ApprovalStatus = "pending" | "approved" | "rejected";
type Severity = "critical" | "warning" | "info";

type CostPoint = {
  date: string;
  input: number;
  output: number;
  cache: number;
  training: number;
};

type ProviderSpend = {
  name: string;
  spend: number;
  requests: number;
  color: string;
};

type ModelSpend = {
  provider: string;
  model: string;
  spend: number;
  requests: number;
  latency: string;
  errorRate: string;
  color: string;
};

type TeamSpend = {
  team: string;
  spend: number;
  budget: number;
  owner: string;
};

type AlertItem = {
  id: string;
  time: string;
  title: string;
  source: string;
  cost: number;
  severity: Severity;
  state: string;
};

type ApprovalItem = {
  id: string;
  title: string;
  team: string;
  impact: number;
  requester: string;
  status: ApprovalStatus;
};

type UsageRow = {
  id: string;
  time: string;
  workspace: string;
  model: string;
  owner: string;
  tokens: string;
  cost: number;
  status: "정상" | "검토" | "차단";
};

const dailyCosts: CostPoint[] = [
  { date: "4/1", input: 190, output: 310, cache: 58, training: 0 },
  { date: "4/2", input: 205, output: 322, cache: 61, training: 0 },
  { date: "4/3", input: 211, output: 340, cache: 64, training: 40 },
  { date: "4/4", input: 178, output: 298, cache: 55, training: 0 },
  { date: "4/5", input: 160, output: 271, cache: 51, training: 0 },
  { date: "4/6", input: 220, output: 360, cache: 68, training: 0 },
  { date: "4/7", input: 228, output: 374, cache: 71, training: 65 },
  { date: "4/8", input: 214, output: 350, cache: 64, training: 0 },
  { date: "4/9", input: 236, output: 382, cache: 74, training: 0 },
  { date: "4/10", input: 241, output: 390, cache: 77, training: 0 },
  { date: "4/11", input: 230, output: 372, cache: 70, training: 54 },
  { date: "4/12", input: 195, output: 330, cache: 60, training: 0 },
  { date: "4/13", input: 180, output: 302, cache: 56, training: 0 },
  { date: "4/14", input: 255, output: 410, cache: 82, training: 0 },
  { date: "4/15", input: 268, output: 430, cache: 86, training: 95 },
  { date: "4/16", input: 246, output: 404, cache: 79, training: 0 },
  { date: "4/17", input: 238, output: 386, cache: 75, training: 0 },
  { date: "4/18", input: 252, output: 416, cache: 82, training: 0 },
  { date: "4/19", input: 211, output: 342, cache: 68, training: 0 },
  { date: "4/20", input: 193, output: 310, cache: 60, training: 0 },
  { date: "4/21", input: 270, output: 442, cache: 88, training: 118 },
  { date: "4/22", input: 286, output: 470, cache: 92, training: 0 },
  { date: "4/23", input: 276, output: 456, cache: 90, training: 0 },
  { date: "4/24", input: 300, output: 492, cache: 96, training: 0 },
  { date: "4/25", input: 318, output: 524, cache: 102, training: 75 },
  { date: "4/26", input: 289, output: 476, cache: 94, training: 0 },
  { date: "4/27", input: 240, output: 395, cache: 76, training: 0 },
  { date: "4/28", input: 232, output: 380, cache: 73, training: 0 },
  { date: "4/29", input: 305, output: 510, cache: 99, training: 0 },
  { date: "4/30", input: 322, output: 538, cache: 106, training: 84 },
];

const providerSpend: ProviderSpend[] = [
  { name: "OpenAI", spend: 10920, requests: 286400, color: "#0f8b8d" },
  { name: "Anthropic", spend: 4980, requests: 82700, color: "#e85d4f" },
  { name: "Google", spend: 2640, requests: 119300, color: "#c58612" },
  { name: "Vector DB", spend: 2165, requests: 530900, color: "#2f8f46" },
  { name: "Fine-tune", spend: 1074, requests: 18, color: "#5f6f8c" },
];

const modelSpend: ModelSpend[] = [
  {
    provider: "OpenAI",
    model: "Reasoning premium",
    spend: 7120,
    requests: 68400,
    latency: "2.4s",
    errorRate: "0.4%",
    color: "#0f8b8d",
  },
  {
    provider: "OpenAI",
    model: "Chat standard",
    spend: 3800,
    requests: 218000,
    latency: "1.1s",
    errorRate: "0.2%",
    color: "#42a6a8",
  },
  {
    provider: "Anthropic",
    model: "Workflow analysis",
    spend: 4980,
    requests: 82700,
    latency: "2.0s",
    errorRate: "0.5%",
    color: "#e85d4f",
  },
  {
    provider: "Google",
    model: "Batch summarizer",
    spend: 2640,
    requests: 119300,
    latency: "1.6s",
    errorRate: "0.3%",
    color: "#c58612",
  },
  {
    provider: "Vector DB",
    model: "Embeddings + retrieval",
    spend: 2165,
    requests: 530900,
    latency: "0.3s",
    errorRate: "0.1%",
    color: "#2f8f46",
  },
  {
    provider: "Fine-tune",
    model: "Evaluation jobs",
    spend: 1074,
    requests: 18,
    latency: "batch",
    errorRate: "0.0%",
    color: "#5f6f8c",
  },
];

const teamSpend: TeamSpend[] = [
  { team: "Product", spend: 6140, budget: 6800, owner: "S. Lee" },
  { team: "Customer Ops", spend: 5020, budget: 5200, owner: "J. Park" },
  { team: "Research", spend: 4560, budget: 5000, owner: "H. Choi" },
  { team: "Platform", spend: 3219, budget: 3900, owner: "M. Kim" },
  { team: "Sales", spend: 2840, budget: 3100, owner: "Y. Han" },
];

const alerts: AlertItem[] = [
  {
    id: "ALT-4102",
    time: "오늘 21:48",
    title: "Customer Ops 토큰 급증",
    source: "support-transcript-batch",
    cost: 842,
    severity: "critical",
    state: "자동 제한 적용",
  },
  {
    id: "ALT-4098",
    time: "오늘 16:20",
    title: "캐시 적중률 저하",
    source: "retrieval-answering",
    cost: 316,
    severity: "warning",
    state: "담당자 검토",
  },
  {
    id: "ALT-4091",
    time: "어제 23:10",
    title: "Fine-tune 잡 완료",
    source: "evaluation-pipeline",
    cost: 84,
    severity: "info",
    state: "완료",
  },
];

const initialApprovals: ApprovalItem[] = [
  {
    id: "REQ-2218",
    title: "Research 고성능 모델 한도 증액",
    team: "Research",
    impact: 1200,
    requester: "H. Choi",
    status: "pending",
  },
  {
    id: "REQ-2214",
    title: "Customer Ops 야간 배치 재실행",
    team: "Customer Ops",
    impact: 620,
    requester: "J. Park",
    status: "pending",
  },
  {
    id: "REQ-2209",
    title: "Sales 데모 워크스페이스 임시 개방",
    team: "Sales",
    impact: 210,
    requester: "Y. Han",
    status: "approved",
  },
];

const usageRows: UsageRow[] = [
  {
    id: "RUN-88102",
    time: "22:18",
    workspace: "support-transcript-batch",
    model: "Workflow analysis",
    owner: "Customer Ops",
    tokens: "8.2M",
    cost: 842,
    status: "검토",
  },
  {
    id: "RUN-88094",
    time: "21:47",
    workspace: "product-prd-agent",
    model: "Reasoning premium",
    owner: "Product",
    tokens: "3.8M",
    cost: 514,
    status: "정상",
  },
  {
    id: "RUN-88071",
    time: "19:22",
    workspace: "retrieval-answering",
    model: "Embeddings + retrieval",
    owner: "Platform",
    tokens: "12.5M",
    cost: 316,
    status: "검토",
  },
  {
    id: "RUN-88050",
    time: "17:04",
    workspace: "evaluation-pipeline",
    model: "Evaluation jobs",
    owner: "Research",
    tokens: "batch",
    cost: 84,
    status: "정상",
  },
  {
    id: "RUN-88032",
    time: "15:36",
    workspace: "sales-demo-open",
    model: "Chat standard",
    owner: "Sales",
    tokens: "1.1M",
    cost: 155,
    status: "정상",
  },
  {
    id: "RUN-87988",
    time: "12:10",
    workspace: "unscoped-bulk-export",
    model: "Reasoning premium",
    owner: "Unknown",
    tokens: "blocked",
    cost: 0,
    status: "차단",
  },
];

const rangeOptions: Array<{ key: RangeKey; label: string; length: number }> = [
  { key: "7d", label: "7일", length: 7 },
  { key: "14d", label: "14일", length: 14 },
  { key: "30d", label: "30일", length: 30 },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const statusLabel: Record<ApprovalStatus, string> = {
  pending: "대기",
  approved: "승인",
  rejected: "거절",
};

function formatCurrency(value: number) {
  return money.format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function App() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [budget, setBudget] = useState(24000);
  const [hardCap, setHardCap] = useState(27000);
  const [alertThreshold, setAlertThreshold] = useState(85);
  const [autoThrottle, setAutoThrottle] = useState(true);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [lastSync, setLastSync] = useState("22:32");
  const [toast, setToast] = useState("");
  const [logQuery, setLogQuery] = useState("");

  const selectedRange = rangeOptions.find((option) => option.key === range)!;
  const chartData = useMemo(() => {
    return dailyCosts.slice(-selectedRange.length).map((item) => ({
      ...item,
      total: item.input + item.output + item.cache + item.training,
      budget: budget / 30,
    }));
  }, [budget, selectedRange.length]);

  const totalSpend = useMemo(
    () =>
      dailyCosts.reduce(
        (sum, item) => sum + item.input + item.output + item.cache + item.training,
        0,
      ),
    [],
  );

  const lastSevenSpend = useMemo(() => {
    return dailyCosts
      .slice(-7)
      .reduce((sum, item) => sum + item.input + item.output + item.cache + item.training, 0);
  }, []);

  const previousSevenSpend = useMemo(() => {
    return dailyCosts
      .slice(-14, -7)
      .reduce((sum, item) => sum + item.input + item.output + item.cache + item.training, 0);
  }, []);

  const usageRate = (totalSpend / budget) * 100;
  const capRate = (totalSpend / hardCap) * 100;
  const weekDelta = ((lastSevenSpend - previousSevenSpend) / previousSevenSpend) * 100;
  const pendingApprovals = approvals.filter((item) => item.status === "pending").length;
  const openRisks = alerts.filter((item) => item.severity !== "info").length + pendingApprovals;
  const budgetGap = budget - totalSpend;
  const chartAverage = chartData.reduce((sum, item) => sum + item.total, 0) / chartData.length;

  const filteredRows = usageRows.filter((row) => {
    const query = logQuery.trim().toLowerCase();
    if (!query) return true;
    return [row.id, row.workspace, row.model, row.owner, row.status].some((value) =>
      value.toLowerCase().includes(query),
    );
  });

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const refreshSnapshot = () => {
    const time = new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
    setLastSync(time);
    showToast("최신 비용 스냅샷으로 갱신했습니다.");
  };

  const exportSnapshot = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      budget,
      hardCap,
      alertThreshold,
      autoThrottle,
      totalSpend,
      providerSpend,
      teamSpend,
      alerts,
      approvals,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ai-cost-snapshot.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("비용 스냅샷을 내보냈습니다.");
  };

  const updateApproval = (id: string, status: ApprovalStatus) => {
    setApprovals((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    showToast(status === "approved" ? "요청을 승인했습니다." : "요청을 거절했습니다.");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <Gauge size={24} />
          </div>
          <div>
            <h1>AI 비용 관제</h1>
            <p>2026년 4월 · 마지막 동기화 {lastSync}</p>
          </div>
        </div>
        <div className="top-actions" aria-label="대시보드 작업">
          <div className="segmented-control" aria-label="차트 범위">
            {rangeOptions.map((option) => (
              <button
                key={option.key}
                className={range === option.key ? "is-active" : ""}
                type="button"
                onClick={() => setRange(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button className="icon-button" type="button" onClick={refreshSnapshot} title="새로고침">
            <RefreshCw size={18} />
            <span className="sr-only">새로고침</span>
          </button>
          <button className="command-button" type="button" onClick={exportSnapshot}>
            <Download size={17} />
            내보내기
          </button>
        </div>
      </header>

      <nav className="view-tabs" aria-label="대시보드 보기">
        <button
          className={activeView === "overview" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("overview")}
        >
          <Activity size={17} />
          현황
        </button>
        <button
          className={activeView === "budget" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("budget")}
        >
          <SlidersHorizontal size={17} />
          예산
        </button>
        <button
          className={activeView === "logs" ? "is-active" : ""}
          type="button"
          onClick={() => setActiveView("logs")}
        >
          <ShieldAlert size={17} />
          로그
        </button>
      </nav>

      <section className="metric-grid" aria-label="핵심 비용 지표">
        <MetricCard
          icon={<CircleDollarSign size={21} />}
          label="4월 누적 비용"
          value={formatCurrency(totalSpend)}
          footer={`${compact.format(providerSpend.reduce((sum, item) => sum + item.requests, 0))} API 요청`}
          tone="teal"
        />
        <MetricCard
          icon={<Gauge size={21} />}
          label="예산 소진률"
          value={formatPercent(usageRate)}
          footer={`${formatCurrency(Math.max(budgetGap, 0))} 잔여`}
          progress={usageRate}
          tone={usageRate >= alertThreshold ? "amber" : "green"}
        />
        <MetricCard
          icon={weekDelta >= 0 ? <TrendingUp size={21} /> : <TrendingDown size={21} />}
          label="최근 7일 증감"
          value={`${weekDelta >= 0 ? "+" : ""}${formatPercent(weekDelta)}`}
          footer={`${formatCurrency(chartAverage)} 일평균`}
          tone={weekDelta >= 0 ? "coral" : "green"}
        />
        <MetricCard
          icon={<BellRing size={21} />}
          label="위험 이벤트"
          value={`${openRisks}건`}
          footer={`${pendingApprovals}건 승인 대기`}
          tone="coral"
        />
      </section>

      {activeView === "overview" && (
        <OverviewView
          alertThreshold={alertThreshold}
          autoThrottle={autoThrottle}
          budget={budget}
          capRate={capRate}
          chartData={chartData}
          hardCap={hardCap}
          modelSpend={modelSpend}
          providerSpend={providerSpend}
          setAutoThrottle={setAutoThrottle}
          totalSpend={totalSpend}
          updateToast={showToast}
          usageRate={usageRate}
        />
      )}

      {activeView === "budget" && (
        <BudgetView
          alertThreshold={alertThreshold}
          approvals={approvals}
          budget={budget}
          hardCap={hardCap}
          setAlertThreshold={setAlertThreshold}
          setBudget={setBudget}
          setHardCap={setHardCap}
          teamSpend={teamSpend}
          totalSpend={totalSpend}
          updateApproval={updateApproval}
        />
      )}

      {activeView === "logs" && (
        <LogsView
          alerts={alerts}
          filteredRows={filteredRows}
          logQuery={logQuery}
          setLogQuery={setLogQuery}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function OverviewView({
  alertThreshold,
  autoThrottle,
  budget,
  capRate,
  chartData,
  hardCap,
  modelSpend,
  providerSpend,
  setAutoThrottle,
  totalSpend,
  updateToast,
  usageRate,
}: {
  alertThreshold: number;
  autoThrottle: boolean;
  budget: number;
  capRate: number;
  chartData: Array<CostPoint & { total: number; budget: number }>;
  hardCap: number;
  modelSpend: ModelSpend[];
  providerSpend: ProviderSpend[];
  setAutoThrottle: (value: boolean) => void;
  totalSpend: number;
  updateToast: (message: string) => void;
  usageRate: number;
}) {
  const projectedState = usageRate >= alertThreshold ? "주의" : "정상";

  return (
    <div className="content-grid">
      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Spend trend</span>
            <h2>일별 비용 흐름</h2>
          </div>
          <span className={`state-pill ${projectedState === "주의" ? "warning" : "ok"}`}>
            {projectedState}
          </span>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="inputTokens" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0f8b8d" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#0f8b8d" stopOpacity={0.08} />
                </linearGradient>
                <linearGradient id="outputTokens" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#e85d4f" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#e85d4f" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(value) => `$${Number(value) / 1000}k`}
                tickLine={false}
                axisLine={false}
                width={58}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Area
                dataKey="output"
                name="출력 토큰"
                stackId="cost"
                stroke="#e85d4f"
                fill="url(#outputTokens)"
              />
              <Area
                dataKey="input"
                name="입력 토큰"
                stackId="cost"
                stroke="#0f8b8d"
                fill="url(#inputTokens)"
              />
              <Area
                dataKey="cache"
                name="캐시/검색"
                stackId="cost"
                stroke="#2f8f46"
                fill="#2f8f4630"
              />
              <Area
                dataKey="training"
                name="평가/튜닝"
                stackId="cost"
                stroke="#5f6f8c"
                fill="#5f6f8c26"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Guardrail</span>
            <h2>비용 제한 상태</h2>
          </div>
          <button
            className={`toggle-button ${autoThrottle ? "enabled" : ""}`}
            type="button"
            onClick={() => {
              setAutoThrottle(!autoThrottle);
              updateToast(!autoThrottle ? "자동 제한을 켰습니다." : "자동 제한을 껐습니다.");
            }}
            aria-pressed={autoThrottle}
          >
            {autoThrottle ? <PauseCircle size={18} /> : <Play size={18} />}
            {autoThrottle ? "자동 제한 ON" : "자동 제한 OFF"}
          </button>
        </div>
        <div className="budget-stack">
          <GaugeRow label="월 예산" value={totalSpend} max={budget} tone="green" />
          <GaugeRow label="하드캡" value={totalSpend} max={hardCap} tone="amber" />
          <div className="rule-row">
            <span>알림 기준</span>
            <strong>{alertThreshold}%</strong>
          </div>
          <div className="rule-row">
            <span>현재 하드캡 사용률</span>
            <strong>{formatPercent(capRate)}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Provider</span>
            <h2>공급자별 비용</h2>
          </div>
        </div>
        <div className="bar-frame">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={providerSpend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#dde5df" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(value) => `$${Number(value) / 1000}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="spend" name="비용" radius={[5, 5, 0, 0]}>
                {providerSpend.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Model mix</span>
            <h2>모델별 비용 효율</h2>
          </div>
        </div>
        <div className="model-list">
          {modelSpend.map((item) => {
            const share = (item.spend / totalSpend) * 100;
            return (
              <article className="model-row" key={`${item.provider}-${item.model}`}>
                <div className="model-main">
                  <span className="model-dot" style={{ background: item.color }} />
                  <div>
                    <strong>{item.model}</strong>
                    <span>{item.provider}</span>
                  </div>
                </div>
                <div className="model-meter" aria-label={`${item.model} 비용 점유율`}>
                  <span style={{ width: `${share}%`, background: item.color }} />
                </div>
                <div className="model-stats">
                  <strong>{formatCurrency(item.spend)}</strong>
                  <span>{compact.format(item.requests)} req</span>
                  <span>{item.latency}</span>
                  <span>{item.errorRate}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BudgetView({
  alertThreshold,
  approvals,
  budget,
  hardCap,
  setAlertThreshold,
  setBudget,
  setHardCap,
  teamSpend,
  totalSpend,
  updateApproval,
}: {
  alertThreshold: number;
  approvals: ApprovalItem[];
  budget: number;
  hardCap: number;
  setAlertThreshold: (value: number) => void;
  setBudget: (value: number) => void;
  setHardCap: (value: number) => void;
  teamSpend: TeamSpend[];
  totalSpend: number;
  updateApproval: (id: string, status: ApprovalStatus) => void;
}) {
  const policyData = [
    { name: "사용", value: totalSpend, color: "#0f8b8d" },
    { name: "잔여", value: Math.max(budget - totalSpend, 0), color: "#dce3dd" },
  ];

  return (
    <div className="content-grid budget-view">
      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Control</span>
            <h2>예산 정책</h2>
          </div>
        </div>
        <div className="policy-form">
          <label>
            <span>월 예산</span>
            <input
              min={5000}
              max={50000}
              step={500}
              type="number"
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
            />
          </label>
          <input
            aria-label="월 예산 슬라이더"
            min={5000}
            max={50000}
            step={500}
            type="range"
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
          />
          <label>
            <span>하드캡</span>
            <input
              min={budget}
              max={60000}
              step={500}
              type="number"
              value={hardCap}
              onChange={(event) => setHardCap(Number(event.target.value))}
            />
          </label>
          <input
            aria-label="하드캡 슬라이더"
            min={budget}
            max={60000}
            step={500}
            type="range"
            value={hardCap}
            onChange={(event) => setHardCap(Number(event.target.value))}
          />
          <label>
            <span>알림 기준</span>
            <strong>{alertThreshold}%</strong>
          </label>
          <input
            aria-label="알림 기준 슬라이더"
            min={50}
            max={98}
            step={1}
            type="range"
            value={alertThreshold}
            onChange={(event) => setAlertThreshold(Number(event.target.value))}
          />
        </div>
      </section>

      <section className="panel chart-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Allocation</span>
            <h2>예산 잔여</h2>
          </div>
          <span className="state-pill warning">{formatPercent((totalSpend / budget) * 100)}</span>
        </div>
        <div className="pie-frame">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={policyData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={2}
              >
                {policyData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-center">
            <strong>{formatCurrency(Math.max(budget - totalSpend, 0))}</strong>
            <span>잔여</span>
          </div>
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Teams</span>
            <h2>팀별 예산 배분</h2>
          </div>
        </div>
        <div className="team-list">
          {teamSpend.map((team) => (
            <article className="team-row" key={team.team}>
              <div>
                <strong>{team.team}</strong>
                <span>{team.owner}</span>
              </div>
              <div className="team-meter" aria-label={`${team.team} 예산 사용률`}>
                <span style={{ width: `${Math.min((team.spend / team.budget) * 100, 100)}%` }} />
              </div>
              <div className="team-numbers">
                <strong>{formatCurrency(team.spend)}</strong>
                <span>{formatPercent((team.spend / team.budget) * 100)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Approvals</span>
            <h2>승인 대기</h2>
          </div>
        </div>
        <div className="approval-list">
          {approvals.map((item) => (
            <article className="approval-row" key={item.id}>
              <div>
                <span className={`state-pill small ${item.status}`}>{statusLabel[item.status]}</span>
                <strong>{item.title}</strong>
                <span>
                  {item.team} · {item.requester} · +{formatCurrency(item.impact)}
                </span>
              </div>
              <div className="approval-actions">
                <button
                  className="icon-button"
                  disabled={item.status !== "pending"}
                  type="button"
                  onClick={() => updateApproval(item.id, "approved")}
                  title="승인"
                >
                  <Check size={18} />
                  <span className="sr-only">승인</span>
                </button>
                <button
                  className="icon-button danger"
                  disabled={item.status !== "pending"}
                  type="button"
                  onClick={() => updateApproval(item.id, "rejected")}
                  title="거절"
                >
                  <X size={18} />
                  <span className="sr-only">거절</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function LogsView({
  alerts,
  filteredRows,
  logQuery,
  setLogQuery,
}: {
  alerts: AlertItem[];
  filteredRows: UsageRow[];
  logQuery: string;
  setLogQuery: (value: string) => void;
}) {
  return (
    <div className="content-grid logs-view">
      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Alerts</span>
            <h2>비용 알림</h2>
          </div>
        </div>
        <div className="alert-list">
          {alerts.map((alert) => (
            <article className={`alert-row ${alert.severity}`} key={alert.id}>
              <div className="alert-icon" aria-hidden="true">
                {alert.severity === "critical" ? <Zap size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div>
                <strong>{alert.title}</strong>
                <span>
                  {alert.time} · {alert.source}
                </span>
              </div>
              <div className="alert-cost">
                <strong>{formatCurrency(alert.cost)}</strong>
                <span>{alert.state}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel panel-wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Runs</span>
            <h2>사용 로그</h2>
          </div>
          <label className="search-box">
            <Search size={17} />
            <input
              placeholder="워크스페이스, 모델, 상태"
              type="search"
              value={logQuery}
              onChange={(event) => setLogQuery(event.target.value)}
            />
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>시간</th>
                <th>워크스페이스</th>
                <th>모델</th>
                <th>소유</th>
                <th>토큰</th>
                <th>비용</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.time}</td>
                  <td>
                    <strong>{row.workspace}</strong>
                    <span>{row.id}</span>
                  </td>
                  <td>{row.model}</td>
                  <td>{row.owner}</td>
                  <td>{row.tokens}</td>
                  <td>{formatCurrency(row.cost)}</td>
                  <td>
                    <span className={`run-status ${row.status}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  footer,
  icon,
  label,
  progress,
  tone,
  value,
}: {
  footer: string;
  icon: ReactNode;
  label: string;
  progress?: number;
  tone: "teal" | "green" | "amber" | "coral";
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
      {typeof progress === "number" && (
        <div className="metric-progress" aria-label={`${label} 진행률`}>
          <span style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
    </article>
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
  tone: "green" | "amber";
  value: number;
}) {
  const rate = Math.min((value / max) * 100, 100);
  return (
    <div className="gauge-row">
      <div>
        <span>{label}</span>
        <strong>
          {formatCurrency(value)} / {formatCurrency(max)}
        </strong>
      </div>
      <div className={`gauge-track ${tone}`}>
        <span style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
}

export default App;
