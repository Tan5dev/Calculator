export interface FrequencyBin {
  label: string;
  start: number;
  end: number;
  count: number;
  relativeFrequency: number;
  cumulativeFrequency: number;
}

export interface StatisticsSummary {
  ok: boolean;
  count: number;
  sorted: number[];
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  percentileValue: number;
  percentileRank: number;
  sampleVariance: number;
  populationVariance: number;
  sampleStdDev: number;
  populationStdDev: number;
  standardError: number;
  geometricMean: number | null;
  harmonicMean: number | null;
  skewness: number;
  outliers: number[];
  frequencyBins: FrequencyBin[];
  error?: string;
}

export interface RegressionSummary {
  ok: boolean;
  x: number[];
  y: number[];
  slope: number;
  intercept: number;
  r: number;
  rSquared: number;
  equation: string;
  error?: string;
}

export function parseNumberList(raw: string): number[] {
  const tokens = raw
    .split(/[\s,;|\n\t]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const nums: number[] = [];
  for (const tok of tokens) {
    const val = Number(tok);
    if (!Number.isFinite(val)) {
      throw new Error(`Invalid numeric entry "${tok}". Enter numbers separated by commas, spaces, or newlines.`);
    }
    nums.push(val);
  }
  return nums;
}

function linearPercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  if (sorted.length === 1) return sorted[0];
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const frac = idx - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

export function computeStatistics(
  rawData: string,
  percentile = 90,
  binCountInput?: number
): StatisticsSummary {
  try {
    const data = parseNumberList(rawData);
    if (data.length === 0) {
      return {
        ok: false,
        count: 0,
        sorted: [],
        sum: 0,
        mean: 0,
        median: 0,
        modes: [],
        min: 0,
        max: 0,
        range: 0,
        q1: 0,
        q3: 0,
        iqr: 0,
        percentileValue: 0,
        percentileRank: percentile,
        sampleVariance: 0,
        populationVariance: 0,
        sampleStdDev: 0,
        populationStdDev: 0,
        standardError: 0,
        geometricMean: null,
        harmonicMean: null,
        skewness: 0,
        outliers: [],
        frequencyBins: [],
        error: 'Enter at least one number to compute statistics.',
      };
    }

    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const sum = data.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;
    const median = linearPercentile(sorted, 50);
    const q1 = linearPercentile(sorted, 25);
    const q3 = linearPercentile(sorted, 75);
    const iqr = q3 - q1;
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    const clampedP = Math.max(0, Math.min(100, percentile));
    const percentileValue = linearPercentile(sorted, clampedP);

    // Mode(s)
    const freqMap = new Map<number, number>();
    let maxFreq = 0;
    for (const v of data) {
      const f = (freqMap.get(v) ?? 0) + 1;
      freqMap.set(v, f);
      if (f > maxFreq) maxFreq = f;
    }
    const modes =
      maxFreq > 1
        ? Array.from(freqMap.entries())
            .filter(([, f]) => f === maxFreq)
            .map(([v]) => v)
            .sort((a, b) => a - b)
        : [];

    const sqDiffSum = data.reduce((acc, v) => acc + (v - mean) ** 2, 0);
    const populationVariance = sqDiffSum / n;
    const sampleVariance = n > 1 ? sqDiffSum / (n - 1) : 0;
    const populationStdDev = Math.sqrt(populationVariance);
    const sampleStdDev = Math.sqrt(sampleVariance);
    const standardError = sampleStdDev / Math.sqrt(n);

    const allPositive = data.every((v) => v > 0);
    const geometricMean = allPositive
      ? Math.exp(data.reduce((acc, v) => acc + Math.log(v), 0) / n)
      : null;
    const harmonicMean =
      data.every((v) => v !== 0)
        ? n / data.reduce((acc, v) => acc + 1 / v, 0)
        : null;

    const skewness =
      populationStdDev > 0
        ? data.reduce((acc, v) => acc + ((v - mean) / populationStdDev) ** 3, 0) / n
        : 0;

    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);

    // Frequency distribution bins
    const binCount = binCountInput && binCountInput >= 2
      ? Math.min(20, Math.floor(binCountInput))
      : Math.max(3, Math.min(12, Math.ceil(Math.log2(n) + 1)));

    const bins: FrequencyBin[] = [];
    if (range === 0) {
      bins.push({
        label: `${min}`,
        start: min,
        end: max,
        count: n,
        relativeFrequency: 1,
        cumulativeFrequency: n,
      });
    } else {
      const width = range / binCount;
      let cumulative = 0;
      for (let b = 0; b < binCount; b++) {
        const start = min + b * width;
        const end = b === binCount - 1 ? max : min + (b + 1) * width;
        const count = sorted.filter((v) =>
          b === binCount - 1 ? v >= start && v <= end : v >= start && v < end
        ).length;
        cumulative += count;
        bins.push({
          label: `${Number(start.toFixed(2))} – ${Number(end.toFixed(2))}`,
          start,
          end,
          count,
          relativeFrequency: count / n,
          cumulativeFrequency: cumulative,
        });
      }
    }

    return {
      ok: true,
      count: n,
      sorted,
      sum,
      mean,
      median,
      modes,
      min,
      max,
      range,
      q1,
      q3,
      iqr,
      percentileValue,
      percentileRank: clampedP,
      sampleVariance,
      populationVariance,
      sampleStdDev,
      populationStdDev,
      standardError,
      geometricMean,
      harmonicMean,
      skewness,
      outliers,
      frequencyBins: bins,
    };
  } catch (err) {
    return {
      ok: false,
      count: 0,
      sorted: [],
      sum: 0,
      mean: 0,
      median: 0,
      modes: [],
      min: 0,
      max: 0,
      range: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      percentileValue: 0,
      percentileRank: percentile,
      sampleVariance: 0,
      populationVariance: 0,
      sampleStdDev: 0,
      populationStdDev: 0,
      standardError: 0,
      geometricMean: null,
      harmonicMean: null,
      skewness: 0,
      outliers: [],
      frequencyBins: [],
      error: err instanceof Error ? err.message : 'Unable to parse dataset.',
    };
  }
}

export function computeWeightedMean(
  valuesRaw: string,
  weightsRaw: string
): { ok: boolean; weightedMean?: number; totalWeight?: number; error?: string } {
  try {
    const values = parseNumberList(valuesRaw);
    const weights = parseNumberList(weightsRaw);
    if (values.length === 0 || weights.length === 0) {
      return { ok: false, error: 'Enter both values and weights.' };
    }
    if (values.length !== weights.length) {
      return {
        ok: false,
        error: `Length mismatch: ${values.length} values vs ${weights.length} weights.`,
      };
    }
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (Math.abs(totalWeight) < 1e-14) {
      return { ok: false, error: 'Sum of weights cannot be zero.' };
    }
    const weightedSum = values.reduce((acc, v, i) => acc + v * weights[i], 0);
    return { ok: true, weightedMean: weightedSum / totalWeight, totalWeight };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid weighted data.' };
  }
}

export function computeLinearRegression(xRaw: string, yRaw: string): RegressionSummary {
  try {
    const x = parseNumberList(xRaw);
    const y = parseNumberList(yRaw);
    if (x.length < 2 || y.length < 2) {
      return {
        ok: false,
        x: [],
        y: [],
        slope: 0,
        intercept: 0,
        r: 0,
        rSquared: 0,
        equation: '',
        error: 'Provide at least 2 (X, Y) pairs for regression.',
      };
    }
    if (x.length !== y.length) {
      return {
        ok: false,
        x: [],
        y: [],
        slope: 0,
        intercept: 0,
        r: 0,
        rSquared: 0,
        equation: '',
        error: `Mismatch: ${x.length} X values and ${y.length} Y values.`,
      };
    }

    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let sxx = 0;
    let syy = 0;
    let sxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }
    if (sxx === 0) {
      return {
        ok: false,
        x,
        y,
        slope: 0,
        intercept: 0,
        r: 0,
        rSquared: 0,
        equation: '',
        error: 'All X values are identical; linear regression slope is undefined.',
      };
    }

    const slope = sxy / sxx;
    const intercept = meanY - slope * meanX;
    const r = syy === 0 ? 1 : sxy / Math.sqrt(sxx * syy);
    const rSquared = r * r;
    const sign = intercept >= 0 ? '+' : '-';
    const equation = `y = ${Number(slope.toFixed(5))}x ${sign} ${Number(Math.abs(intercept).toFixed(5))}`;

    return { ok: true, x, y, slope, intercept, r, rSquared, equation };
  } catch (err) {
    return {
      ok: false,
      x: [],
      y: [],
      slope: 0,
      intercept: 0,
      r: 0,
      rSquared: 0,
      equation: '',
      error: err instanceof Error ? err.message : 'Invalid scatter plot data.',
    };
  }
}
