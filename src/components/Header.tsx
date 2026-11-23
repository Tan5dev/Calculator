import { History, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useCalculator } from '../context/CalculatorContext';
import type { AngleMode } from '../types/calculator';
import { NAV_ITEMS } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onOpenSidebar: () => void;
  onToggleHistoryDrawer: () => void;
  historyDrawerOpen: boolean;
}

const ANGLE_MODES: AngleMode[] = ['DEG', 'RAD', 'GRAD'];

export function Header({
  onOpenSidebar,
  onToggleHistoryDrawer,
  historyDrawerOpen,
}: HeaderProps) {
  const location = useLocation();
  const { settings, setAngleMode, history } = useCalculator();

  const currentNav =
    NAV_ITEMS.find((item) => item.path === location.pathname) ?? NAV_ITEMS[0];

  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D1322] shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 truncate">
            {currentNav.label}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div
          role="group"
          aria-label="Angle unit mode"
          className="hidden sm:flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
        >
          {ANGLE_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAngleMode(mode)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                settings.angleMode === mode
                  ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleHistoryDrawer}
          aria-expanded={historyDrawerOpen}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            historyDrawerOpen
              ? 'border-cyan-500/60 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
          <span className="font-mono tabular-nums text-slate-400 dark:text-slate-500">
            {history.length}
          </span>
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
