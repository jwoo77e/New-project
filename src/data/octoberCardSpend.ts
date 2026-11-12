import type { DashboardData, TransactionCost } from "./aiCostData";
import report from "./octoberCardSpendSnapshot.json";

const vendorMapping: Record<string, { name: string; category: string }> = {
  ANTHROPIC: { name: "Anthropic PBC", category: "Claude/Anthropic" },
  "ANTHROPIC* CLAUDE TEAM": { name: "Anthropic PBC", category: "Claude/Anthropic" },
  "ANTHROPIC* CLAUDE SUB": { name: "Claude.ai Subscription", category: "Claude/Anthropic" },
  OPENAI: { name: "OPENAI OPCO", category: "ChatGPT/OpenAI" },
  "OPENAI *CHATGPT SUBSCR": { name: "OpenAI ChatGPT Subscription", category: "ChatGPT/OpenAI" },
  "구글클라우드코리아 유한회사_구": { name: "구글클라우드코리아", category: "Google/Gemini" },
  "GOOGLE*GOOGLE DIGITAL INC. GOO": { name: "GOOGLE SERVICES", category: "Google/Gemini" },
  "GENSPARK.AI": { name: "MAINFUNC PTE. LTD.", category: "Genspark" },
  "GAMMA.APP": { name: "GAMMA", category: "Gamma" },
};

export function appendOctoberCardSpend(base: DashboardData): DashboardData {
  if (base.monthlyActuals[base.monthlyActuals.length - 1]?.month !== "2026-09") {
    throw new Error("10월 카드 비용은 9월까지의 자료에 한 번만 추가할 수 있습니다.");
  }

  const department = "카드 공용(부서 미지정)";
  // 매입일이 있는 원화 매출금액은 대조된 승인내역의 매입금액과 같습니다. 환가료는 별도입니다.
  const transactions: TransactionCost[] = report.transactions.map(row => ({
    date: row.date,
    department,
    item: row.purpose || row.vendor,
    vendor: vendorMapping[row.vendor]?.name ?? row.vendor,
    category: vendorMapping[row.vendor]?.category ?? "미분류",
    amount: row.amount,
  }));
  const amount = transactions.reduce((sum, row) => sum + row.amount, 0);
  const categoryAmounts = new Map<string, number>();
  const vendorAmounts = new Map<string, number>();
  for (const row of transactions) {
    categoryAmounts.set(row.category, (categoryAmounts.get(row.category) ?? 0) + row.amount);
    vendorAmounts.set(row.vendor, (vendorAmounts.get(row.vendor) ?? 0) + row.amount);
  }

  return {
    ...base,
    sourceMeta: {
      ...base.sourceMeta,
      fileName: `${base.sourceMeta.fileName} + ${report.fileName}`,
      period: "2026년 1월 - 10월",
      recordCount: base.sourceMeta.recordCount + transactions.length,
      totalActual: base.sourceMeta.totalActual + amount,
      costBasisNotes: [
        ...(base.sourceMeta.costBasisNotes ?? []),
        `10월: ${report.fileName}의 10월 이용·정상 매입 ${transactions.length}건, 원화 매출금액 합계 ${amount.toLocaleString("ko-KR")}원. 승인내역과 대조된 매입 53건의 금액이 모두 일치해 기존 매입금액 기준을 유지합니다.`,
        `10월 환가료 ${report.conversionFeeAmount.toLocaleString("ko-KR")}원은 별도이며 위 비용에 더하지 않았습니다. 할인금액은 0원이고 취소·미매입 건은 없습니다.`,
        "10월 원천에는 부서 정보가 없어 카드 공용(부서 미지정)으로 집계합니다. AWS·Railway 291,367원은 기존 분류 체계의 미분류에 포함합니다.",
      ],
      vendorCostNote: "1~8월 상위 10개 거래처에 연결된 동일 거래처의 9~10월 금액을 합산한 목록입니다. 그 외 거래처도 월별·분류별 비용에는 포함됩니다.",
    },
    monthlyActuals: [
      ...base.monthlyActuals,
      { month: report.month, label: "10월", amount, transactions: transactions.length },
    ],
    departmentCosts: base.departmentCosts.map(row => row.name === department ? {
      ...row,
      ownerNote: "9~10월 카드 내역에는 부서 정보가 없어 소속 부서를 배정하지 않음",
      total: row.total + amount,
      transactions: row.transactions + transactions.length,
      monthly: { ...row.monthly, [report.month]: amount },
    } : row),
    categoryCosts: base.categoryCosts.map(row => ({
      ...row,
      amount: row.amount + (categoryAmounts.get(row.name) ?? 0),
    })).sort((a, b) => b.amount - a.amount),
    // 과거 상위 거래처 목록에 없는 업체의 과거 누적액을 0으로 가정하지 않습니다.
    vendorCosts: base.vendorCosts.map(row => ({
      ...row,
      amount: row.amount + (vendorAmounts.get(row.name) ?? 0),
    })).sort((a, b) => b.amount - a.amount),
    topTransactions: [...base.topTransactions, ...transactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 12),
  };
}
