import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { copyToClipboard } from '../utils/formatters';

interface CalculatorDisplayProps {
  expression: string;
  onExpressionChange: (value: string) => void;
  onEvaluate: () => void;
  result: string;
  secondaryResult?: string;
  error?: string;
  placeholder?: string;
}

export function CalculatorDisplay({
  expression,
  onExpressionChange,
  onEvaluate,
  result,
  secondaryResult,
  error,
  placeholder = '0',
}: CalculatorDisplayProps) {
  const { settings, memory, lastAnswer } = useCalculator();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const val = result || expression;
    if (!val) return;
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span>Mode: {settings.angleMode}</span>
          <span>·</span>
          <span>Mem: {memory !== 0 ? memory : '0'}</span>
          <span>·</span>
          <span>Ans: {lastAnswer}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div>
        <label htmlFor="calc-expression-input" className="sr-only">
          Mathematical Expression
        </label>
        <input
          id="calc-expression-input"
          type="text"
          value={expression}
          onChange={(e) => onExpressionChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onEvaluate();
            }
          }}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-transparent text-right font-mono text-lg sm:text-xl text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none border-b border-slate-200/80 dark:border-slate-800 pb-2"
        />
      </div>

      <div className="min-h-[3.25rem] flex flex-col items-end justify-center text-right">
        {error ? (
          <div role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
            {error}
          </div>
        ) : (
          <>
            <div className="text-3xl sm:text-4xl font-mono font-bold tabular-nums text-slate-900 dark:text-cyan-300 break-all">
              {result || '0'}
            </div>
            {secondaryResult && (
              <div className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                {secondaryResult}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
