import { useState } from "react";
import type { ApiUsageData } from "../data/apiUsageData";
import { apiUsageKeyId, filterApiUsageDetails, summarizeApiUsageDetails } from "../lib/apiUsageDetails";
import type { ApiUsagePeriodKey, ApiUsagePeriodSummary } from "../lib/apiUsagePeriods";

const count = (value: number | null) => value === null ? "—" : value.toLocaleString("ko-KR");
const cost = (value: number | null) => value === null ? "—" : value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function ApiUsageDetails({ data, period, periods, onPeriodChange }: {
  data: ApiUsageData;
  period: ApiUsagePeriodSummary;
  periods: ApiUsagePeriodSummary[];
  onPeriodChange: (key: ApiUsagePeriodKey) => void;
}) {
  const [provider, setProvider] = useState("all");
  const [key, setKey] = useState("all");
  const details = data.usageDetails ?? [];
  const keyOptions = [...new Map(details.filter((row) => provider === "all" || row.provider === provider)
    .map((row) => [apiUsageKeyId(row), row])).entries()];
  const selectedRows = filterApiUsageDetails(details, period, provider, key);
  const keyRows = summarizeApiUsageDetails(selectedRows, "key");
  const modelRows = summarizeApiUsageDetails(selectedRows, "model");
  const coverage = (data.usageDetailCoverage ?? []).filter((item) => provider === "all" || item.provider === provider);
  const missing = coverage.filter((item) => !item.collected || item.startDate > period.startDate || item.endDate < period.endDate);
  const hasCoverage = coverage.some((item) => item.collected && item.startDate <= period.endDate && item.endDate >= period.startDate);
  const emptyMessage = !data.usageDetails || !hasCoverage
    ? "선택 기간의 키·모델별 상세 데이터가 아직 수집되지 않았습니다. 다음 API 수집 후 표시됩니다."
    : "선택한 기간과 조건에 해당하는 사용 내역이 없습니다.";

  return (
    <section className="panel panel-wide api-detail-panel">
      <div className="panel-header">
        <div><span className="eyebrow">Keys & Models</span><h2>API 키별 · 모델별 사용량</h2></div>
        <span className="state-pill neutral">{period.label} · {period.rangeLabel}</span>
      </div>
      <div className="api-detail-filters">
        <div className="api-detail-periods" role="group" aria-label="키·모델별 사용량 기간">
          {periods.map((item) => <button type="button" key={item.key} aria-pressed={period.key === item.key}
            className={period.key === item.key ? "active" : ""} onClick={() => onPeriodChange(item.key)}>{item.label}</button>)}
        </div>
        <label>공급자<select aria-label="공급자" value={provider} onChange={(event) => { setProvider(event.target.value); setKey("all"); }}>
          <option value="all">전체 공급자</option>
          {data.providers.map((item) => <option key={item.provider} value={item.provider}>{item.provider}</option>)}
        </select></label>
        <label>API 키<select aria-label="API 키" value={key} onChange={(event) => setKey(event.target.value)}>
          <option value="all">전체 API 키</option>
          {keyOptions.map(([id, row]) => <option key={id} value={id}>{row.provider} · {row.sourceName} · {row.keyName}</option>)}
        </select></label>
      </div>
      <p className="approval-footnote">상단 기간 통계와 함께 변경됩니다. 기간은 한국 날짜 기준, 이번 주는 월요일부터 오늘까지입니다. 원천 사용량은 공급자가 반환한 일별 버킷 기준입니다.</p>
      {missing.length > 0 && <p className="approval-footnote" role="status">일부 상세 데이터 미수집 또는 기간 부족: {missing.map((item) => `${item.provider} (${item.sourceName})`).join(", ")}</p>}
      <h3>API 키별 사용량</h3>
      <div className="table-wrap"><table>
        <thead><tr><th>공급자</th><th>수집 연결</th><th>API 키</th><th>요청</th><th>입력 토큰</th><th>출력 토큰</th><th>총 토큰</th><th>추정 비용</th></tr></thead>
        <tbody>{keyRows.length ? keyRows.map((row) => <tr key={row.id}>
          <td>{row.provider}</td><td>{row.sourceName}</td><td><strong>{row.keyName}</strong></td>
          <td>{count(row.requests)}</td><td>{count(row.inputTokens)}</td><td>{count(row.outputTokens)}</td><td>{count(row.totalTokens)}</td><td>{cost(row.costUsd)}</td>
        </tr>) : <tr><td colSpan={8} className="api-detail-empty">{emptyMessage}</td></tr>}</tbody>
      </table></div>
      <h3>모델별 사용량</h3>
      <div className="table-wrap"><table>
        <thead><tr><th>공급자</th><th>모델</th><th>요청</th><th>입력 토큰</th><th>출력 토큰</th><th>총 토큰</th><th>추정 비용</th></tr></thead>
        <tbody>{modelRows.length ? modelRows.map((row) => <tr key={row.id}>
          <td>{row.provider}</td><td><strong>{row.model}</strong></td><td>{count(row.requests)}</td>
          <td>{count(row.inputTokens)}</td><td>{count(row.outputTokens)}</td><td>{count(row.totalTokens)}</td><td>{cost(row.costUsd)}</td>
        </tr>) : <tr><td colSpan={7} className="api-detail-empty">{emptyMessage}</td></tr>}</tbody>
      </table></div>
      <p className="approval-footnote">비용은 같은 날의 수집 연결별 총비용을 토큰 비중으로 배분한 추정치입니다. 미수집 비용·요청 수는 —로 표시합니다. Gemini는 프로젝트 집계로 키별 분리가 불가하며, 키 식별자가 없는 사용량은 별도 행에 표시합니다. 키 표시는 식별용 코드이며 실제 비밀 키는 저장하지 않습니다.</p>
    </section>
  );
}
