import { Check, Copy, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { copyToClipboard, formatTimestamp } from '../utils/formatters';

interface HistoryPanelProps {
  onSelectExpression?: (expression: string) => void;
  onClose?: () => void;
  compact?: boolean;
}

export function HistoryPanel({ onSelectExpression, onClose, compact = false }: HistoryPanelProps) {
  const { history, deleteHistoryItem, clearHistory } = useCalculator();
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (item) =>
        item.expression.toLowerCase().includes(q) ||
        item.result.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q)
    );
  }, [history, query]);

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1400);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0D1322]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Calculation History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {history.length} saved entries
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {history.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close history panel"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search expressions or results..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-200/70 dark:divide-slate-800/80">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {history.length === 0
              ? 'No calculations recorded yet. Compute an expression to save it here.'
              : 'No history entries match your search.'}
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`px-4 ${compact ? 'py-2.5' : 'py-3'} hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors`}
            >
              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                <span>
                  {item.module} · {formatTimestamp(item.timestamp)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.result)}
                    aria-label="Copy result"
                    className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteHistoryItem(item.id)}
                    aria-label="Delete entry"
                    className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectExpression?.(item.expression)}
                className="w-full text-left group cursor-pointer"
              >
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                  {item.expression}
                </div>
                <div className="text-sm font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                  = {item.result}
                </div>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
