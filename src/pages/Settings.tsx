import { useCalculator } from '../context/CalculatorContext';
import type { AngleMode, ThemeMode } from '../types/calculator';

export function Settings() {
  const { settings, updateSettings, clearHistory, memoryClear } = useCalculator();

  return (
    <div className="max-w-3xl space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Display &amp; Computation Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <label className="space-y-1.5">
            <span className="font-medium text-slate-600 dark:text-slate-300">Theme</span>
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as ThemeMode })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] text-sm"
            >
              <option value="dark">Dark Navy &amp; Charcoal</option>
              <option value="light">Light Clinical Slate</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="font-medium text-slate-600 dark:text-slate-300">Default Angle Mode</span>
            <select
              value={settings.angleMode}
              onChange={(e) => updateSettings({ angleMode: e.target.value as AngleMode })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] text-sm font-mono"
            >
              <option value="DEG">DEG (Degrees)</option>
              <option value="RAD">RAD (Radians)</option>
              <option value="GRAD">GRAD (Gradians)</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Significant Digits Precision (1–15)
            </span>
            <input
              type="number"
              min={1}
              max={15}
              value={settings.precision}
              onChange={(e) =>
                updateSettings({
                  precision: Math.min(15, Math.max(1, Number(e.target.value) || 10)),
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] text-sm font-mono"
            />
          </label>

          <label className="space-y-1.5">
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Auto Scientific Notation Threshold
            </span>
            <select
              value={settings.scientificThreshold}
              onChange={(e) => updateSettings({ scientificThreshold: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] text-sm font-mono"
            >
              <option value={1e6}>10⁶ (1,000,000)</option>
              <option value={1e8}>10⁸ (100,000,000)</option>
              <option value={1e10}>10¹⁰ (10,000,000,000)</option>
              <option value={1e12}>10¹²</option>
            </select>
          </label>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-sm">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="font-medium text-slate-800 dark:text-slate-200">
                Always Use Scientific Notation
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Format all standard and scientific results in exponential E-notation.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.scientificNotation}
              onChange={(e) => updateSettings({ scientificNotation: e.target.checked })}
              className="w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="font-medium text-slate-800 dark:text-slate-200">
                Enable Keyboard Shortcuts
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Type digits, operators, Enter (=), Backspace, and Escape directly on keypad views.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.keyboardShortcuts}
              onChange={(e) => updateSettings({ keyboardShortcuts: e.target.checked })}
              className="w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="font-medium text-slate-800 dark:text-slate-200">
                Persist Calculation History
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Automatically save evaluated results in LocalStorage across sessions.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSaveHistory}
              onChange={(e) => updateSettings({ autoSaveHistory: e.target.checked })}
              className="w-4 h-4 rounded"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Keyboard Shortcuts Reference
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          {[
            ['0–9, .', 'Insert digits'],
            ['+ - * / ^ %', 'Operators'],
            ['( )', 'Parentheses'],
            ['Enter / =', 'Evaluate'],
            ['Backspace', 'Delete character'],
            ['Escape', 'Clear display'],
          ].map(([key, desc]) => (
            <div
              key={key}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800"
            >
              <div className="font-semibold text-cyan-600 dark:text-cyan-300">{key}</div>
              <div className="font-sans text-slate-500 dark:text-slate-400 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={memoryClear}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Reset Memory Register (MC)
          </button>
          <button
            type="button"
            onClick={clearHistory}
            className="px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-900/70 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
          >
            Clear Saved History
          </button>
        </div>
      </section>
    </div>
  );
}
