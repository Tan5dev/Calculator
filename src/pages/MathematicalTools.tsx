import { useState } from 'react';
import { ResultPanel } from '../components/ResultPanel';
import {
  analyzeNumberProperties,
  computeArithmeticProgression,
  computeGeometricProgression,
  evaluateSeries,
  gcdAndLcmList,
  generateFibonacci,
  generateRandomValues,
  isPrimeNumber,
  primeFactorization,
} from '../engines/mathToolsEngine';
import { formatNumber } from '../utils/formatters';

type ToolTab =
  | 'prime'
  | 'gcdlcm'
  | 'fibonacci'
  | 'progressions'
  | 'properties'
  | 'series'
  | 'random';

export function MathematicalTools() {
  const [tab, setTab] = useState<ToolTab>('prime');

  // Prime & factorization
  const [primeInput, setPrimeInput] = useState(360);

  // GCD / LCM
  const [gcdInput, setGcdInput] = useState('24, 36, 60');

  // Fibonacci
  const [fibCount, setFibCount] = useState(15);

  // Progressions
  const [progType, setProgType] = useState<'ap' | 'gp'>('ap');
  const [pA1, setPA1] = useState(2);
  const [pStep, setPStep] = useState(3);
  const [pN, setPN] = useState(10);

  // Properties
  const [propNum, setPropNum] = useState(28);

  // Series
  const [seriesExpr, setSeriesExpr] = useState('1 / (k^2)');
  const [seriesVar, setSeriesVar] = useState('k');
  const [seriesStart, setSeriesStart] = useState(1);
  const [seriesEnd, setSeriesEnd] = useState(100);
  const [seriesMode, setSeriesMode] = useState<'sum' | 'product'>('sum');

  // Random
  const [rngMode, setRngMode] = useState<'integer' | 'float' | 'normal' | 'unique'>('integer');
  const [rngMin, setRngMin] = useState(1);
  const [rngMax, setRngMax] = useState(100);
  const [rngMean, setRngMean] = useState(0);
  const [rngStd, setRngStd] = useState(1);
  const [rngCount, setRngCount] = useState(10);
  const [rngValues, setRngValues] = useState<number[]>(() =>
    generateRandomValues({ mode: 'integer', min: 1, max: 100, mean: 0, stdDev: 1, count: 10 }).values ?? []
  );
  const [rngError, setRngError] = useState<string | undefined>(undefined);

  const primeRes = primeFactorization(primeInput);
  const isPrime = isPrimeNumber(primeInput);

  const gcdNums = gcdInput
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
  const gcdRes = gcdAndLcmList(gcdNums);

  const fibRes = generateFibonacci(fibCount);

  const apRes = computeArithmeticProgression(pA1, pStep, pN);
  const gpRes = computeGeometricProgression(pA1, pStep, pN);

  const propRes = analyzeNumberProperties(propNum);

  const seriesRes = evaluateSeries(seriesExpr, seriesVar || 'k', seriesStart, seriesEnd, seriesMode);

  const runRng = () => {
    const out = generateRandomValues({
      mode: rngMode,
      min: rngMin,
      max: rngMax,
      mean: rngMean,
      stdDev: rngStd,
      count: rngCount,
    });
    if (!out.ok) {
      setRngError(out.error);
    } else {
      setRngError(undefined);
      setRngValues(out.values ?? []);
    }
  };

  const tabs: [ToolTab, string][] = [
    ['prime', 'Primes & Factorization'],
    ['gcdlcm', 'HCF / GCD & LCM'],
    ['fibonacci', 'Fibonacci'],
    ['progressions', 'AP & GP'],
    ['properties', 'Number Properties'],
    ['series', 'Series Σ / Π'],
    ['random', 'Random Generator'],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
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

      {tab === 'prime' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-3 h-fit">
            <label className="block space-y-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Integer (n ≥ 2)</span>
              <input
                type="number"
                value={primeInput}
                onChange={(e) => setPrimeInput(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-base"
              />
            </label>
          </div>
          <div className="lg:col-span-8">
            <ResultPanel
              title="Prime Check &amp; Factorization"
              primaryValue={primeRes.ok ? primeRes.canonical : undefined}
              secondaryValue={
                Number.isInteger(primeInput)
                  ? `${primeInput} is ${isPrime ? 'PRIME' : 'COMPOSITE / NOT PRIME'}`
                  : undefined
              }
              error={primeRes.error}
            />
          </div>
        </div>
      )}

      {tab === 'gcdlcm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-3 h-fit">
            <label className="block space-y-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Integers (comma or space separated)
              </span>
              <input
                type="text"
                value={gcdInput}
                onChange={(e) => setGcdInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-sm"
              />
            </label>
          </div>
          <div className="lg:col-span-8">
            <ResultPanel
              title="HCF / GCD &amp; LCM"
              primaryValue={
                gcdRes.ok ? `HCF (GCD) = ${gcdRes.gcd}   ·   LCM = ${gcdRes.lcm}` : undefined
              }
              error={gcdRes.error}
            />
          </div>
        </div>
      )}

      {tab === 'fibonacci' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-3 h-fit">
            <label className="block space-y-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Number of Terms (1–200)</span>
              <input
                type="number"
                min={1}
                max={200}
                value={fibCount}
                onChange={(e) => setFibCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-base"
              />
            </label>
          </div>
          <div className="lg:col-span-8">
            <ResultPanel
              title="Fibonacci Sequence"
              primaryValue={fibRes.ok ? `F(${fibCount - 1}) = ${fibRes.nthTerm}` : undefined}
              secondaryValue={
                fibRes.ok
                  ? `Sum = ${fibRes.sum}${
                      fibRes.ratioApprox ? ` · Ratio ≈ ${fibRes.ratioApprox.toFixed(8)}` : ''
                    }`
                  : undefined
              }
              error={fibRes.error}
            >
              {fibRes.sequence && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800 font-mono text-xs leading-relaxed break-words">
                  {fibRes.sequence.join(', ')}
                </div>
              )}
            </ResultPanel>
          </div>
        </div>
      )}

      {tab === 'progressions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-4 h-fit">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProgType('ap')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                  progType === 'ap'
                    ? 'bg-cyan-600 text-white'
                    : 'border border-slate-200 dark:border-slate-700'
                }`}
              >
                Arithmetic (AP)
              </button>
              <button
                type="button"
                onClick={() => setProgType('gp')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                  progType === 'gp'
                    ? 'bg-cyan-600 text-white'
                    : 'border border-slate-200 dark:border-slate-700'
                }`}
              >
                Geometric (GP)
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="text-slate-500">First Term (a₁)</span>
                <input
                  type="number"
                  step="any"
                  value={pA1}
                  onChange={(e) => setPA1(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-slate-500">
                  {progType === 'ap' ? 'Common Difference (d)' : 'Common Ratio (r)'}
                </span>
                <input
                  type="number"
                  step="any"
                  value={pStep}
                  onChange={(e) => setPStep(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-slate-500">Terms Count (n)</span>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={pN}
                  onChange={(e) => setPN(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                />
              </label>
            </div>
          </div>
          <div className="lg:col-span-8">
            {progType === 'ap' ? (
              <ResultPanel
                title="Arithmetic Progression"
                primaryValue={apRes.ok ? `aₙ = ${formatNumber(apRes.an!)} · Sₙ = ${formatNumber(apRes.sn!)}` : undefined}
                error={apRes.error}
              >
                {apRes.terms && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] font-mono text-xs">
                    First {apRes.terms.length} terms: {apRes.terms.map((t) => formatNumber(t)).join(', ')}
                  </div>
                )}
              </ResultPanel>
            ) : (
              <ResultPanel
                title="Geometric Progression"
                primaryValue={gpRes.ok ? `aₙ = ${formatNumber(gpRes.an!)} · Sₙ = ${formatNumber(gpRes.sn!)}` : undefined}
                secondaryValue={
                  gpRes.ok && gpRes.sInf !== null && gpRes.sInf !== undefined
                    ? `Infinite sum S∞ = ${formatNumber(gpRes.sInf)}`
                    : gpRes.ok
                      ? 'Infinite series diverges (|r| ≥ 1)'
                      : undefined
                }
                error={gpRes.error}
              >
                {gpRes.terms && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] font-mono text-xs">
                    First {gpRes.terms.length} terms: {gpRes.terms.map((t) => formatNumber(t)).join(', ')}
                  </div>
                )}
              </ResultPanel>
            )}
          </div>
        </div>
      )}

      {tab === 'properties' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-3 h-fit">
            <label className="block space-y-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Non-negative Integer</span>
              <input
                type="number"
                value={propNum}
                onChange={(e) => setPropNum(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-base"
              />
            </label>
          </div>
          <div className="lg:col-span-8">
            <ResultPanel
              title="Number Properties"
              primaryValue={propRes.ok ? `${propRes.n} — ${propRes.parity}, ${propRes.classification}` : undefined}
              error={propRes.error}
            >
              {propRes.ok && (
                <div className="space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      ['Prime', propRes.isPrime ? 'Yes' : 'No'],
                      ['Perfect Square', propRes.isPerfectSquare ? 'Yes' : 'No'],
                      ['Perfect Cube', propRes.isPerfectCube ? 'Yes' : 'No'],
                      ['Triangular', propRes.isTriangular ? 'Yes' : 'No'],
                      ['Armstrong', propRes.isArmstrong ? 'Yes' : 'No'],
                      ['Palindrome', propRes.isPalindrome ? 'Yes' : 'No'],
                      ['Digit Sum', String(propRes.digitSum)],
                      ['Divisor Count', String(propRes.divisorCount)],
                      ['Proper Divisor Sum', String(propRes.properDivisorSum)],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800"
                      >
                        <div className="text-slate-400">{k}</div>
                        <div className="font-semibold text-cyan-600 dark:text-cyan-300 mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800">
                    Divisors: {propRes.divisors?.join(', ') || 'None'}
                  </div>
                </div>
              )}
            </ResultPanel>
          </div>
        </div>
      )}

      {tab === 'series' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-3 h-fit text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSeriesMode('sum')}
                className={`flex-1 py-2 rounded-lg font-medium cursor-pointer ${
                  seriesMode === 'sum'
                    ? 'bg-cyan-600 text-white'
                    : 'border border-slate-200 dark:border-slate-700'
                }`}
              >
                Summation Σ
              </button>
              <button
                type="button"
                onClick={() => setSeriesMode('product')}
                className={`flex-1 py-2 rounded-lg font-medium cursor-pointer ${
                  seriesMode === 'product'
                    ? 'bg-cyan-600 text-white'
                    : 'border border-slate-200 dark:border-slate-700'
                }`}
              >
                Product Π
              </button>
            </div>
            <label className="block space-y-1">
              <span className="text-slate-500">Term Formula f(k)</span>
              <input
                type="text"
                value={seriesExpr}
                onChange={(e) => setSeriesExpr(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-sm"
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="space-y-1">
                <span className="text-slate-500">Index</span>
                <input
                  type="text"
                  value={seriesVar}
                  onChange={(e) => setSeriesVar(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">Start</span>
                <input
                  type="number"
                  value={seriesStart}
                  onChange={(e) => setSeriesStart(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">End</span>
                <input
                  type="number"
                  value={seriesEnd}
                  onChange={(e) => setSeriesEnd(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                />
              </label>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ResultPanel
              title="Series Result"
              primaryValue={seriesRes.ok && seriesRes.value !== undefined ? formatNumber(seriesRes.value) : undefined}
              error={seriesRes.error}
              steps={seriesRes.termsPreview?.map((t) => `${seriesVar} = ${t}`)}
            />
          </div>
        </div>
      )}

      {tab === 'random' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-3 h-fit text-xs">
            <label className="block space-y-1">
              <span className="text-slate-500">Distribution Mode</span>
              <select
                value={rngMode}
                onChange={(e) =>
                  setRngMode(e.target.value as 'integer' | 'float' | 'normal' | 'unique')
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19]"
              >
                <option value="integer">Uniform Integers</option>
                <option value="unique">Unique Integers (Sampling)</option>
                <option value="float">Uniform Floats</option>
                <option value="normal">Normal / Gaussian (Box-Muller)</option>
              </select>
            </label>

            {rngMode === 'normal' ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-slate-500">Mean (μ)</span>
                  <input
                    type="number"
                    step="any"
                    value={rngMean}
                    onChange={(e) => setRngMean(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-500">Std Dev (σ)</span>
                  <input
                    type="number"
                    step="any"
                    value={rngStd}
                    onChange={(e) => setRngStd(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-slate-500">Min</span>
                  <input
                    type="number"
                    step="any"
                    value={rngMin}
                    onChange={(e) => setRngMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-500">Max</span>
                  <input
                    type="number"
                    step="any"
                    value={rngMax}
                    onChange={(e) => setRngMax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
              </div>
            )}

            <label className="block space-y-1">
              <span className="text-slate-500">Sample Count (1–500)</span>
              <input
                type="number"
                min={1}
                max={500}
                value={rngCount}
                onChange={(e) => setRngCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
              />
            </label>

            <button
              type="button"
              onClick={runRng}
              className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold cursor-pointer"
            >
              Generate Numbers
            </button>
          </div>
          <div className="lg:col-span-7">
            <ResultPanel
              title="Generated Random Values"
              primaryValue={rngValues.join(', ')}
              error={rngError}
            />
          </div>
        </div>
      )}
    </div>
  );
}
