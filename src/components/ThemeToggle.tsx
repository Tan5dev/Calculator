import { Moon, Sun } from 'lucide-react';
import { useCalculator } from '../context/CalculatorContext';

export function ThemeToggle() {
  const { settings, toggleTheme } = useCalculator();
  const isDark = settings.theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
