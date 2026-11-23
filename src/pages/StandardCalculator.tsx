import { useCallback, useEffect, useState } from 'react';
import { CalculatorDisplay } from '../components/CalculatorDisplay';
import { CalculatorKeypad, type KeypadButtonConfig } from '../components/CalculatorKeypad';
import { HistoryPanel } from '../components/HistoryPanel';
import { useCalculator } from '../context/CalculatorContext';
import { evaluateExpression } from '../engines/expressionEngine';

export function StandardCalculator() {
  const {
    settings,
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
      if (evalRes.fractionValue) secParts.push(`Fraction: ${evalRes.fractionValue}`);
      if (evalRes.scientificValue) secParts.push(`Sci: ${evalRes.scientificValue}`);
      setSecondaryResult(secParts.join(' · ') || undefined);

      if (evalRes.numericValue !== undefined) {
        setLastAnswer(evalRes.numericValue);
      }
      addHistory({
        module: 'Standard',
        expression: target,
        result: evalRes.value,
      });
    },
    [expression, settings, lastAnswer, memory, setLastAnswer, addHistory]
  );

  const handleUnaryWrap = (fnName: string, suffix = '') => {
    const base = expression.trim() || result || '0';
    const next = suffix ? `(${base})${suffix}` : `${fnName}(${base})`;
    setExpression(next);
    handleEvaluate(next);
  };

  const handleClear = () => {
    setExpression('');
    setResult('0');
    setSecondaryResult(undefined);
    setError(undefined);
  };

  const handleBackspace = () => {
    setError(undefined);
    setExpression((prev) => prev.slice(0, -1));
  };

  const currentNumeric = () => {
    const res = evaluateExpression(expression || result, settings, { ans: lastAnswer, memory });
    return res.ok && res.numericValue !== undefined ? res.numericValue : Number(result) || 0;
  };

  useEffect(() => {
    if (!settings.keyboardShortcuts) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if (/^[0-9+\-*/().%^]$/.test(e.key)) {
        e.preventDefault();
        append(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [settings.keyboardShortcuts, append, handleEvaluate]);

  const memoryButtons: KeypadButtonConfig[] = [
    { label: 'MC', ariaLabel: 'Memory Clear', variant: 'utility', action: memoryClear },
    {
      label: 'MR',
      ariaLabel: 'Memory Recall',
      variant: 'utility',
      action: () => append(String(memoryRecall())),
    },
    {
      label: 'M+',
      ariaLabel: 'Memory Add',
      variant: 'utility',
      action: () => memoryAdd(currentNumeric()),
    },
    {
      label: 'M-',
      ariaLabel: 'Memory Subtract',
      variant: 'utility',
      action: () => memorySubtract(currentNumeric()),
    },
    {
      label: 'MS',
      ariaLabel: 'Memory Store',
      variant: 'utility',
      action: () => memoryStore(currentNumeric()),
    },
  ];

  const mainButtons: KeypadButtonConfig[] = [
    { label: '(', variant: 'utility', action: () => append('(') },
    { label: ')', variant: 'utility', action: () => append(')') },
    { label: '%', ariaLabel: 'Percent', variant: 'utility', action: () => append('%') },
    { label: 'mod', ariaLabel: 'Modulo', variant: 'utility', action: () => append(' mod ') },

    { label: 'x²', ariaLabel: 'Square', variant: 'utility', action: () => handleUnaryWrap('', '^2') },
    { label: 'x³', ariaLabel: 'Cube', variant: 'utility', action: () => handleUnaryWrap('', '^3') },
    { label: '√x', ariaLabel: 'Square root', variant: 'utility', action: () => handleUnaryWrap('sqrt') },
    { label: '∛x', ariaLabel: 'Cube root', variant: 'utility', action: () => handleUnaryWrap('cbrt') },

    { label: '1/x', ariaLabel: 'Reciprocal', variant: 'utility', action: () => handleUnaryWrap('1/') },
    { label: 'x!', ariaLabel: 'Factorial', variant: 'utility', action: () => handleUnaryWrap('fact') },
    { label: '⌫', ariaLabel: 'Backspace', variant: 'danger', action: handleBackspace },
    { label: 'C', ariaLabel: 'Clear all', variant: 'danger', action: handleClear },

    { label: '7', action: () => append('7') },
    { label: '8', action: () => append('8') },
    { label: '9', action: () => append('9') },
    { label: '÷', ariaLabel: 'Divide', variant: 'operator', action: () => append('/') },

    { label: '4', action: () => append('4') },
    { label: '5', action: () => append('5') },
    { label: '6', action: () => append('6') },
    { label: '×', ariaLabel: 'Multiply', variant: 'operator', action: () => append('*') },

    { label: '1', action: () => append('1') },
    { label: '2', action: () => append('2') },
    { label: '3', action: () => append('3') },
    { label: '−', ariaLabel: 'Subtract', variant: 'operator', action: () => append('-') },

    { label: '0', action: () => append('0') },
    { label: '.', action: () => append('.') },
    { label: 'Ans', ariaLabel: 'Insert previous answer', variant: 'utility', action: () => append('Ans') },
    { label: '+', ariaLabel: 'Add', variant: 'operator', action: () => append('+') },

    { label: 'CE', ariaLabel: 'Clear entry', variant: 'utility', action: () => setExpression('') },
    { label: '^', ariaLabel: 'Power', variant: 'operator', action: () => append('^') },
    { label: '=', ariaLabel: 'Evaluate', variant: 'primary', colSpan: 2, action: () => handleEvaluate() },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-8 space-y-4">
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
          placeholder="Enter expression (e.g. (25 + 35) * 2)"
        />

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 space-y-3">
          <CalculatorKeypad buttons={memoryButtons} columns={5} />
          <CalculatorKeypad buttons={mainButtons} columns={4} />
        </div>
      </div>

      <div className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden h-[540px]">
        <HistoryPanel
          compact
          onSelectExpression={(expr) => {
            setExpression(expr);
            setError(undefined);
          }}
        />
      </div>
    </div>
  );
}
