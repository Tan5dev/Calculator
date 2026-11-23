import { AlertCircle, Check, Copy } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { copyToClipboard } from '../utils/formatters';

interface ResultPanelProps {
  title: string;
  primaryValue?: string;
  secondaryValue?: string;
  error?: string;
  steps?: string[];
  children?: ReactNode;
}

export function ResultPanel({
  title,
  primaryValue,
  secondaryValue,
  error,
  steps,
  children,
}: ResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!primaryValue) return;
    const ok = await copyToClipboard(primaryValue);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {primaryValue && !error && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-lg border border-rose-300/70 dark:border-rose-900/70 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {primaryValue && (
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
              <div className="text-xl sm:text-2xl font-mono font-semibold tabular-nums text-slate-900 dark:text-cyan-300 break-all">
                {primaryValue}
              </div>
              {secondaryValue && (
                <div className="mt-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                  {secondaryValue}
                </div>
              )}
            </div>
          )}

          {children}

          {steps && steps.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Calculation Steps
              </div>
              <ol className="space-y-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                {steps.map((step, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-slate-400 dark:text-slate-500 select-none shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="break-words">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </section>
  );
}
