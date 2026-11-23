import { useMemo, useState } from 'react';
import { GraphPanel } from '../components/GraphPanel';
import { ResultPanel } from '../components/ResultPanel';
import { useCalculator } from '../context/CalculatorContext';
import {
  computeLinearRegression,
  computeStatistics,
  computeWeightedMean,
} from '../engines/statisticsEngine';
import { formatNumber } from '../utils/formatters';

type ChartKind = 'histogram' | 'bar' | 'pie' | 'box' | 'scatter';

export function Statistics() {
  const { addHistory } = useCalculator();
  const [rawData, setRawData] = useState('12, 15, 18, 22, 22, 25, 27, 30, 31, 34, 38, 42');
  const [weightsRaw, setWeightsRaw] = useState('1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1');
  const [percentile, setPercentile] = useState(90);
  const [binCount, setBinCount] = useState(5);
  const [chartType, setChartType] = useState<ChartKind>('histogram');

  // Scatter / Regression X, Y
  const [scatterX, setScatterX] = useState('1, 2, 3, 4, 5, 6, 7');
  const [scatterY, setScatterY] = useState('2.1, 4.0, 5.8, 8.2, 9.9, 12.1, 14.3');

  const stats = useMemo(
    () => computeStatistics(rawData, percentile, binCount),
    [rawData, percentile, binCount]
  );

  const weighted = useMemo(
    () => computeWeightedMean(rawData, weightsRaw),
    [rawData, weightsRaw]
  );

  const regression = useMemo(
    () => computeLinearRegression(scatterX, scatterY),
    [scatterX, scatterY]
  );

  const chartTraces = useMemo(() => {
    if (chartType === 'scatter') {
      if (!regression.ok) return [];
      const minX = Math.min(...regression.x);
      const maxX = Math.max(...regression.x);
      return [
        {
          type: 'scatter',
          mode: 'markers',
          name: 'Data Points',
          x: regression.x,
          y: regression.y,
          marker: { color: '#06B6D4', size: 9 },
        },
        {
          type: 'scatter',
          mode: 'lines',
          name: regression.equation,
          x: [minX, maxX],
          y: [
            regression.slope * minX + regression.intercept,
            regression.slope * maxX + regression.intercept,
          ],
          line: { color: '#F59E0B', width: 2.5 },
        },
      ];
    }

    if (!stats.ok) return [];

    if (chartType === 'histogram') {
      return [
        {
          type: 'histogram',
          name: 'Frequency',
          x: stats.sorted,
          nbinsx: binCount,
          marker: { color: '#06B6D4', line: { color: '#0891B2', width: 1 } },
        },
      ];
    }

    if (chartType === 'bar') {
      return [
        {
          type: 'bar',
          name: 'Bin Count',
          x: stats.frequencyBins.map((b) => b.label),
          y: stats.frequencyBins.map((b) => b.count),
          marker: { color: '#06B6D4' },
        },
      ];
    }

    if (chartType === 'pie') {
      return [
        {
          type: 'pie',
          labels: stats.frequencyBins.map((b) => b.label),
          values: stats.frequencyBins.map((b) => b.count),
          hole: 0.3,
        },
      ];
    }

    return [
      {
        type: 'box',
        name: 'Dataset Distribution',
        y: stats.sorted,
        boxpoints: 'all',
        jitter: 0.3,
        marker: { color: '#06B6D4' },
      },
    ];
  }, [chartType, stats, regression, binCount]);

  const handleSaveSnapshot = () => {
    if (!stats.ok) return;
    addHistory({
      module: 'Statistics',
      expression: `n=${stats.count} dataset`,
      result: `Mean=${formatNumber(stats.mean)}, Median=${formatNumber(stats.median)}, σ=${formatNumber(stats.populationStdDev)}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Dataset Input
              </h2>
              <button
                type="button"
                onClick={handleSaveSnapshot}
                className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Save to History
              </button>
            </div>

            <label className="block space-y-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Values (comma, space, or newline separated)
              </span>
              <textarea
                rows={3}
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-xs"
              />
            </label>

            <label className="block space-y-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Weights (for Weighted Mean)
              </span>
              <input
                type="text"
                value={weightsRaw}
                onChange={(e) => setWeightsRaw(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-xs"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Percentile (0–100)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={percentile}
                  onChange={(e) => setPercentile(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Histogram Bins</span>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={binCount}
                  onChange={(e) => setBinCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                />
              </label>
            </div>

            {chartType === 'scatter' && (
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-200">
                  Scatter Plot &amp; Linear Regression Pairs
                </div>
                <label className="block space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">X Values</span>
                  <input
                    type="text"
                    value={scatterX}
                    onChange={(e) => setScatterX(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Y Values</span>
                  <input
                    type="text"
                    value={scatterY}
                    onChange={(e) => setScatterY(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
              </div>
            )}
          </div>

          <ResultPanel
            title="Descriptive Statistics"
            error={stats.error}
          >
            {stats.ok && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                {[
                  ['Count (n)', String(stats.count)],
                  ['Mean', formatNumber(stats.mean)],
                  ['Median', formatNumber(stats.median)],
                  ['Mode', stats.modes.length > 0 ? stats.modes.join(', ') : 'None'],
                  ['Sample Std Dev (s)', formatNumber(stats.sampleStdDev)],
                  ['Pop Std Dev (σ)', formatNumber(stats.populationStdDev)],
                  ['Sample Var (s²)', formatNumber(stats.sampleVariance)],
                  ['Pop Var (σ²)', formatNumber(stats.populationVariance)],
                  ['Range', formatNumber(stats.range)],
                  ['Q1 (25th)', formatNumber(stats.q1)],
                  ['Q3 (75th)', formatNumber(stats.q3)],
                  ['IQR (Q3 - Q1)', formatNumber(stats.iqr)],
                  [`P${stats.percentileRank}`, formatNumber(stats.percentileValue)],
                  [
                    'Weighted Mean',
                    weighted.ok && weighted.weightedMean !== undefined
                      ? formatNumber(weighted.weightedMean)
                      : '—',
                  ],
                  ['Min / Max', `${stats.min} / ${stats.max}`],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800"
                  >
                    <div className="text-[11px] text-slate-400">{label}</div>
                    <div className="font-semibold tabular-nums text-slate-900 dark:text-cyan-300 mt-0.5 truncate">
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ResultPanel>
        </div>

        <div className="xl:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ['histogram', 'Histogram'],
                  ['bar', 'Bar Chart'],
                  ['pie', 'Pie Chart'],
                  ['box', 'Box Plot'],
                  ['scatter', 'Scatter + Regression'],
                ] as [ChartKind, string][]
              ).map(([kind, label]) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setChartType(kind)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    chartType === kind
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {chartType === 'scatter' && regression.ok && (
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-300 px-2">
                {regression.equation} · R² = {regression.rSquared.toFixed(4)}
              </span>
            )}
          </div>

          <GraphPanel
            data={chartTraces}
            title={`Statistics · ${chartType.toUpperCase()}`}
            xLabel={chartType === 'scatter' ? 'X' : 'Value / Bin'}
            yLabel={chartType === 'scatter' ? 'Y' : 'Frequency / Value'}
            height={380}
            exportFilename={`nexus-stats-${chartType}`}
          />

          {stats.ok && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Frequency Distribution Table
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="py-2 text-left">Interval</th>
                      <th className="py-2 text-right">Count</th>
                      <th className="py-2 text-right">Relative Freq</th>
                      <th className="py-2 text-right">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                    {stats.frequencyBins.map((bin, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5">{bin.label}</td>
                        <td className="py-1.5 text-right tabular-nums text-cyan-600 dark:text-cyan-300">
                          {bin.count}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">
                          {(bin.relativeFrequency * 100).toFixed(1)}%
                        </td>
                        <td className="py-1.5 text-right tabular-nums">{bin.cumulativeFrequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
