export interface KeypadButtonConfig {
  label: string;
  ariaLabel?: string;
  action: () => void;
  variant?: 'default' | 'operator' | 'primary' | 'danger' | 'utility';
  colSpan?: number;
}

interface CalculatorKeypadProps {
  buttons: KeypadButtonConfig[];
  columns?: 4 | 5 | 6;
}

export function CalculatorKeypad({ buttons, columns = 4 }: CalculatorKeypadProps) {
  const gridColsClass =
    columns === 6
      ? 'grid-cols-4 sm:grid-cols-6'
      : columns === 5
        ? 'grid-cols-5'
        : 'grid-cols-4';

  const variantClasses: Record<NonNullable<KeypadButtonConfig['variant']>, string> = {
    default:
      'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800',
    utility:
      'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
    operator:
      'bg-slate-100 dark:bg-[#162033] border-slate-200 dark:border-slate-700/80 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/60',
    primary:
      'bg-cyan-600 hover:bg-cyan-500 border-cyan-600 text-white shadow-xs',
    danger:
      'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/70 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50',
  };

  return (
    <div className={`grid ${gridColsClass} gap-2`}>
      {buttons.map((btn, idx) => {
        const variant = btn.variant ?? 'default';
        const spanClass =
          btn.colSpan === 2
            ? 'col-span-2'
            : btn.colSpan === 3
              ? 'col-span-3'
              : '';

        return (
          <button
            key={`${btn.label}-${idx}`}
            type="button"
            onClick={btn.action}
            aria-label={btn.ariaLabel ?? btn.label}
            className={`min-h-[44px] px-2.5 py-2.5 rounded-lg border font-mono text-sm font-medium tabular-nums transition-colors active:scale-[0.98] cursor-pointer whitespace-nowrap ${variantClasses[variant]} ${spanClass}`}
          >
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}
