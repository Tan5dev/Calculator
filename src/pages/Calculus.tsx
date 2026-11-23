import { useState } from 'react';
import type { LimitDir } from 'nerdamer/calculus';
import { EquationInput } from '../components/EquationInput';
import { ResultPanel } from '../components/ResultPanel';
import { useCalculator } from '../context/CalculatorContext';
import {
  computeDefiniteAndNumericalIntegral,
  computeDerivative,
  computeIndefiniteIntegral,
  computeLimit,
  computePartialAndGradient,
  computeTaylorSeries,
  findCriticalPoints,
  type CalculusOutput,
} from '../engines/calculusEngine';

type CalcTab =
  | 'derivative'
  | 'partial'
  | 'indefinite'
  | 'definite'
  | 'limit'
  | 'series'
  | 'critical';

export function Calculus() {
  const { addHistory } = useCalculator();
  const [tab, setTab] = useState<CalcTab>('derivative');

  const [expr, setExpr] = useState('x^3');
  const [variable, setVariable] = useState('x');
  const [order, setOrder] = useState(1);
  const [evalPoint, setEvalPoint] = useState('');

  // Integral bounds
  const [lowerA, setLowerA] = useState(0);
  const [upperB, setUpperB] = useState(2);
  const [subintervals, setSubintervals] = useState(60);

  // Limit
  const [approach, setApproach] = useState('0');
  const [limitDir, setLimitDir] = useState<LimitDir>('both');

  // Taylor
  const [center, setCenter] = useState(0);
  const [seriesOrder, setSeriesOrder] = useState(6);

  // Critical
  const [critMin, setCritMin] = useState(-10);
  const [critMax, setCritMax] = useState(10);

  const [output, setOutput] = useState<CalculusOutput | null>(() =>
    computeDerivative('x^3', 'x', 1)
  );
  const [partials, setPartials] = useState<{ variable: string; derivative: string }[]>([]);

  const runCompute = () => {
    setPartials([]);
    let out: CalculusOutput;
    if (tab === 'derivative') {
      const pt = evalPoint.trim() !== '' ? Number(evalPoint) : undefined;
      out = computeDerivative(expr, variable || 'x', order, pt);
    } else if (tab === 'partial') {
      const pRes = computePartialAndGradient(expr, ['x', 'y', 'z']);
      setPartials(pRes.partials);
      out = {
        ok: pRes.ok,
        symbolic: pRes.ok
          ? `∇f = (${pRes.partials.map((p) => p.derivative).join(', ')})`
          : undefined,
        error: pRes.error,
      };
    } else if (tab === 'indefinite') {
      out = computeIndefiniteIntegral(expr, variable || 'x');
    } else if (tab === 'definite') {
      out = computeDefiniteAndNumericalIntegral(
        expr,
        variable || 'x',
        lowerA,
        upperB,
        subintervals
      );
    } else if (tab === 'limit') {
      out = computeLimit(expr, variable || 'x', approach, limitDir);
    } else if (tab === 'series') {
      out = computeTaylorSeries(expr, variable || 'x', center, seriesOrder);
    } else {
      out = findCriticalPoints(expr, variable || 'x', critMin, critMax);
    }

    setOutput(out);
    if (out.ok) {
      addHistory({
        module: `Calculus (${tab})`,
        expression: expr,
        result: out.symbolic ?? out.numeric ?? 'Computed',
      });
    }
  };

  const tabs: [CalcTab, string, string][] = [
    ['derivative', 'Derivatives', 'x^3'],
    ['partial', 'Partial / Gradient', 'x^2*y + sin(y*z)'],
    ['indefinite', 'Indefinite Integral', '2*x'],
    ['definite', 'Definite & Numerical', 'sin(x)'],
    ['limit', 'Limits', 'sin(x)/x'],
    ['series', 'Taylor / Maclaurin', 'exp(x)'],
    ['critical', 'Critical Points', 'x^3 - 3*x + 1'],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
        {tabs.map(([id, label, sample]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setExpr(sample);
              setOutput(null);
              setPartials([]);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              tab === id
                ? 'bg-cyan-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-4 h-fit">
          <EquationInput
            label="Function Expression f(x)"
            value={expr}
            onChange={setExpr}
            onSubmit={runCompute}
            placeholder="e.g. x^3 + 2*sin(x)"
          />

          <div className="grid grid-cols-2 gap-3 text-xs">
            {tab !== 'partial' && (
              <label className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Variable</span>
                <input
                  type="text"
                  value={variable}
                  onChange={(e) => setVariable(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                />
              </label>
            )}

            {tab === 'derivative' && (
              <>
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Order (1–10)</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                <label className="space-y-1 col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Evaluate Derivative at {variable} = (optional)
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={evalPoint}
                    onChange={(e) => setEvalPoint(e.target.value)}
                    placeholder="Leave empty for symbolic only"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
              </>
            )}

            {tab === 'definite' && (
              <>
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Lower Bound a</span>
                  <input
                    type="number"
                    step="any"
                    value={lowerA}
                    onChange={(e) => setLowerA(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Upper Bound b</span>
                  <input
                    type="number"
                    step="any"
                    value={upperB}
                    onChange={(e) => setUpperB(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Subintervals (n)</span>
                  <input
                    type="number"
                    min={6}
                    max={6000}
                    step={6}
                    value={subintervals}
                    onChange={(e) => setSubintervals(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
              </>
            )}

            {tab === 'limit' && (
              <>
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Approaches (or Infinity)</span>
                  <input
                    type="text"
                    value={approach}
                    onChange={(e) => setApproach(e.target.value)}
                    placeholder="0, Infinity, -Infinity"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                <label className="space-y-1 col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">Direction</span>
                  <select
                    value={limitDir}
                    onChange={(e) => setLimitDir(e.target.value as LimitDir)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  >
                    <option value="both">Two-sided</option>
                    <option value="left">Left-sided (-)</option>
                    <option value="right">Right-sided (+)</option>
                  </select>
                </label>
              </>
            )}

            {tab === 'series' && (
              <>
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Center a (0 = Maclaurin)</span>
                  <input
                    type="number"
                    step="any"
                    value={center}
                    onChange={(e) => setCenter(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                <label className="space-y-1 col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">Polynomial Degree (1–14)</span>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={seriesOrder}
                    onChange={(e) => setSeriesOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
              </>
            )}

            {tab === 'critical' && (
              <>
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Search Min</span>
                  <input
                    type="number"
                    step="any"
                    value={critMin}
                    onChange={(e) => setCritMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Search Max</span>
                  <input
                    type="number"
                    step="any"
                    value={critMax}
                    onChange={(e) => setCritMax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={runCompute}
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Compute Calculus Result
          </button>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {output && (
            <ResultPanel
              title="Calculus Output"
              primaryValue={output.symbolic ?? output.numeric}
              secondaryValue={
                output.symbolic && output.numeric
                  ? `Numeric value: ${output.numeric}`
                  : output.latex
                    ? `TeX: ${output.latex}`
                    : undefined
              }
              error={output.error}
              steps={output.details}
            >
              {partials.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <th className="py-2 text-left">Partial</th>
                        <th className="py-2 text-left">Expression</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                      {partials.map((p) => (
                        <tr key={p.variable}>
                          <td className="py-2 text-cyan-600 dark:text-cyan-400">∂f/∂{p.variable}</td>
                          <td className="py-2">{p.derivative}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {output.numericalComparison && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <th className="py-2 text-left">Numerical Rule</th>
                        <th className="py-2 text-right">Estimate (n = {output.numericalComparison.subintervals})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                      <tr>
                        <td className="py-2">Trapezoidal Rule</td>
                        <td className="py-2 text-right tabular-nums">
                          {output.numericalComparison.trapezoidal.toPrecision(10)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2">Simpson&apos;s 1/3 Rule</td>
                        <td className="py-2 text-right tabular-nums text-cyan-600 dark:text-cyan-300 font-semibold">
                          {output.numericalComparison.simpson13.toPrecision(10)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2">Simpson&apos;s 3/8 Rule</td>
                        <td className="py-2 text-right tabular-nums">
                          {output.numericalComparison.simpson38.toPrecision(10)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {output.criticalPoints && (
                <div className="overflow-x-auto">
                  {output.criticalPoints.length === 0 ? (
                    <p className="text-xs text-slate-500">No critical points detected in this interval.</p>
                  ) : (
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                          <th className="py-2 text-right">x</th>
                          <th className="py-2 text-right">f(x)</th>
                          <th className="py-2 text-left pl-4">Classification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                        {output.criticalPoints.map((pt, idx) => (
                          <tr key={idx}>
                            <td className="py-2 text-right tabular-nums">{pt.x}</td>
                            <td className="py-2 text-right tabular-nums">{pt.fx}</td>
                            <td className="py-2 pl-4 text-cyan-600 dark:text-cyan-300">{pt.kind}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </ResultPanel>
          )}
        </div>
      </div>
    </div>
  );
}
