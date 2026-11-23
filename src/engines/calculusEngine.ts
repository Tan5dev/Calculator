import { compile, derivative } from 'mathjs';
import nerdamer from 'nerdamer';
import { defint, diff, integrate, limit, taylor, type LimitDir } from 'nerdamer/calculus';
import { formatNumber } from '../utils/formatters';

export interface CalculusOutput {
  ok: boolean;
  symbolic?: string;
  latex?: string;
  numeric?: string;
  details?: string[];
  criticalPoints?: { x: number; fx: number; kind: string }[];
  numericalComparison?: {
    trapezoidal: number;
    simpson13: number;
    simpson38: number;
    subintervals: number;
  };
  error?: string;
}

function fmt(n: number): string {
  return formatNumber(n, { precision: 10 });
}

export function computeDerivative(
  expr: string,
  variable = 'x',
  order = 1,
  evalAt?: number
): CalculusOutput {
  if (!expr.trim()) return { ok: false, error: 'Please enter a function expression.' };
  if (!Number.isInteger(order) || order < 1 || order > 10) {
    return { ok: false, error: 'Derivative order must be an integer from 1 to 10.' };
  }
  try {
    const res = diff(expr, variable, order);
    const symbolic = res.toString();
    const latex = nerdamer.convertToLaTeX(symbolic);
    const details = [`Computed order-${order} derivative with respect to ${variable}.`];

    let numeric: string | undefined;
    if (evalAt !== undefined && Number.isFinite(evalAt)) {
      const fn = compile(symbolic);
      const val = Number(fn.evaluate({ [variable]: evalAt }));
      if (Number.isFinite(val)) {
        numeric = fmt(val);
        details.push(`Evaluated at ${variable} = ${evalAt}: ${numeric}`);
      }
    }

    return { ok: true, symbolic, latex, numeric, details };
  } catch (err) {
    try {
      let node = derivative(expr, variable);
      for (let i = 1; i < order; i++) {
        node = derivative(node, variable);
      }
      return { ok: true, symbolic: node.toString() };
    } catch {
      return { ok: false, error: err instanceof Error ? err.message : 'Unable to differentiate expression.' };
    }
  }
}

export function computePartialAndGradient(
  expr: string,
  vars = ['x', 'y', 'z']
): { ok: boolean; partials: { variable: string; derivative: string }[]; error?: string } {
  if (!expr.trim()) return { ok: false, partials: [], error: 'Please enter a multivariable expression.' };
  try {
    const partials = vars.map((v) => ({
      variable: v,
      derivative: diff(expr, v, 1).toString(),
    }));
    return { ok: true, partials };
  } catch (err) {
    return {
      ok: false,
      partials: [],
      error: err instanceof Error ? err.message : 'Unable to compute partial derivatives.',
    };
  }
}

export function computeIndefiniteIntegral(expr: string, variable = 'x'): CalculusOutput {
  if (!expr.trim()) return { ok: false, error: 'Please enter an integrand expression.' };
  try {
    const res = integrate(expr, variable);
    const sym = res.toString();
    if (sym.includes('integrate(')) {
      return {
        ok: false,
        error: 'No elementary closed-form antiderivative found. Try Definite / Numerical Integration.',
      };
    }
    return {
      ok: true,
      symbolic: `${sym} + C`,
      latex: `${nerdamer.convertToLaTeX(sym)} + C`,
      details: [`Indefinite integral ∫ (${expr}) d${variable}`],
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unable to integrate expression.' };
  }
}

export function trapezoidalRule(fn: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n;
  let sum = 0.5 * (fn(a) + fn(b));
  for (let i = 1; i < n; i++) {
    sum += fn(a + i * h);
  }
  return sum * h;
}

export function simpsonOneThirdRule(fn: (x: number) => number, a: number, b: number, nInput: number): number {
  const n = nInput % 2 === 0 ? nInput : nInput + 1;
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);
  for (let i = 1; i < n; i++) {
    sum += (i % 2 === 0 ? 2 : 4) * fn(a + i * h);
  }
  return (sum * h) / 3;
}

export function simpsonThreeEighthRule(fn: (x: number) => number, a: number, b: number, nInput: number): number {
  const n = Math.max(3, Math.ceil(nInput / 3) * 3);
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);
  for (let i = 1; i < n; i++) {
    sum += (i % 3 === 0 ? 2 : 3) * fn(a + i * h);
  }
  return (3 * h * sum) / 8;
}

export function computeDefiniteAndNumericalIntegral(
  expr: string,
  variable: string,
  a: number,
  b: number,
  subintervals = 60
): CalculusOutput {
  if (!expr.trim()) return { ok: false, error: 'Please enter an integrand expression.' };
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { ok: false, error: 'Bounds a and b must be finite numbers.' };
  }
  const n = Math.max(6, Math.min(subintervals, 6000));

  try {
    const compiled = compile(expr);
    const fn = (x: number) => {
      const v = Number(compiled.evaluate({ [variable]: x }));
      if (!Number.isFinite(v)) throw new Error(`Integrand is undefined or singular near ${variable} = ${fmt(x)}.`);
      return v;
    };

    const trap = trapezoidalRule(fn, a, b, n);
    const s13 = simpsonOneThirdRule(fn, a, b, n);
    const s38 = simpsonThreeEighthRule(fn, a, b, n);

    let symbolicResult: string | undefined;
    try {
      const exact = defint(expr, a, b, variable);
      const exactStr = exact.toString();
      if (!exactStr.includes('defint(')) {
        symbolicResult = exactStr;
      }
    } catch {
      symbolicResult = undefined;
    }

    return {
      ok: true,
      symbolic: symbolicResult,
      numeric: fmt(s13),
      numericalComparison: {
        trapezoidal: trap,
        simpson13: s13,
        simpson38: s38,
        subintervals: n,
      },
      details: [
        `Definite integral over [${a}, ${b}] with n = ${n} subintervals`,
        `Trapezoidal rule: ${fmt(trap)}`,
        `Simpson's 1/3 rule: ${fmt(s13)}`,
        `Simpson's 3/8 rule: ${fmt(s38)}`,
      ],
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Numerical integration failed.' };
  }
}

export function computeLimit(
  expr: string,
  variable: string,
  approach: string,
  direction: LimitDir = 'both'
): CalculusOutput {
  if (!expr.trim()) return { ok: false, error: 'Please enter an expression.' };
  try {
    const target = approach.trim() || '0';
    const res = limit(expr, variable, target, direction);
    const sym = res.toString();
    if (sym.includes('limit(')) {
      // Numerical probe fallback for finite points
      const numTarget = Number(target);
      if (Number.isFinite(numTarget)) {
        const fn = compile(expr);
        const eps = 1e-6;
        const left = Number(fn.evaluate({ [variable]: numTarget - eps }));
        const right = Number(fn.evaluate({ [variable]: numTarget + eps }));
        if (direction === 'left' && Number.isFinite(left)) {
          return { ok: true, numeric: fmt(left), details: ['Estimated via left-sided numerical probe.'] };
        }
        if (direction === 'right' && Number.isFinite(right)) {
          return { ok: true, numeric: fmt(right), details: ['Estimated via right-sided numerical probe.'] };
        }
        if (Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 1e-3) {
          return { ok: true, numeric: fmt((left + right) / 2), details: ['Estimated via two-sided numerical probe.'] };
        }
      }
      return { ok: false, error: 'Limit could not be resolved symbolically or does not exist.' };
    }
    return {
      ok: true,
      symbolic: sym,
      latex: nerdamer.convertToLaTeX(sym),
      details: [`lim (${variable} → ${target}${direction === 'both' ? '' : direction === 'left' ? '⁻' : '⁺'}) of ${expr}`],
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Limit evaluation failed.' };
  }
}

export function computeTaylorSeries(
  expr: string,
  variable = 'x',
  center = 0,
  order = 6
): CalculusOutput {
  if (!expr.trim()) return { ok: false, error: 'Please enter an expression.' };
  if (!Number.isInteger(order) || order < 1 || order > 14) {
    return { ok: false, error: 'Series order must be an integer between 1 and 14.' };
  }
  try {
    const res = taylor(expr, variable, center, order);
    const sym = res.toString();
    if (sym.includes('taylor(')) {
      return { ok: false, error: 'Unable to expand Taylor series around this point (possible singularity).' };
    }
    const label = center === 0 ? 'Maclaurin' : `Taylor (center a = ${center})`;
    return {
      ok: true,
      symbolic: sym,
      latex: nerdamer.convertToLaTeX(sym),
      details: [`${label} polynomial of degree ${order}`],
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Series expansion failed.' };
  }
}

export function findCriticalPoints(
  expr: string,
  variable = 'x',
  xMin = -10,
  xMax = 10
): CalculusOutput {
  if (!expr.trim()) return { ok: false, error: 'Please enter an expression.' };
  try {
    const f = compile(expr);
    const d1Node = derivative(expr, variable);
    const d2Node = derivative(d1Node, variable);
    const d1 = d1Node.compile();
    const d2 = d2Node.compile();

    const samples = 500;
    const dx = (xMax - xMin) / samples;
    const pts: { x: number; fx: number; kind: string }[] = [];

    const refineZero = (lo: number, hi: number): number => {
      let a = lo;
      let b = hi;
      let fa = Number(d1.evaluate({ [variable]: a }));
      for (let k = 0; k < 35; k++) {
        const m = (a + b) / 2;
        const fm = Number(d1.evaluate({ [variable]: m }));
        if (Math.abs(fm) < 1e-11) return m;
        if (fa * fm <= 0) b = m;
        else {
          a = m;
          fa = fm;
        }
      }
      return (a + b) / 2;
    };

    let prevX = xMin;
    let prevD1 = Number(d1.evaluate({ [variable]: prevX }));

    for (let i = 1; i <= samples; i++) {
      const x = xMin + i * dx;
      const curD1 = Number(d1.evaluate({ [variable]: x }));
      let critX: number | null = null;

      if (Number.isFinite(curD1) && Math.abs(curD1) < 1e-6) {
        critX = x;
      } else if (Number.isFinite(prevD1) && Number.isFinite(curD1) && prevD1 * curD1 < 0) {
        critX = refineZero(prevX, x);
      }

      if (critX !== null) {
        const duplicate = pts.some((p) => Math.abs(p.x - critX!) < 1e-4);
        if (!duplicate) {
          const fx = Number(f.evaluate({ [variable]: critX }));
          const second = Number(d2.evaluate({ [variable]: critX }));
          if (Number.isFinite(fx)) {
            let kind = 'Stationary / Inflection';
            if (Number.isFinite(second)) {
              if (second > 1e-6) kind = 'Local Minimum';
              else if (second < -1e-6) kind = 'Local Maximum';
            }
            pts.push({
              x: Number(critX.toFixed(6)),
              fx: Number(fx.toFixed(6)),
              kind,
            });
          }
        }
      }

      prevX = x;
      prevD1 = curD1;
    }

    return {
      ok: true,
      symbolic: d1Node.toString(),
      criticalPoints: pts,
      details: [
        `f'(${variable}) = ${d1Node.toString()}`,
        `f''(${variable}) = ${d2Node.toString()}`,
        `Found ${pts.length} critical point(s) in [${xMin}, ${xMax}].`,
      ],
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Critical point analysis failed.' };
  }
}
