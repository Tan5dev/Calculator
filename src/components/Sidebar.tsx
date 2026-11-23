import {
  Activity,
  Binary,
  BookOpen,
  Calculator,
  Compass,
  FunctionSquare,
  Grid3x3,
  History,
  LineChart,
  Scale,
  Settings,
  Sigma,
  Sliders,
  Wrench,
  X,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import type { CalculatorModuleId } from '../types/calculator';

export interface NavItemConfig {
  id: CalculatorModuleId;
  path: string;
  label: string;
  group: 'Calculators' | 'Analysis & Algebra' | 'Engineering & Tools' | 'Workspace';
  icon: ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: 'standard', path: '/', label: 'Standard', group: 'Calculators', icon: Calculator },
  { id: 'scientific', path: '/scientific', label: 'Scientific', group: 'Calculators', icon: FunctionSquare },
  { id: 'programmer', path: '/programmer', label: 'Programmer', group: 'Calculators', icon: Binary },
  { id: 'graphing', path: '/graphing', label: 'Graphing 2D / 3D', group: 'Analysis & Algebra', icon: LineChart },
  { id: 'equations', path: '/equations', label: 'Equation Solver', group: 'Analysis & Algebra', icon: Sliders },
  { id: 'matrix', path: '/matrix', label: 'Matrix Algebra', group: 'Analysis & Algebra', icon: Grid3x3 },
  { id: 'complex', path: '/complex', label: 'Complex Numbers', group: 'Analysis & Algebra', icon: Compass },
  { id: 'calculus', path: '/calculus', label: 'Calculus', group: 'Analysis & Algebra', icon: Sigma },
  { id: 'statistics', path: '/statistics', label: 'Statistics', group: 'Engineering & Tools', icon: Activity },
  { id: 'converter', path: '/converter', label: 'Unit Converter', group: 'Engineering & Tools', icon: Scale },
  { id: 'tools', path: '/tools', label: 'Math Tools', group: 'Engineering & Tools', icon: Wrench },
  { id: 'constants', path: '/constants', label: 'Constants', group: 'Engineering & Tools', icon: BookOpen },
  { id: 'history', path: '/history', label: 'History', group: 'Workspace', icon: History },
  { id: 'settings', path: '/settings', label: 'Settings', group: 'Workspace', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const GROUPS: NavItemConfig['group'][] = [
  'Calculators',
  'Analysis & Algebra',
  'Engineering & Tools',
  'Workspace',
];

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D1322] transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800/90 shrink-0">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-600 text-white font-bold text-sm tracking-tight shrink-0">
              N
            </span>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              Nexus Calculator
            </span>
          </NavLink>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Calculator modules">
          {GROUPS.map((group) => (
            <div key={group}>
              <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wide text-slate-400 dark:text-slate-500">
                {group}
              </div>
              <div className="space-y-0.5">
                {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          isActive
                            ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border border-transparent'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800/90 text-xs text-slate-500 dark:text-slate-400">
          Offline Local Engine
        </div>
      </aside>
    </>
  );
}
