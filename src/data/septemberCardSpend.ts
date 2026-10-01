import type { DashboardData, TransactionCost } from "./aiCostData";
import report from "./septemberCardSpendSnapshot.json";

const vendorMapping: Record<string, { name: string; category: string }> = {
  "ANTHROPIC, PBC": { name: "Anthropic PBC", category: "Claude/Anthropic" },
  "OPENAI OPCO, LLC": { name: "OPENAI OPCO", category: "ChatGPT/OpenAI" },
  CHATGPT: { name: "OpenAI ChatGPT Subscription", category: "ChatGPT/OpenAI" },
  "구글클라우드코리아_TOSS": { name: "구글클라우드코리아_TOSS", category: "Google/Gemini" },
  "GOOGLE SERVICES": { name: "GOOGLE SERVICES", category: "Google/Gemini" },
  "MAINFUNC PTE. LTD.": { name: "MAINFUNC PTE. LTD.", category: "Genspark" },
  GAMMA: { name: "GAMMA", category: "Gamma" },
};

export function appendSeptemberCardSpend(base: DashboardData): DashboardData {
  if (base.monthlyActuals.some((row) => row.month >= report.month)) {
    throw new Error("9월 카드 비용은 8월까지의 자료에 한 번만 추가할 수 있습니다.");
  }

  // 매입금액에 취소가 이미 반영되어 있으므로 승인금액·취소금액을 다시 더하거나 빼지 않습니다.
  const purchased = report.transactions.filter((row) => row.amount > 0);
  const amount = purchased.reduce((sum, row) => sum + row.amount, 0);
  const department = "카드 공용(부서 미지정)";
  const transactions: TransactionCost[] = purchased.map((row) => ({
    date: row.date,
    department,
    item: row.subMerchant && row.subMerchant !== "-" ? row.subMerchant : row.vendor,
    vendor: vendorMapping[row.vendor]?.name ?? row.vendor,
    category: vendorMapping[row.vendor]?.category ?? "미분류",
    amount: row.amount,
  }));
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
      period: "2026년 1월 - 9월",
      recordCount: base.sourceMeta.recordCount + purchased.length,
      totalActual: base.sourceMeta.totalActual + amount,
      costBasisNotes: [
        `9월: ${report.fileName}의 이용일 9/1~9/30, 매입금액 합계 ${amount.toLocaleString("ko-KR")}원(${purchased.length}건). 조회 기준일 2026-10-01.`,
        "원본 86건 중 매입금액 0원인 미매입 4건(승인금액 75,612원)과 취소 2건은 비용 합산에서 제외했습니다. 취소금액을 중복 차감하지 않습니다.",
        "9/30 이용·10/1 매입 50,000원은 9월에 포함합니다. 협회 결제 60,000원은 미분류에 포함하며, 원본에 부서 정보가 없어 9월 비용은 카드 공용(부서 미지정)으로 집계합니다.",
      ],
      vendorCostNote: "1~8월 상위 10개 거래처에 동일 거래처의 9월 매입금액을 합산한 목록입니다. 그 외 9월 거래처도 월별·분류별 비용에는 포함됩니다.",
    },
    monthlyActuals: [
      ...base.monthlyActuals,
      { month: report.month, label: "9월", amount, transactions: purchased.length },
    ],
    departmentCosts: [
      ...base.departmentCosts,
      {
        name: department,
        sourceName: "부서 미지정",
        ownerNote: "9월 승인내역에는 부서 정보가 없어 소속 부서를 배정하지 않음",
        total: amount,
        transactions: purchased.length,
        monthly: { [report.month]: amount },
      },
    ],
    categoryCosts: base.categoryCosts.map((row) => ({
      ...row,
      amount: row.amount + (categoryAmounts.get(row.name) ?? 0),
    })).sort((a, b) => b.amount - a.amount),
    // 과거 원천은 상위 10개 거래처만 제공하므로 미등재 거래처의 과거 누적액을 0으로 가정하지 않습니다.
    vendorCosts: base.vendorCosts.map((row) => ({
      ...row,
      amount: row.amount + (vendorAmounts.get(row.name) ?? 0),
    })).sort((a, b) => b.amount - a.amount),
    topTransactions: [...base.topTransactions, ...transactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 12),
  };
}
