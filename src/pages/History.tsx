import { Check, Copy, Download, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { copyToClipboard, formatTimestamp } from '../utils/formatters';

export function History() {
  const { history, deleteHistoryItem, clearHistory, exportHistoryCsv } = useCalculator();
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const modules = useMemo(() => {
    const set = new Set(history.map((h) => h.module));
    return ['All', ...Array.from(set)];
  }, [history]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history.filter((item) => {
      const modMatch = moduleFilter === 'All' || item.module === moduleFilter;
      const textMatch =
        !q ||
        item.expression.toLowerCase().includes(q) ||
        item.result.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q);
      return modMatch && textMatch;
    });
  }, [history, query, moduleFilter]);

  const handleExportCsv = () => {
    const csv = exportHistoryCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-calculator-history-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (id: string, value: string) => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1400);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search expression, result, or module..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19]"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19]"
          >
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={history.length === 0}
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            disabled={history.length === 0}
            onClick={clearHistory}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900/70 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            {history.length === 0
              ? 'No calculation history recorded yet.'
              : 'No history entries match your current filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 text-left font-medium">Timestamp</th>
                  <th className="py-3 px-4 text-left font-medium">Module</th>
                  <th className="py-3 px-4 text-left font-medium">Expression</th>
                  <th className="py-3 px-4 text-right font-medium">Result</th>
                  <th className="py-3 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {formatTimestamp(item.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {item.module}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200 max-w-md truncate">
                      {item.expression}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-cyan-600 dark:text-cyan-300 max-w-xs truncate">
                      {item.result}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.result)}
                        aria-label="Copy result"
                        className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 cursor-pointer mr-1"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteHistoryItem(item.id)}
                        aria-label="Delete history entry"
                        className="p-1.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
