interface EquationInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  helperText?: string;
}

export function EquationInput({
  label,
  value,
  onChange,
  onSubmit,
  placeholder,
  helperText,
}: EquationInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        spellCheck={false}
        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
      />
      {helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
