import type { MatrixData } from '../engines/matrixEngine';

interface MatrixInputProps {
  label: string;
  matrix: MatrixData;
  onChange: (next: MatrixData) => void;
  onResize: (rows: number, cols: number) => void;
  onPreset?: (preset: 'identity' | 'zero' | 'random' | 'symmetric') => void;
}

export function MatrixInput({
  label,
  matrix,
  onChange,
  onResize,
  onPreset,
}: MatrixInputProps) {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 1;

  const updateCell = (r: number, c: number, raw: string) => {
    const val = raw === '' || raw === '-' ? 0 : Number(raw);
    const next = matrix.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? (Number.isFinite(val) ? val : 0) : cell))
    );
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</span>

        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span>Rows</span>
            <select
              value={rows}
              onChange={(e) => onResize(Number(e.target.value), cols)}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-slate-900 dark:text-slate-100 font-mono"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <span className="text-slate-400">×</span>
          <label className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span>Cols</span>
            <select
              value={cols}
              onChange={(e) => onResize(rows, Number(e.target.value))}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-slate-900 dark:text-slate-100 font-mono"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {onPreset && (
        <div className="flex flex-wrap gap-1.5">
          {(['identity', 'zero', 'symmetric', 'random'] as const).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onPreset(preset)}
              className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 capitalize cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1.5 min-w-full"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(56px, 1fr))` }}
        >
          {matrix.map((row, r) =>
            row.map((cell, c) => (
              <input
                key={`${r}-${c}`}
                type="number"
                step="any"
                aria-label={`${label} row ${r + 1} column ${c + 1}`}
                value={cell}
                onChange={(e) => updateCell(r, c, e.target.value)}
                className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] text-center font-mono text-sm tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
