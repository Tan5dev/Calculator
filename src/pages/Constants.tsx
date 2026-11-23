import { Check, Copy, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PhysicalConstant } from '../types/calculator';
import { PHYSICAL_CONSTANTS } from '../utils/constantsData';
import { copyToClipboard } from '../utils/formatters';

export function Constants() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PHYSICAL_CONSTANTS.filter((c) => {
      const catMatch = category === 'All' || c.category === category;
      const textMatch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.insertToken.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [query, category]);

  const handleCopy = async (c: PhysicalConstant) => {
    const ok = await copyToClipboard(String(c.value));
    if (ok) {
      setCopiedToken(c.insertToken);
      setTimeout(() => setCopiedToken(null), 1400);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4">
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Mathematics', 'Physics', 'Chemistry', 'Astrophysics'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                category === cat
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search constants..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 text-left font-medium">Symbol</th>
                <th className="py-3 px-4 text-left font-medium">Constant Name</th>
                <th className="py-3 px-4 text-left font-medium">Category</th>
                <th className="py-3 px-4 text-right font-medium">Value</th>
                <th className="py-3 px-4 text-left font-medium">Unit</th>
                <th className="py-3 px-4 text-left font-medium">Token</th>
                <th className="py-3 px-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {filtered.map((c) => (
                <tr
                  key={c.insertToken}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-base font-bold text-cyan-600 dark:text-cyan-300">
                    {c.symbol}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{c.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {c.description}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{c.category}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {c.displayValue}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {c.unit}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {c.insertToken}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleCopy(c)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium cursor-pointer"
                    >
                      {copiedToken === c.insertToken ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedToken === c.insertToken ? 'Copied' : 'Copy'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
