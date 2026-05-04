import type { ApiDailyUsage, ApiProviderName } from "../data/apiUsageData";

export type ApiProviderRunRateForecast = {
  provider: ApiProviderName;
  measuredDays: number;
  totalCostUsd: number;
  recurringDailyCostUsd: number;
  monthlyCostUsd: number;
  oneTimeCostUsd: number;
  costOutlierDays: number;
  costOutlierLabels: string[];
  costUpperFenceUsd: number;
  monthlyTokens: number;
  oneTimeTokens: number;
  tokenOutlierDays: number;
  monthlyRequests: number;
  oneTimeRequests: number;
  requestOutlierDays: number;
};

export type ApiUsageRunRateForecast = {
  isReady: boolean;
  measuredDays: number;
  dailyCostUsd: number;
  monthlyCostUsd: number;
  monthlyCostKrw: number;
  oneTimeCostUsd: number;
  costOutlierDays: number;
  costOutlierLabels: string[];
  costUpperFenceUsd: number;
  monthlyTokens: number;
  oneTimeTokens: number;
  tokenOutlierDays: number;
  monthlyRequests: number;
  oneTimeRequests: number;
  requestOutlierDays: number;
  usdToKrwRate: number;
  monthDays: number;
  providers: ApiProviderRunRateForecast[];
};

type MetricRunRateForecast = {
  measuredDays: number;
  total: number;
  recurringDaily: number;
  monthlyRecurring: number;
  oneTime: number;
  outlierDays: number;
  outlierLabels: string[];
  upperFence: number;
};

type ApiUsageForecastOptions = {
  monthDays: number;
  usdToKrwRate: number;
};

const providerConfigs: Array<{
  provider: ApiProviderName;
  costKey: keyof Pick<ApiDailyUsage, "openaiCostUsd" | "geminiCostUsd" | "claudeCostUsd">;
  tokensKey: keyof Pick<ApiDailyUsage, "openaiTokens" | "geminiTokens" | "claudeTokens">;
  requestsKey: keyof Pick<ApiDailyUsage, "openaiRequests" | "geminiRequests" | "claudeRequests">;
}> = [
  {
    provider: "OpenAI",
    costKey: "openaiCostUsd",
    tokensKey: "openaiTokens",
    requestsKey: "openaiRequests",
  },
  {
    provider: "Gemini",
    costKey: "geminiCostUsd",
    tokensKey: "geminiTokens",
    requestsKey: "geminiRequests",
  },
  {
    provider: "Claude",
    costKey: "claudeCostUsd",
    tokensKey: "claudeTokens",
    requestsKey: "claudeRequests",
  },
];

export function emptyApiUsageRunRateForecast({
  monthDays,
  usdToKrwRate,
}: ApiUsageForecastOptions): ApiUsageRunRateForecast {
  return {
    isReady: false,
    measuredDays: 0,
    dailyCostUsd: 0,
    monthlyCostUsd: 0,
    monthlyCostKrw: 0,
    oneTimeCostUsd: 0,
    costOutlierDays: 0,
    costOutlierLabels: [],
    costUpperFenceUsd: 0,
    monthlyTokens: 0,
    oneTimeTokens: 0,
    tokenOutlierDays: 0,
    monthlyRequests: 0,
    oneTimeRequests: 0,
    requestOutlierDays: 0,
    usdToKrwRate,
    monthDays,
    providers: providerConfigs.map(({ provider }) => ({
      provider,
      measuredDays: 0,
      totalCostUsd: 0,
      recurringDailyCostUsd: 0,
      monthlyCostUsd: 0,
      oneTimeCostUsd: 0,
      costOutlierDays: 0,
      costOutlierLabels: [],
      costUpperFenceUsd: 0,
      monthlyTokens: 0,
      oneTimeTokens: 0,
      tokenOutlierDays: 0,
      monthlyRequests: 0,
      oneTimeRequests: 0,
      requestOutlierDays: 0,
    })),
  };
}

export function buildApiUsageRunRateForecast(
  dailyUsage: ApiDailyUsage[],
  options: ApiUsageForecastOptions,
): ApiUsageRunRateForecast {
  if (dailyUsage.length === 0) return emptyApiUsageRunRateForecast(options);

  const labels = dailyUsage.map((item) => item.label || item.date);
  const providers = providerConfigs.map(({ provider, costKey, tokensKey, requestsKey }) => {
    const cost = buildMetricRunRateForecast(
      dailyUsage.map((item) => numberValue(item[costKey])),
      labels,
      options.monthDays,
      "cost",
    );
    const tokens = buildMetricRunRateForecast(
      dailyUsage.map((item) => numberValue(item[tokensKey])),
      labels,
      options.monthDays,
      "usage",
    );
    const requests = buildMetricRunRateForecast(
      dailyUsage.map((item) => numberValue(item[requestsKey])),
      labels,
      options.monthDays,
      "usage",
    );

    return {
      provider,
      measuredDays: cost.measuredDays,
      totalCostUsd: cost.total,
      recurringDailyCostUsd: cost.recurringDaily,
      monthlyCostUsd: cost.monthlyRecurring,
      oneTimeCostUsd: cost.oneTime,
      costOutlierDays: cost.outlierDays,
      costOutlierLabels: cost.outlierLabels,
      costUpperFenceUsd: cost.upperFence,
      monthlyTokens: Math.round(tokens.monthlyRecurring),
      oneTimeTokens: Math.round(tokens.oneTime),
      tokenOutlierDays: tokens.outlierDays,
      monthlyRequests: Math.round(requests.monthlyRecurring),
      oneTimeRequests: Math.round(requests.oneTime),
      requestOutlierDays: requests.outlierDays,
    };
  });

  const measuredDays = Math.max(...providers.map((provider) => provider.measuredDays), 0);
  const monthlyCostUsd = providers.reduce((sum, provider) => sum + provider.monthlyCostUsd, 0);
  const oneTimeCostUsd = providers.reduce((sum, provider) => sum + provider.oneTimeCostUsd, 0);
  const costOutlierLabels = uniqueLabels(providers.flatMap((provider) => provider.costOutlierLabels));

  return {
    isReady: true,
    measuredDays,
    dailyCostUsd: measuredDays > 0 ? monthlyCostUsd / options.monthDays : 0,
    monthlyCostUsd,
    monthlyCostKrw: Math.round(monthlyCostUsd * options.usdToKrwRate),
    oneTimeCostUsd,
    costOutlierDays: providers.reduce((sum, provider) => sum + provider.costOutlierDays, 0),
    costOutlierLabels,
    costUpperFenceUsd: providers.reduce((sum, provider) => sum + provider.costUpperFenceUsd, 0),
    monthlyTokens: providers.reduce((sum, provider) => sum + provider.monthlyTokens, 0),
    oneTimeTokens: providers.reduce((sum, provider) => sum + provider.oneTimeTokens, 0),
    tokenOutlierDays: providers.reduce((sum, provider) => sum + provider.tokenOutlierDays, 0),
    monthlyRequests: providers.reduce((sum, provider) => sum + provider.monthlyRequests, 0),
    oneTimeRequests: providers.reduce((sum, provider) => sum + provider.oneTimeRequests, 0),
    requestOutlierDays: providers.reduce((sum, provider) => sum + provider.requestOutlierDays, 0),
    usdToKrwRate: options.usdToKrwRate,
    monthDays: options.monthDays,
    providers,
  };
}

function buildMetricRunRateForecast(
  rawValues: number[],
  labels: string[],
  monthDays: number,
  mode: "cost" | "usage",
): MetricRunRateForecast {
  const values = rawValues.map((value) => Math.max(0, Number.isFinite(value) ? value : 0));
  const measuredDays = Math.max(1, values.length);
  const total = values.reduce((sum, value) => sum + value, 0);
  const nonZeroValues = values.filter((value) => value > 0);

  if (values.length === 0 || total === 0) {
    return emptyMetricForecast(measuredDays);
  }

  if (nonZeroValues.length === 1) {
    const outlierIndex = values.findIndex((value) => value > 0);
    return {
      measuredDays,
      total,
      recurringDaily: 0,
      monthlyRecurring: 0,
      oneTime: total,
      outlierDays: 1,
      outlierLabels: outlierIndex >= 0 ? [labels[outlierIndex]] : [],
      upperFence: 0,
    };
  }

  const sortedNonZeroValues = [...nonZeroValues].sort((a, b) => a - b);
  const median = quantile(sortedNonZeroValues, 0.5);
  const q1 = quantile(sortedNonZeroValues, 0.25);
  const q3 = quantile(sortedNonZeroValues, 0.75);
  const iqr = q3 - q1;
  const baseline = sortedNonZeroValues.length < 4 ? sortedNonZeroValues[0] : median;
  const iqrFence = iqr > 0 ? q3 + iqr * 1.5 : median;
  const baselineFence = baseline > 0 ? baseline * 3 : 0;
  const upperFence = sortedNonZeroValues.length < 4 ? baselineFence : Math.max(median, iqrFence, baselineFence);
  const minimumOutlierShare = mode === "cost" ? 0.35 : 0.5;

  let oneTime = 0;
  const outlierLabels: string[] = [];
  const cappedValues = values.map((value, index) => {
    if (isOutlierValue({ value, total, baseline, upperFence, minimumOutlierShare })) {
      outlierLabels.push(labels[index]);
      oneTime += value - upperFence;
      return upperFence;
    }
    return value;
  });
  const recurringTotal = cappedValues.reduce((sum, value) => sum + value, 0);
  const recurringDaily = recurringTotal / measuredDays;

  return {
    measuredDays,
    total,
    recurringDaily,
    monthlyRecurring: recurringDaily * monthDays,
    oneTime: Math.max(0, oneTime),
    outlierDays: outlierLabels.length,
    outlierLabels,
    upperFence,
  };
}

function isOutlierValue({
  value,
  total,
  baseline,
  upperFence,
  minimumOutlierShare,
}: {
  value: number;
  total: number;
  baseline: number;
  upperFence: number;
  minimumOutlierShare: number;
}) {
  if (value <= upperFence || value <= 0) return false;

  const share = total > 0 ? value / total : 0;
  const isLargeAgainstBaseline = baseline > 0 && value >= baseline * 3;
  return isLargeAgainstBaseline || share >= minimumOutlierShare;
}

function emptyMetricForecast(measuredDays: number): MetricRunRateForecast {
  return {
    measuredDays,
    total: 0,
    recurringDaily: 0,
    monthlyRecurring: 0,
    oneTime: 0,
    outlierDays: 0,
    outlierLabels: [],
    upperFence: 0,
  };
}

function quantile(sortedValues: number[], percentile: number) {
  if (sortedValues.length === 0) return 0;
  const position = (sortedValues.length - 1) * percentile;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const weight = position - lowerIndex;
  return sortedValues[lowerIndex] * (1 - weight) + sortedValues[upperIndex] * weight;
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function uniqueLabels(labels: string[]) {
  return [...new Set(labels.filter(Boolean))];
}
