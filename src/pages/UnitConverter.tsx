import { ArrowLeftRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import {
  convertUnit,
  UNIT_CATEGORIES,
  type UnitCategoryId,
} from '../engines/conversionEngine';
import { formatNumber } from '../utils/formatters';

export function UnitConverter() {
  const { settings, addHistory } = useCalculator();
  const [categoryId, setCategoryId] = useState<UnitCategoryId>('length');
  const [inputValue, setInputValue] = useState('1');
  const [fromUnitId, setFromUnitId] = useState('km');
  const [toUnitId, setToUnitId] = useState('m');

  const activeCategory = useMemo(
    () => UNIT_CATEGORIES.find((c) => c.id === categoryId) ?? UNIT_CATEGORIES[0],
    [categoryId]
  );

  const handleCategoryChange = (nextId: UnitCategoryId) => {
    const cat = UNIT_CATEGORIES.find((c) => c.id === nextId)!;
    setCategoryId(nextId);
    setFromUnitId(cat.units[0].id);
    setToUnitId(cat.units[Math.min(1, cat.units.length - 1)].id);
  };

  const numValue = Number(inputValue);
  const converted = useMemo(() => {
    if (inputValue.trim() === '' || Number.isNaN(numValue)) {
      return { ok: false, error: 'Enter a valid numeric value.' };
    }
    return convertUnit(numValue, categoryId, fromUnitId, toUnitId);
  }, [inputValue, numValue, categoryId, fromUnitId, toUnitId]);

  const allConversions = useMemo(() => {
    if (inputValue.trim() === '' || Number.isNaN(numValue)) return [];
    return activeCategory.units.map((u) => {
      const res = convertUnit(numValue, categoryId, fromUnitId, u.id);
      return {
        unit: u,
        formatted: res.ok && res.result !== undefined ? formatNumber(res.result, settings) : '—',
      };
    });
  }, [activeCategory, inputValue, numValue, categoryId, fromUnitId, settings]);

  const swapUnits = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  const fromUnitObj = activeCategory.units.find((u) => u.id === fromUnitId);
  const toUnitObj = activeCategory.units.find((u) => u.id === toUnitId);

  const saveConversion = () => {
    if (!converted.ok || converted.result === undefined) return;
    addHistory({
      module: `Converter (${activeCategory.name})`,
      expression: `${inputValue} ${fromUnitObj?.symbol ?? fromUnitId} → ${toUnitObj?.symbol ?? toUnitId}`,
      result: `${formatNumber(converted.result, settings)} ${toUnitObj?.symbol ?? toUnitId}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
        {UNIT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              categoryId === cat.id
                ? 'bg-cyan-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {activeCategory.name} Conversion
          </h2>

          <label className="block space-y-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Input Value</span>
            <input
              type="number"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-lg text-slate-900 dark:text-slate-100"
            />
          </label>

          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <label className="space-y-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">From</span>
              <select
                value={fromUnitId}
                onChange={(e) => setFromUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] text-sm"
              >
                {activeCategory.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label} ({u.symbol})
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={swapUnits}
              aria-label="Swap units"
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <label className="space-y-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">To</span>
              <select
                value={toUnitId}
                onChange={(e) => setToUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] text-sm"
              >
                {activeCategory.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label} ({u.symbol})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Converted Value</div>
            {converted.ok && converted.result !== undefined ? (
              <div className="text-2xl font-mono font-bold tabular-nums text-slate-900 dark:text-cyan-300 break-all">
                {formatNumber(converted.result, settings)}{' '}
                <span className="text-sm font-normal text-slate-400">{toUnitObj?.symbol}</span>
              </div>
            ) : (
              <div className="text-sm text-rose-500">{converted.error}</div>
            )}
          </div>

          <button
            type="button"
            onClick={saveConversion}
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Save Conversion to History
          </button>
        </div>

        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
            All {activeCategory.name} Equivalents
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2 text-left font-medium">Unit</th>
                  <th className="py-2 text-left font-medium">Symbol</th>
                  <th className="py-2 text-right font-medium">Converted Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                {allConversions.map(({ unit, formatted }) => (
                  <tr
                    key={unit.id}
                    className={unit.id === toUnitId ? 'bg-cyan-50/50 dark:bg-cyan-950/20' : ''}
                  >
                    <td className="py-2 font-sans text-slate-800 dark:text-slate-200">
                      {unit.label}
                    </td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{unit.symbol}</td>
                    <td className="py-2 text-right tabular-nums font-semibold text-cyan-700 dark:text-cyan-300">
                      {formatted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
