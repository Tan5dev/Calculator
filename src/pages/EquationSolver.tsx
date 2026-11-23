import { useState } from 'react';
import { EquationInput } from '../components/EquationInput';
import { ResultPanel } from '../components/ResultPanel';
import { useCalculator } from '../context/CalculatorContext';
import {
  bisectionMethod,
  newtonRaphsonMethod,
  secantMethod,
  solveCubic,
  solveEquationSystemSymbolic,
  solveLinear,
  solveLinearSystem2x2,
  solveLinearSystem3x3,
  solveQuadratic,
  solveSymbolicEquation,
  type EquationSolveOutput,
  type NumericalMethodOutput,
} from '../engines/equationEngine';

type SolverMode =
  | 'linear'
  | 'quadratic'
  | 'cubic'
  | 'symbolic'
  | 'system2'
  | 'system3'
  | 'systemSymbolic'
  | 'newton'
  | 'bisection'
  | 'secant';

export function EquationSolver() {
  const { addHistory } = useCalculator();
  const [mode, setMode] = useState<SolverMode>('quadratic');

  // Coefficients
  const [a, setA] = useState(1);
  const [b, setB] = useState(-5);
  const [c, setC] = useState(6);
  const [d, setD] = useState(0);

  // Symbolic
  const [symbolicExpr, setSymbolicExpr] = useState('x^3 - 6*x^2 + 11*x - 6 = 0');
  const [symbolicVar, setSymbolicVar] = useState('x');

  // 2x2 system
  const [s2, setS2] = useState({ a1: 2, b1: 1, c1: 5, a2: 1, b2: -1, c2: 1 });
  // 3x3 system
  const [s3, setS3] = useState<[number, number, number, number][]>([
    [2, 1, -1, 8],
    [-3, -1, 2, -11],
    [-2, 1, 2, -3],
  ]);
  const [sysText, setSysText] = useState('x + y = 10\nx - y = 2');

  // Numerical
  const [numExpr, setNumExpr] = useState('x^3 - x - 2');
  const [x0, setX0] = useState(1.5);
  const [x1, setX1] = useState(2);
  const [tol, setTol] = useState(1e-8);

  const [algebraOutput, setAlgebraOutput] = useState<EquationSolveOutput | null>(() =>
    solveQuadratic(1, -5, 6)
  );
  const [numericalOutput, setNumericalOutput] = useState<NumericalMethodOutput | null>(null);

  const runSolve = () => {
    setNumericalOutput(null);
    let out: EquationSolveOutput | null = null;
    let label = '';

    if (mode === 'linear') {
      out = solveLinear(a, b);
      label = `${a}x + ${b} = 0`;
    } else if (mode === 'quadratic') {
      out = solveQuadratic(a, b, c);
      label = `${a}x² + ${b}x + ${c} = 0`;
    } else if (mode === 'cubic') {
      out = solveCubic(a, b, c, d);
      label = `${a}x³ + ${b}x² + ${c}x + ${d} = 0`;
    } else if (mode === 'symbolic') {
      out = solveSymbolicEquation(symbolicExpr, symbolicVar || 'x');
      label = symbolicExpr;
    } else if (mode === 'system2') {
      out = solveLinearSystem2x2(s2.a1, s2.b1, s2.c1, s2.a2, s2.b2, s2.c2);
      label = `2×2 System`;
    } else if (mode === 'system3') {
      out = solveLinearSystem3x3(s3);
      label = `3×3 System`;
    } else if (mode === 'systemSymbolic') {
      out = solveEquationSystemSymbolic(sysText.split('\n'));
      label = sysText.split('\n').join('; ');
    }

    if (out) {
      setAlgebraOutput(out);
      if (out.ok && out.roots.length > 0) {
        addHistory({
          module: 'Equation Solver',
          expression: label,
          result: out.roots.map((r) => `${r.label} = ${r.value}`).join(', '),
        });
      }
      return;
    }

    setAlgebraOutput(null);
    let numOut: NumericalMethodOutput;
    if (mode === 'newton') {
      numOut = newtonRaphsonMethod(numExpr, x0, tol);
    } else if (mode === 'bisection') {
      numOut = bisectionMethod(numExpr, x0, x1, tol);
    } else {
      numOut = secantMethod(numExpr, x0, x1, tol);
    }
    setNumericalOutput(numOut);
    if (numOut.ok && numOut.root !== undefined) {
      addHistory({
        module: `Numerical (${mode})`,
        expression: `${numExpr} = 0`,
        result: `x ≈ ${numOut.root.toPrecision(10)}`,
      });
    }
  };

  const tabs: [SolverMode, string][] = [
    ['linear', 'Linear'],
    ['quadratic', 'Quadratic'],
    ['cubic', 'Cubic'],
    ['symbolic', 'Polynomial / Symbolic'],
    ['system2', '2-Var System'],
    ['system3', '3-Var System'],
    ['systemSymbolic', 'General System'],
    ['newton', 'Newton-Raphson'],
    ['bisection', 'Bisection'],
    ['secant', 'Secant'],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setAlgebraOutput(null);
              setNumericalOutput(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              mode === id
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
          {(mode === 'linear' || mode === 'quadratic' || mode === 'cubic') && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {mode === 'linear' && 'ax + b = 0'}
                {mode === 'quadratic' && 'ax² + bx + c = 0'}
                {mode === 'cubic' && 'ax³ + bx² + cx + d = 0'}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Coefficient a</span>
                  <input
                    type="number"
                    step="any"
                    value={a}
                    onChange={(e) => setA(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Coefficient b</span>
                  <input
                    type="number"
                    step="any"
                    value={b}
                    onChange={(e) => setB(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                {(mode === 'quadratic' || mode === 'cubic') && (
                  <label className="space-y-1">
                    <span className="text-slate-500 dark:text-slate-400">Coefficient c</span>
                    <input
                      type="number"
                      step="any"
                      value={c}
                      onChange={(e) => setC(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                    />
                  </label>
                )}
                {mode === 'cubic' && (
                  <label className="space-y-1">
                    <span className="text-slate-500 dark:text-slate-400">Coefficient d</span>
                    <input
                      type="number"
                      step="any"
                      value={d}
                      onChange={(e) => setD(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {mode === 'symbolic' && (
            <div className="space-y-3">
              <EquationInput
                label="Equation or Polynomial"
                value={symbolicExpr}
                onChange={setSymbolicExpr}
                onSubmit={runSolve}
                placeholder="e.g. x^2 - 5*x + 6 = 0"
                helperText="Supports linear, quadratic, higher-degree polynomials, and symbolic equations."
              />
              <EquationInput
                label="Solve for Variable"
                value={symbolicVar}
                onChange={setSymbolicVar}
                onSubmit={runSolve}
                placeholder="x"
              />
            </div>
          )}

          {mode === 'system2' && (
            <div className="space-y-3 text-xs">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                a₁x + b₁y = c₁ &amp; a₂x + b₂y = c₂
              </div>
              {(['1', '2'] as const).map((row) => (
                <div key={row} className="grid grid-cols-3 gap-2">
                  {(['a', 'b', 'c'] as const).map((col) => {
                    const key = `${col}${row}` as keyof typeof s2;
                    return (
                      <label key={key} className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400">{key}</span>
                        <input
                          type="number"
                          step="any"
                          value={s2[key]}
                          onChange={(e) =>
                            setS2((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                        />
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {mode === 'system3' && (
            <div className="space-y-3 text-xs">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                aᵢx + bᵢy + cᵢz = dᵢ
              </div>
              {s3.map((row, ri) => (
                <div key={ri} className="grid grid-cols-4 gap-2">
                  {row.map((val, ci) => (
                    <input
                      key={ci}
                      type="number"
                      step="any"
                      aria-label={`Eq ${ri + 1} col ${ci + 1}`}
                      value={val}
                      onChange={(e) => {
                        const next = s3.map((r, rIdx) =>
                          rIdx === ri
                            ? (r.map((v, cIdx) => (cIdx === ci ? Number(e.target.value) : v)) as [
                                number,
                                number,
                                number,
                                number,
                              ])
                            : r
                        );
                        setS3(next);
                      }}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-center"
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {mode === 'systemSymbolic' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Equations (one per line)
              </label>
              <textarea
                rows={4}
                value={sysText}
                onChange={(e) => setSysText(e.target.value)}
                spellCheck={false}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-sm"
              />
            </div>
          )}

          {(mode === 'newton' || mode === 'bisection' || mode === 'secant') && (
            <div className="space-y-3">
              <EquationInput
                label="f(x) = 0 Expression"
                value={numExpr}
                onChange={setNumExpr}
                onSubmit={runSolve}
                placeholder="x^3 - x - 2"
              />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    {mode === 'bisection' ? 'Lower Bound a' : 'Initial Guess x₀'}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={x0}
                    onChange={(e) => setX0(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
                {mode !== 'newton' && (
                  <label className="space-y-1">
                    <span className="text-slate-500 dark:text-slate-400">
                      {mode === 'bisection' ? 'Upper Bound b' : 'Second Guess x₁'}
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={x1}
                      onChange={(e) => setX1(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                    />
                  </label>
                )}
                <label className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400">Tolerance</span>
                  <input
                    type="number"
                    step="any"
                    value={tol}
                    onChange={(e) => setTol(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
                  />
                </label>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={runSolve}
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Solve Equation
          </button>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {algebraOutput && (
            <ResultPanel
              title="Solutions &amp; Verification"
              primaryValue={
                algebraOutput.ok
                  ? algebraOutput.roots.map((r) => `${r.label} = ${r.value}`).join(' ,  ')
                  : undefined
              }
              secondaryValue={
                algebraOutput.discriminant !== undefined
                  ? `Discriminant Δ = ${algebraOutput.discriminant}`
                  : undefined
              }
              error={algebraOutput.error}
              steps={algebraOutput.steps}
            >
              {algebraOutput.ok && algebraOutput.roots.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="py-2 text-left font-medium">Root</th>
                        <th className="py-2 text-left font-medium">Value</th>
                        <th className="py-2 text-left font-medium">Type</th>
                        <th className="py-2 text-right font-medium">|Residual|</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                      {algebraOutput.roots.map((r, i) => (
                        <tr key={i}>
                          <td className="py-2 font-semibold text-cyan-600 dark:text-cyan-400">
                            {r.label}
                          </td>
                          <td className="py-2 text-slate-900 dark:text-slate-100">
                            {r.value}
                            {r.numericApprox && (
                              <span className="text-slate-400 ml-2">(≈ {r.numericApprox})</span>
                            )}
                          </td>
                          <td className="py-2 text-slate-500 dark:text-slate-400">
                            {r.isComplex ? 'Complex' : 'Real'}
                          </td>
                          <td className="py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                            {r.residual ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ResultPanel>
          )}

          {numericalOutput && (
            <ResultPanel
              title="Numerical Convergence"
              primaryValue={
                numericalOutput.ok && numericalOutput.root !== undefined
                  ? `x ≈ ${numericalOutput.root.toPrecision(10)}`
                  : undefined
              }
              secondaryValue={
                numericalOutput.fx !== undefined
                  ? `Verification f(x) = ${numericalOutput.fx.toExponential(3)} · ${
                      numericalOutput.converged ? 'Converged' : 'Max iterations reached'
                    }`
                  : undefined
              }
              error={numericalOutput.error}
              steps={numericalOutput.steps}
            >
              {numericalOutput.iterations.length > 0 && (
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="py-2 text-left font-medium">Iter</th>
                        <th className="py-2 text-right font-medium">x</th>
                        <th className="py-2 text-right font-medium">f(x)</th>
                        <th className="py-2 text-right font-medium">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                      {numericalOutput.iterations.map((row) => (
                        <tr key={row.iteration}>
                          <td className="py-1.5 text-slate-500">{row.iteration}</td>
                          <td className="py-1.5 text-right tabular-nums">{row.x.toPrecision(8)}</td>
                          <td className="py-1.5 text-right tabular-nums">{row.fx.toExponential(3)}</td>
                          <td className="py-1.5 text-right tabular-nums">{row.error.toExponential(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ResultPanel>
          )}
        </div>
      </div>
    </div>
  );
}
