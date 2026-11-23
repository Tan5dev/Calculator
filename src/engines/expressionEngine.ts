import { all, create } from 'mathjs';
import type { AngleMode, CalculatorSettings, EvalResult } from '../types/calculator';
import { PHYSICAL_CONSTANTS } from '../utils/constantsData';
import { formatNumber } from '../utils/formatters';

const math = create(all, {});

function toRadians(angle: number, mode: AngleMode): number {
  if (mode === 'DEG') return (angle * Math.PI) / 180;
  if (mode === 'GRAD') return (angle * Math.PI) / 200;
  return angle;
}

function fromRadians(rad: number, mode: AngleMode): number {
  if (mode === 'DEG') return (rad * 180) / Math.PI;
  if (mode === 'GRAD') return (rad * 200) / Math.PI;
  return rad;
}

function snapZero(n: number): number {
  return Math.abs(n) < 1e-13 ? 0 : n;
}

function factorialSafe(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error('Factorial is only defined for non-negative integers.');
  }
  if (n > 170) {
    throw new Error('Overflow: factorial input exceeds 170.');
  }
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

export function normalizeExpression(raw: string): string {
  let expr = raw.trim();
  expr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/τ/g, 'tau')
    .replace(/φ/g, 'phi')
    .replace(/√\(/g, 'sqrt(')
    .replace(/√(\d+(?:\.\d+)?)/g, 'sqrt($1)')
    .replace(/∛\(/g, 'cbrt(')
    .replace(/∛(\d+(?:\.\d+)?)/g, 'cbrt($1)')
    .replace(/\bmod\b/gi, ' % ')
    .replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  // Handle implicit multiplication carefully: 2pi, 20(3+4), (2)(3), 2sin(30) without breaking log10(x) or log2(x)
  expr = expr.replace(/(?<![a-zA-Z_0-9])(\d+(?:\.\d+)?)(?=\()/g, '$1*');
  expr = expr.replace(/\)(?=\()/g, ')*(');
  expr = expr.replace(/\)(?=\d)/g, ')*');
  expr = expr.replace(/\)(?=[a-zA-Z])/g, ')*');
  expr = expr.replace(/(?<![a-zA-Z_0-9])(\d+(?:\.\d+)?)(?=(?:pi|e|tau|phi|Ans|ans|MEM|mem|c0|h_planck|hbar|G_grav|g0|qe|me|mp|eps0|mu0|NA|kB|R_gas|sigma_sb|AU|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|asinh|acosh|atanh|sec|csc|cot|ln|log10|log2|log|sqrt|cbrt|exp|abs)\b)/g, '$1*');

  return expr;
}

export function evaluateExpression(
  rawInput: string,
  settings: Pick<CalculatorSettings, 'angleMode' | 'precision' | 'scientificNotation' | 'scientificThreshold'>,
  extras?: { ans?: number; memory?: number }
): EvalResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { ok: false, value: '', error: 'Please enter an expression.' };
  }

  try {
    const normalized = normalizeExpression(trimmed);
    const angleMode = settings.angleMode;

    const scope: Record<string, unknown> = {
      Ans: extras?.ans ?? 0,
      ans: extras?.ans ?? 0,
      MEM: extras?.memory ?? 0,
      mem: extras?.memory ?? 0,
      pi: Math.PI,
      e: Math.E,
      tau: 2 * Math.PI,
      phi: (1 + Math.sqrt(5)) / 2,
      // Angle-aware trig
      sin: (x: number) => snapZero(Math.sin(toRadians(x, angleMode))),
      cos: (x: number) => snapZero(Math.cos(toRadians(x, angleMode))),
      tan: (x: number) => {
        const rad = toRadians(x, angleMode);
        if (Math.abs(Math.cos(rad)) < 1e-14) {
          throw new Error('Math error: tangent is undefined at this angle.');
        }
        return snapZero(Math.tan(rad));
      },
      sec: (x: number) => {
        const c = Math.cos(toRadians(x, angleMode));
        if (Math.abs(c) < 1e-14) throw new Error('Math error: secant undefined.');
        return 1 / c;
      },
      csc: (x: number) => {
        const s = Math.sin(toRadians(x, angleMode));
        if (Math.abs(s) < 1e-14) throw new Error('Math error: cosecant undefined.');
        return 1 / s;
      },
      cot: (x: number) => {
        const s = Math.sin(toRadians(x, angleMode));
        if (Math.abs(s) < 1e-14) throw new Error('Math error: cotangent undefined.');
        return Math.cos(toRadians(x, angleMode)) / s;
      },
      asin: (x: number) => {
        if (x < -1 || x > 1) throw new Error('Domain error: asin(x) requires -1 ≤ x ≤ 1.');
        return snapZero(fromRadians(Math.asin(x), angleMode));
      },
      acos: (x: number) => {
        if (x < -1 || x > 1) throw new Error('Domain error: acos(x) requires -1 ≤ x ≤ 1.');
        return snapZero(fromRadians(Math.acos(x), angleMode));
      },
      atan: (x: number) => snapZero(fromRadians(Math.atan(x), angleMode)),
      sinh: (x: number) => Math.sinh(x),
      cosh: (x: number) => Math.cosh(x),
      tanh: (x: number) => Math.tanh(x),
      asinh: (x: number) => Math.asinh(x),
      acosh: (x: number) => {
        if (x < 1) throw new Error('Domain error: acosh(x) requires x ≥ 1.');
        return Math.acosh(x);
      },
      atanh: (x: number) => {
        if (x <= -1 || x >= 1) throw new Error('Domain error: atanh(x) requires -1 < x < 1.');
        return Math.atanh(x);
      },
      ln: (x: number) => {
        if (x <= 0) throw new Error('Domain error: ln(x) requires x > 0.');
        return Math.log(x);
      },
      log10: (x: number) => {
        if (x <= 0) throw new Error('Domain error: log10(x) requires x > 0.');
        return Math.log10(x);
      },
      log2: (x: number) => {
        if (x <= 0) throw new Error('Domain error: log2(x) requires x > 0.');
        return Math.log2(x);
      },
      log: (x: number, base?: number) => {
        if (x <= 0) throw new Error('Domain error: logarithm argument must be positive.');
        if (base === undefined) return Math.log10(x);
        if (base <= 0 || base === 1) throw new Error('Domain error: logarithm base must be > 0 and ≠ 1.');
        return Math.log(x) / Math.log(base);
      },
      sqrt: (x: number) => {
        if (x < 0) throw new Error(`Domain error: square root of negative number (${x}) is not real.`);
        return Math.sqrt(x);
      },
      cbrt: (x: number) => Math.cbrt(x),
      fact: (x: number) => factorialSafe(x),
      nPr: (n: number, r: number) => {
        if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) {
          throw new Error('nPr requires integers with 0 ≤ r ≤ n.');
        }
        return Number(math.permutations(n, r));
      },
      nCr: (n: number, r: number) => {
        if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) {
          throw new Error('nCr requires integers with 0 ≤ r ≤ n.');
        }
        return Number(math.combinations(n, r));
      },
    };

    for (const c of PHYSICAL_CONSTANTS) {
      scope[c.insertToken] = c.value;
    }

    const result = math.evaluate(normalized, scope);

    if (typeof result === 'function') {
      return { ok: false, value: '', error: 'Incomplete expression: function requires arguments.' };
    }

    if (result && typeof result === 'object' && 'isComplex' in result) {
      const c = result as { re: number; im: number };
      return {
        ok: false,
        value: '',
        error: `Complex result (${formatNumber(c.re, settings)} ${c.im >= 0 ? '+' : '-'} ${formatNumber(Math.abs(c.im), settings)}i). Use Complex Calculator for complex arithmetic.`,
      };
    }

    if (typeof result === 'boolean') {
      return { ok: true, value: result ? 'True' : 'False' };
    }

    const numeric = Number(result);
    if (Number.isNaN(numeric)) {
      return { ok: false, value: '', error: 'Math error: indeterminate result (NaN).' };
    }
    if (!Number.isFinite(numeric)) {
      return { ok: false, value: '', error: 'Math error: division by zero or numerical overflow.' };
    }

    const formatted = formatNumber(numeric, settings);
    const scientificValue = numeric.toExponential(Math.min(settings.precision, 10));

    let fractionValue: string | undefined;
    if (Math.abs(numeric) < 1e7 && !Number.isInteger(numeric)) {
      try {
        const frac = math.fraction(numeric);
        if (frac.d <= 10000n) {
          const sign = frac.s < 0n ? '-' : '';
          fractionValue = `${sign}${frac.n}/${frac.d}`;
        }
      } catch {
        fractionValue = undefined;
      }
    }

    return {
      ok: true,
      value: formatted,
      numericValue: numeric,
      scientificValue,
      fractionValue,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid mathematical expression.';
    return {
      ok: false,
      value: '',
      error: message,
    };
  }
}
