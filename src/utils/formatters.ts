import type { CalculatorSettings } from '../types/calculator';

export function formatNumber(
  value: number,
  settings?: Partial<CalculatorSettings>
): string {
  if (!Number.isFinite(value)) {
    if (Number.isNaN(value)) return 'NaN';
    return value > 0 ? 'Infinity' : '-Infinity';
  }

  if (Object.is(value, -0) || Math.abs(value) < 1e-14) {
    return '0';
  }

  const precision = Math.min(Math.max(settings?.precision ?? 10, 1), 15);
  const useSci = settings?.scientificNotation ?? false;
  const threshold = settings?.scientificThreshold ?? 1e10;

  const abs = Math.abs(value);

  if (useSci || (abs !== 0 && (abs >= threshold || abs < 1e-7))) {
    const expStr = value.toExponential(Math.min(precision, 12));
    return expStr.replace(/(\.\d*?[1-9])0+e/, '$1e').replace(/\.0+e/, 'e');
  }

  // Round to avoid floating point artifacts like 0.30000000000000004 or sin(30°) = 0.49999999999999994
  const rounded = Number(value.toPrecision(precision));
  if (Math.abs(rounded) < 1e-14) return '0';
  return String(rounded);
}

export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
  }
  return Promise.resolve(false);
}

export function escapeCsvCell(value: string): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
