import { useCallback, useState } from 'react';
import { CalculatorDisplay } from '../components/CalculatorDisplay';
import { CalculatorKeypad, type KeypadButtonConfig } from '../components/CalculatorKeypad';
import { useCalculator } from '../context/CalculatorContext';
import { evaluateExpression } from '../engines/expressionEngine';
import type { AngleMode } from '../types/calculator';
import { PHYSICAL_CONSTANTS } from '../utils/constantsData';

export function ScientificCalculator() {
  const {
    settings,
    setAngleMode,
    addHistory,
    memory,
    memoryClear,
    memoryRecall,
    memoryStore,
    memoryAdd,
    memorySubtract,
    lastAnswer,
    setLastAnswer,
  } = useCalculator();

  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [secondaryResult, setSecondaryResult] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [shiftMode, setShiftMode] = useState(false);

  const append = useCallback((token: string) => {
    setError(undefined);
    setExpression((prev) => prev + token);
  }, []);

  const handleEvaluate = useCallback(
    (overrideExpr?: string) => {
      const target = (overrideExpr ?? expression).trim();
      if (!target) return;

      const evalRes = evaluateExpression(target, settings, {
        ans: lastAnswer,
        memory,
      });

      if (!evalRes.ok) {
        setError(evalRes.error ?? 'Evaluation failed');
        return;
      }

      setError(undefined);
      setResult(evalRes.value);
      const secParts: string[] = [];
      if (evalRes.fractionValue) secParts.push(`Exact/Approx Fraction: ${evalRes.fractionValue}`);
      if (evalRes.scientificValue) secParts.push(`Sci: ${evalRes.scientificValue}`);
      setSecondaryResult(secParts.join(' · ') || undefined);

      if (evalRes.numericValue !== undefined) {
        setLastAnswer(evalRes.numericValue);
      }

      addHistory({
        module: `Scientific (${settings.angleMode})`,
        expression: target,
        result: evalRes.value,
      });
    },
    [expression, settings, lastAnswer, memory, setLastAnswer, addHistory]
  );

  const currentNumeric = () => {
    const res = evaluateExpression(expression || result, settings, { ans: lastAnswer, memory });
    return res.ok && res.numericValue !== undefined ? res.numericValue : Number(result) || 0;
  };

  const sciButtons: KeypadButtonConfig[] = [
    {
      label: shiftMode ? '2nd (ON)' : '2nd',
      variant: shiftMode ? 'primary' : 'utility',
      action: () => setShiftMode((s) => !s),
    },
    { label: shiftMode ? 'asin(' : 'sin(', variant: 'operator', action: () => append(shiftMode ? 'asin(' : 'sin(') },
    { label: shiftMode ? 'acos(' : 'cos(', variant: 'operator', action: () => append(shiftMode ? 'acos(' : 'cos(') },
    { label: shiftMode ? 'atan(' : 'tan(', variant: 'operator', action: () => append(shiftMode ? 'atan(' : 'tan(') },
    { label: shiftMode ? 'asinh(' : 'sinh(', variant: 'operator', action: () => append(shiftMode ? 'asinh(' : 'sinh(') },
    { label: shiftMode ? 'acosh(' : 'cosh(', variant: 'operator', action: () => append(shiftMode ? 'acosh(' : 'cosh(') },

    { label: shiftMode ? 'atanh(' : 'tanh(', variant: 'operator', action: () => append(shiftMode ? 'atanh(' : 'tanh(') },
    { label: 'sec(', variant: 'operator', action: () => append('sec(') },
    { label: 'csc(', variant: 'operator', action: () => append('csc(') },
    { label: 'cot(', variant: 'operator', action: () => append('cot(') },
    { label: 'π', variant: 'utility', action: () => append('pi') },
    { label: 'e', variant: 'utility', action: () => append('e') },

    { label: 'ln(', variant: 'operator', action: () => append('ln(') },
    { label: 'log10(', variant: 'operator', action: () => append('log10(') },
    { label: 'log_b(x,b)', variant: 'operator', action: () => append('log(') },
    { label: 'e^x', variant: 'operator', action: () => append('exp(') },
    { label: '10^x', variant: 'operator', action: () => append('10^(') },
    { label: 'x^y', variant: 'operator', action: () => append('^') },

    { label: 'sqrt(', variant: 'operator', action: () => append('sqrt(') },
    { label: 'cbrt(', variant: 'operator', action: () => append('cbrt(') },
    { label: 'n√(x,n)', variant: 'operator', action: () => append('nthRoot(') },
    { label: 'x²', variant: 'utility', action: () => append('^2') },
    { label: 'x³', variant: 'utility', action: () => append('^3') },
    { label: '1/x', variant: 'utility', action: () => setExpression((p) => (p ? `1/(${p})` : '1/(')) },

    { label: 'nPr(', variant: 'operator', action: () => append('nPr(') },
    { label: 'nCr(', variant: 'operator', action: () => append('nCr(') },
    { label: 'gcd(', variant: 'operator', action: () => append('gcd(') },
    { label: 'lcm(', variant: 'operator', action: () => append('lcm(') },
    { label: 'fact(', variant: 'operator', action: () => append('fact(') },
    { label: 'abs(', variant: 'operator', action: () => append('abs(') },
  ];

  const mainButtons: KeypadButtonConfig[] = [
    { label: 'MC', variant: 'utility', action: memoryClear },
    { label: 'MR', variant: 'utility', action: () => append(String(memoryRecall())) },
    { label: 'M+', variant: 'utility', action: () => memoryAdd(currentNumeric()) },
    { label: 'M-', variant: 'utility', action: () => memorySubtract(currentNumeric()) },
    { label: 'MS', variant: 'utility', action: () => memoryStore(currentNumeric()) },
    { label: ',', variant: 'utility', action: () => append(', ') },

    { label: '(', variant: 'utility', action: () => append('(') },
    { label: ')', variant: 'utility', action: () => append(')') },
    { label: '×10^', variant: 'utility', action: () => append('*10^') },
    { label: 'mod', variant: 'utility', action: () => append(' mod ') },
    { label: '⌫', variant: 'danger', action: () => setExpression((p) => p.slice(0, -1)) },
    {
      label: 'C',
      variant: 'danger',
      action: () => {
        setExpression('');
        setResult('0');
        setSecondaryResult(undefined);
        setError(undefined);
      },
    },

    { label: '7', action: () => append('7') },
    { label: '8', action: () => append('8') },
    { label: '9', action: () => append('9') },
    { label: '÷', variant: 'operator', action: () => append('/') },
    { label: '%', variant: 'utility', action: () => append('%') },
    { label: 'Ans', variant: 'utility', action: () => append('Ans') },

    { label: '4', action: () => append('4') },
    { label: '5', action: () => append('5') },
    { label: '6', action: () => append('6') },
    { label: '×', variant: 'operator', action: () => append('*') },
    { label: 'φ', variant: 'utility', action: () => append('phi') },
    { label: 'τ', variant: 'utility', action: () => append('tau') },

    { label: '1', action: () => append('1') },
    { label: '2', action: () => append('2') },
    { label: '3', action: () => append('3') },
    { label: '−', variant: 'operator', action: () => append('-') },
    { label: '0', action: () => append('0') },
    { label: '.', action: () => append('.') },

    { label: 'floor(', variant: 'utility', action: () => append('floor(') },
    { label: 'ceil(', variant: 'utility', action: () => append('ceil(') },
    { label: 'round(', variant: 'utility', action: () => append('round(') },
    { label: '+', variant: 'operator', action: () => append('+') },
    { label: '=', variant: 'primary', colSpan: 2, action: () => handleEvaluate() },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-9 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            {(['DEG', 'RAD', 'GRAD'] as AngleMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAngleMode(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                  settings.angleMode === mode
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Examples: sin(30), log(8, 2), nCr(10, 3), gcd(24, 36)
          </div>
        </div>

        <CalculatorDisplay
          expression={expression}
          onExpressionChange={(v) => {
            setError(undefined);
            setExpression(v);
          }}
          onEvaluate={() => handleEvaluate()}
          result={result}
          secondaryResult={secondaryResult}
          error={error}
          placeholder="Enter scientific expression (e.g. sin(30) + log10(1000))"
        />

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 space-y-3">
          <CalculatorKeypad buttons={sciButtons} columns={6} />
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <CalculatorKeypad buttons={mainButtons} columns={6} />
          </div>
        </div>
      </div>

      <aside className="xl:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 space-y-3 h-fit">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Quick Constants
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click to insert into expression
          </p>
        </div>
        <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
          {PHYSICAL_CONSTANTS.map((c) => (
            <button
              key={c.insertToken}
              type="button"
              onClick={() => append(c.insertToken)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 text-left transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 mr-1.5">{c.symbol}</span>
                  {c.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {c.displayValue} {c.unit !== 'dimensionless' ? c.unit : ''}
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">{c.insertToken}</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
