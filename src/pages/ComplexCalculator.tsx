import { useState } from 'react';
import { GraphPanel } from '../components/GraphPanel';
import { ResultPanel } from '../components/ResultPanel';
import { useCalculator } from '../context/CalculatorContext';
import {
  computeComplexNthRoots,
  evaluateComplexBinary,
  evaluateComplexUnary,
  type ComplexCalcOutput,
} from '../engines/complexEngine';

export function ComplexCalculator() {
  const { addHistory } = useCalculator();
  const [z1, setZ1] = useState('2 + 3i');
  const [z2, setZ2] = useState('1 - 2i');
  const [rootOrder, setRootOrder] = useState(3);
  const [activeOp, setActiveOp] = useState('z₁ × z₂');
  const [output, setOutput] = useState<ComplexCalcOutput>(() =>
    evaluateComplexBinary('2 + 3i', '1 - 2i', 'mul')
  );

  const runBinary = (label: string, op: 'add' | 'sub' | 'mul' | 'div' | 'pow') => {
    setActiveOp(label);
    const res = evaluateComplexBinary(z1, z2, op);
    setOutput(res);
    if (res.ok && res.forms) {
      addHistory({
        module: 'Complex',
        expression: `(${z1}) ${label} (${z2})`,
        result: res.forms.rectangular,
      });
    }
  };

  const runUnary = (
    label: string,
    op:
      | 'analyze'
      | 'conj'
      | 'inv'
      | 'sqrt'
      | 'exp'
      | 'log'
      | 'sin'
      | 'cos'
      | 'tan'
      | 'sinh'
      | 'cosh'
      | 'tanh'
  ) => {
    setActiveOp(label);
    const res = evaluateComplexUnary(z1, op, rootOrder);
    setOutput(res);
    if (res.ok && res.forms) {
      addHistory({
        module: 'Complex',
        expression: `${label}: ${z1}`,
        result: res.forms.rectangular,
      });
    }
  };

  const runRoots = () => {
    setActiveOp(`${rootOrder}-th Roots of z₁`);
    const res = computeComplexNthRoots(z1, rootOrder);
    setOutput(res);
    if (res.ok && res.roots) {
      addHistory({
        module: 'Complex Roots',
        expression: `(${z1})^(1/${rootOrder})`,
        result: res.roots.map((r) => r.rectangular).join('; '),
      });
    }
  };

  const argandTraces = (() => {
    const traces: Record<string, unknown>[] = [];
    if (output.ok && output.forms) {
      const re = Number(output.forms.real);
      const im = Number(output.forms.imag);
      if (Number.isFinite(re) && Number.isFinite(im)) {
        traces.push({
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Result Vector',
          x: [0, re],
          y: [0, im],
          line: { color: '#06B6D4', width: 2.5 },
          marker: { size: 9, color: '#06B6D4' },
        });
      }
    }
    if (output.roots && output.roots.length > 0) {
      traces.push({
        type: 'scatter',
        mode: 'markers+text',
        name: `${rootOrder}-th Roots`,
        x: output.roots.map((r) => Number(r.real)),
        y: output.roots.map((r) => Number(r.imag)),
        text: output.roots.map((_, idx) => `w${idx}`),
        textposition: 'top right',
        marker: { size: 9, color: '#F59E0B' },
      });
    }
    return traces;
  })();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-6 space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Complex Number z₁
              </span>
              <input
                type="text"
                value={z1}
                onChange={(e) => setZ1(e.target.value)}
                placeholder="e.g. 2 + 3i"
                spellCheck={false}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-sm"
              />
            </label>

            <label className="space-y-1.5 text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Complex Number z₂
              </span>
              <input
                type="text"
                value={z2}
                onChange={(e) => setZ2(e.target.value)}
                placeholder="e.g. 1 - 2i"
                spellCheck={false}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-sm"
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Binary Operations (z₁, z₂)
            </div>
            <div className="grid grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => runBinary('z₁ + z₂', 'add')}
                className="py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono text-xs cursor-pointer"
              >
                z₁ + z₂
              </button>
              <button
                type="button"
                onClick={() => runBinary('z₁ − z₂', 'sub')}
                className="py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono text-xs cursor-pointer"
              >
                z₁ − z₂
              </button>
              <button
                type="button"
                onClick={() => runBinary('z₁ × z₂', 'mul')}
                className="py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs cursor-pointer"
              >
                z₁ × z₂
              </button>
              <button
                type="button"
                onClick={() => runBinary('z₁ ÷ z₂', 'div')}
                className="py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono text-xs cursor-pointer"
              >
                z₁ ÷ z₂
              </button>
              <button
                type="button"
                onClick={() => runBinary('z₁ ^ z₂', 'pow')}
                className="py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono text-xs cursor-pointer"
              >
                z₁^z₂
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Unary &amp; Transcendental Functions (on z₁)
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(
                [
                  ['Forms & Polar', 'analyze'],
                  ['Conjugate z*', 'conj'],
                  ['Reciprocal 1/z', 'inv'],
                  ['√z₁', 'sqrt'],
                  ['exp(z₁)', 'exp'],
                  ['ln(z₁)', 'log'],
                  ['sin(z₁)', 'sin'],
                  ['cos(z₁)', 'cos'],
                  ['tan(z₁)', 'tan'],
                  ['sinh(z₁)', 'sinh'],
                  ['cosh(z₁)', 'cosh'],
                  ['tanh(z₁)', 'tanh'],
                ] as const
              ).map(([label, op]) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => runUnary(label, op)}
                  className="py-2 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono text-xs cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="space-y-1 text-xs flex-1">
              <span className="text-slate-500 dark:text-slate-400">n-th Roots Order (n)</span>
              <input
                type="number"
                min={1}
                max={24}
                value={rootOrder}
                onChange={(e) => setRootOrder(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-sm"
              />
            </label>
            <button
              type="button"
              onClick={runRoots}
              className="px-4 py-2 rounded-lg border border-cyan-600 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 text-xs font-semibold cursor-pointer"
            >
              Compute n-th Roots
            </button>
          </div>
        </div>

        <ResultPanel
          title={`Result · ${activeOp}`}
          primaryValue={output.forms?.rectangular}
          secondaryValue={
            output.forms
              ? `Modulus |z| = ${output.forms.modulus} · Argument θ = ${output.forms.argumentDeg} (${output.forms.argumentRad} rad)`
              : undefined
          }
          error={output.error}
        >
          {output.forms && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800">
                <div className="text-slate-400 mb-0.5">Rectangular</div>
                <div className="text-slate-900 dark:text-slate-100">{output.forms.rectangular}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800">
                <div className="text-slate-400 mb-0.5">Polar (Degrees)</div>
                <div className="text-slate-900 dark:text-slate-100">{output.forms.polarDeg}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800">
                <div className="text-slate-400 mb-0.5">Euler Form</div>
                <div className="text-slate-900 dark:text-slate-100">{output.forms.euler}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800">
                <div className="text-slate-400 mb-0.5">Trigonometric Form</div>
                <div className="text-slate-900 dark:text-slate-100 break-all">
                  {output.forms.trigonometric}
                </div>
              </div>
            </div>
          )}

          {output.roots && output.roots.length > 0 && (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-1.5 text-left">Root</th>
                    <th className="py-1.5 text-left">Rectangular</th>
                    <th className="py-1.5 text-left">Polar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                  {output.roots.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1.5 text-amber-500">w{i}</td>
                      <td className="py-1.5">{r.rectangular}</td>
                      <td className="py-1.5 text-slate-400">{r.polarDeg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ResultPanel>
      </div>

      <div className="xl:col-span-6">
        <GraphPanel
          data={argandTraces}
          title="Argand Complex Plane"
          xLabel="Real Re(z)"
          yLabel="Imaginary Im(z)"
          height={520}
          exportFilename="nexus-argand-plane"
        />
      </div>
    </div>
  );
}
