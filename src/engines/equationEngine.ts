import { compile, derivative } from 'mathjs';
import nerdamer from 'nerdamer';
import { roots as nerdamerRoots, solve as nerdamerSolve, solveSystem } from 'nerdamer/solve';
import { formatNumber } from '../utils/formatters';

export interface EquationRootItem {
  label: string;
  value: string;
  numericApprox?: string;
  residual?: string;
  isComplex?: boolean;
}

export interface EquationSolveOutput {
  ok: boolean;
  roots: EquationRootItem[];
  steps: string[];
  discriminant?: string;
  error?: string;
}

export interface NumericalIterationRow {
  iteration: number;
  x: number;
  fx: number;
  extra?: string;
  error: number;
}

export interface NumericalMethodOutput {
  ok: boolean;
  root?: number;
  fx?: number;
  converged: boolean;
  iterations: NumericalIterationRow[];
  steps: string[];
  error?: string;
}

function fmt(n: number): string {
  return formatNumber(n, { precision: 10 });
}

export function solveLinear(a: number, b: number): EquationSolveOutput {
  const steps: string[] = [];
  steps.push(`Equation: ${fmt(a)}x + (${fmt(b)}) = 0`);
  if (a === 0) {
    if (b === 0) {
      steps.push('Both coefficients are 0 -> 0 = 0 (infinite solutions).');
      return {
        ok: true,
        roots: [{ label: 'x', value: 'All real numbers (identity)', residual: '0' }],
        steps,
      };
    }
    return {
      ok: false,
      roots: [],
      steps: [...steps, `${fmt(b)} = 0 is a contradiction.`],
      error: 'No solution: linear coefficient a cannot be zero when b ≠ 0.',
    };
  }
  const x = -b / a;
  steps.push(`Isolate x: ${fmt(a)}x = ${fmt(-b)}`);
  steps.push(`Divide by ${fmt(a)}: x = ${fmt(-b)} / ${fmt(a)} = ${fmt(x)}`);
  const residual = Math.abs(a * x + b);
  steps.push(`Verification: ${fmt(a)}(${fmt(x)}) + (${fmt(b)}) = ${residual.toExponential(2)}`);

  return {
    ok: true,
    roots: [{ label: 'x₁', value: fmt(x), residual: residual.toExponential(2) }],
    steps,
  };
}

export function solveQuadratic(a: number, b: number, c: number): EquationSolveOutput {
  if (a === 0) return solveLinear(b, c);
  const steps: string[] = [];
  steps.push(`Quadratic equation: ${fmt(a)}x² + (${fmt(b)})x + (${fmt(c)}) = 0`);
  const d = b * b - 4 * a * c;
  steps.push(`Discriminant Δ = b² - 4ac = (${fmt(b)})² - 4(${fmt(a)})(${fmt(c)}) = ${fmt(d)}`);

  if (d > 0) {
    const sqrtD = Math.sqrt(d);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    steps.push(`Δ > 0: Two distinct real roots: (-b ± √Δ) / (2a)`);
    steps.push(`x₁ = (${fmt(-b)} + ${fmt(sqrtD)}) / ${fmt(2 * a)} = ${fmt(x1)}`);
    steps.push(`x₂ = (${fmt(-b)} - ${fmt(sqrtD)}) / ${fmt(2 * a)} = ${fmt(x2)}`);
    return {
      ok: true,
      discriminant: fmt(d),
      roots: [
        { label: 'x₁', value: fmt(x1), residual: Math.abs(a * x1 * x1 + b * x1 + c).toExponential(2) },
        { label: 'x₂', value: fmt(x2), residual: Math.abs(a * x2 * x2 + b * x2 + c).toExponential(2) },
      ],
      steps,
    };
  }
  if (d === 0) {
    const x = -b / (2 * a);
    steps.push(`Δ = 0: Repeated real root x = -b / (2a) = ${fmt(x)}`);
    return {
      ok: true,
      discriminant: '0',
      roots: [{ label: 'x₁ = x₂', value: fmt(x), residual: Math.abs(a * x * x + b * x + c).toExponential(2) }],
      steps,
    };
  }

  const realPart = -b / (2 * a);
  const imagPart = Math.sqrt(-d) / (2 * a);
  const absImag = Math.abs(imagPart);
  steps.push(`Δ < 0: Complex conjugate pair`);
  steps.push(`Real part = -b/(2a) = ${fmt(realPart)}, Imaginary part = √|Δ|/(2a) = ${fmt(absImag)}`);
  return {
    ok: true,
    discriminant: fmt(d),
    roots: [
      { label: 'x₁', value: `${fmt(realPart)} + ${fmt(absImag)}i`, isComplex: true, residual: '0' },
      { label: 'x₂', value: `${fmt(realPart)} - ${fmt(absImag)}i`, isComplex: true, residual: '0' },
    ],
    steps,
  };
}

export function solveCubic(a: number, b: number, c: number, d: number): EquationSolveOutput {
  if (a === 0) return solveQuadratic(b, c, d);
  const steps: string[] = [];
  steps.push(`Cubic equation: ${fmt(a)}x³ + (${fmt(b)})x² + (${fmt(c)})x + (${fmt(d)}) = 0`);

  // Depressed cubic: t^3 + pt + q = 0 via x = t - b/(3a)
  const A = b / a;
  const B = c / a;
  const C = d / a;
  const shift = A / 3;
  const p = B - (A * A) / 3;
  const q = (2 * A * A * A) / 27 - (A * B) / 3 + C;
  const disc = (q * q) / 4 + (p * p * p) / 27;

  steps.push(`Depress cubic with x = t - ${fmt(shift)}: t³ + (${fmt(p)})t + (${fmt(q)}) = 0`);
  steps.push(`Cubic discriminant Δ = (q/2)² + (p/3)³ = ${fmt(disc)}`);

  const evalPoly = (x: number) => a * x ** 3 + b * x ** 2 + c * x + d;

  if (disc > 1e-12) {
    const sqrtDisc = Math.sqrt(disc);
    const u = Math.cbrt(-q / 2 + sqrtDisc);
    const v = Math.cbrt(-q / 2 - sqrtDisc);
    const x1 = u + v - shift;
    const realPart = -(u + v) / 2 - shift;
    const imagPart = (Math.sqrt(3) * Math.abs(u - v)) / 2;
    steps.push(`Δ > 0: One real root and two complex conjugate roots.`);
    return {
      ok: true,
      discriminant: fmt(disc),
      roots: [
        { label: 'x₁', value: fmt(x1), residual: Math.abs(evalPoly(x1)).toExponential(2) },
        { label: 'x₂', value: `${fmt(realPart)} + ${fmt(imagPart)}i`, isComplex: true },
        { label: 'x₃', value: `${fmt(realPart)} - ${fmt(imagPart)}i`, isComplex: true },
      ],
      steps,
    };
  }

  if (Math.abs(disc) <= 1e-12) {
    if (Math.abs(p) < 1e-12 && Math.abs(q) < 1e-12) {
      const r = -shift;
      steps.push(`Triple real root x = ${fmt(r)}`);
      return {
        ok: true,
        discriminant: '0',
        roots: [{ label: 'x₁ = x₂ = x₃', value: fmt(r), residual: Math.abs(evalPoly(r)).toExponential(2) }],
        steps,
      };
    }
    const u = Math.cbrt(-q / 2);
    const x1 = 2 * u - shift;
    const x2 = -u - shift;
    steps.push(`Δ = 0: Multiple real roots.`);
    return {
      ok: true,
      discriminant: '0',
      roots: [
        { label: 'x₁', value: fmt(x1), residual: Math.abs(evalPoly(x1)).toExponential(2) },
        { label: 'x₂ = x₃', value: fmt(x2), residual: Math.abs(evalPoly(x2)).toExponential(2) },
      ],
      steps,
    };
  }

  // Three distinct real roots (casus irreducibilis -> trigonometric solution)
  const r = Math.sqrt((-p * p * p) / 27);
  const phi = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r))));
  const m = 2 * Math.sqrt(-p / 3);
  const x1 = m * Math.cos(phi / 3) - shift;
  const x2 = m * Math.cos((phi + 2 * Math.PI) / 3) - shift;
  const x3 = m * Math.cos((phi + 4 * Math.PI) / 3) - shift;
  steps.push(`Δ < 0: Three distinct real roots via trigonometric form.`);

  return {
    ok: true,
    discriminant: fmt(disc),
    roots: [
      { label: 'x₁', value: fmt(x1), residual: Math.abs(evalPoly(x1)).toExponential(2) },
      { label: 'x₂', value: fmt(x2), residual: Math.abs(evalPoly(x2)).toExponential(2) },
      { label: 'x₃', value: fmt(x3), residual: Math.abs(evalPoly(x3)).toExponential(2) },
    ],
    steps,
  };
}

export function solveSymbolicEquation(equationInput: string, variable = 'x'): EquationSolveOutput {
  const trimmed = equationInput.trim();
  if (!trimmed) {
    return { ok: false, roots: [], steps: [], error: 'Please enter an equation or polynomial.' };
  }

  const steps: string[] = [];
  try {
    const normalized = trimmed.includes('=')
      ? trimmed
      : `${trimmed}=0`;
    steps.push(`Normalized equation: ${normalized}`);

    const solSet = nerdamerSolve(normalized, variable);
    const solList = solSet.toString()
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (solList.length > 0 && !solList[0].includes('solve(')) {
      const residualExpr = normalized.includes('=')
        ? `(${normalized.split('=')[0]})-(${normalized.split('=')[1]})`
        : trimmed;
      const compiledResidual = compile(residualExpr);

      const results: EquationRootItem[] = solList.map((sol, idx) => {
        let numericApprox: string | undefined;
        let residual: string | undefined;
        let isComplex = sol.includes('i');

        try {
          const evaluated = nerdamer(sol).evaluate();
          const numVal =
            'text' in evaluated && typeof evaluated.text === 'function'
              ? evaluated.text({ decimal: true })
              : evaluated.toString();
          if (numVal && numVal !== sol) {
            numericApprox = numVal;
          }
          const parsedNum = Number(numVal);
          if (Number.isFinite(parsedNum)) {
            const res = compiledResidual.evaluate({ [variable]: parsedNum });
            if (typeof res === 'number' && Number.isFinite(res)) {
              residual = Math.abs(res).toExponential(2);
            }
          }
        } catch {
          // Symbolic or complex expression
        }

        return {
          label: `${variable}${solList.length > 1 ? `_${idx + 1}` : ''}`,
          value: sol,
          numericApprox,
          residual,
          isComplex,
        };
      });

      steps.push(`Solved symbolically for ${variable}: found ${results.length} solution(s).`);
      return { ok: true, roots: results, steps };
    }

    // Fallback to polynomial numeric roots
    const lhs = normalized.split('=')[0];
    const rhs = normalized.split('=')[1] ?? '0';
    const polyExpr = `(${lhs})-(${rhs})`;
    const rootVec = nerdamerRoots(polyExpr, variable);
    const rootItems = rootVec.toString()
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (rootItems.length === 0) {
      return {
        ok: false,
        roots: [],
        steps,
        error: 'No algebraic roots found. Try the numerical root finders (Newton-Raphson, Bisection, or Secant).',
      };
    }

    steps.push(`Computed polynomial roots using Aberth-Ehrlich solver.`);
    return {
      ok: true,
      roots: rootItems.map((val, idx) => ({
        label: `${variable}_${idx + 1}`,
        value: val,
        isComplex: val.includes('i'),
      })),
      steps,
    };
  } catch (err) {
    return {
      ok: false,
      roots: [],
      steps,
      error: err instanceof Error ? err.message : 'Unable to solve equation.',
    };
  }
}

export function solveLinearSystem2x2(
  a1: number, b1: number, c1: number,
  a2: number, b2: number, c2: number
): EquationSolveOutput {
  const steps: string[] = [
    `Eq 1: ${fmt(a1)}x + (${fmt(b1)})y = ${fmt(c1)}`,
    `Eq 2: ${fmt(a2)}x + (${fmt(b2)})y = ${fmt(c2)}`,
  ];
  const det = a1 * b2 - a2 * b1;
  steps.push(`Determinant D = a₁b₂ - a₂b₁ = (${fmt(a1)})(${fmt(b2)}) - (${fmt(a2)})(${fmt(b1)}) = ${fmt(det)}`);
  if (Math.abs(det) < 1e-12) {
    return {
      ok: false,
      roots: [],
      steps,
      error: 'System has no unique solution (determinant D = 0: parallel or coincident lines).',
    };
  }
  const dx = c1 * b2 - c2 * b1;
  const dy = a1 * c2 - a2 * c1;
  const x = dx / det;
  const y = dy / det;
  steps.push(`Dₓ = ${fmt(dx)}, Dᵧ = ${fmt(dy)}`);
  steps.push(`x = Dₓ / D = ${fmt(x)}, y = Dᵧ / D = ${fmt(y)}`);

  const res1 = Math.abs(a1 * x + b1 * y - c1);
  const res2 = Math.abs(a2 * x + b2 * y - c2);

  return {
    ok: true,
    roots: [
      { label: 'x', value: fmt(x), residual: res1.toExponential(2) },
      { label: 'y', value: fmt(y), residual: res2.toExponential(2) },
    ],
    steps,
  };
}

export function solveLinearSystem3x3(
  rows: [number, number, number, number][]
): EquationSolveOutput {
  const steps: string[] = rows.map(
    (r, idx) => `Eq ${idx + 1}: ${fmt(r[0])}x + (${fmt(r[1])})y + (${fmt(r[2])})z = ${fmt(r[3])}`
  );
  const det3 = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

  const A = rows.map((r) => [r[0], r[1], r[2]]);
  const B = rows.map((r) => r[3]);
  const D = det3(A);
  steps.push(`Determinant D = ${fmt(D)}`);
  if (Math.abs(D) < 1e-12) {
    return {
      ok: false,
      roots: [],
      steps,
      error: 'Singular system (D = 0): equations are linearly dependent or inconsistent.',
    };
  }

  const Dx = det3(A.map((r, i) => [B[i], r[1], r[2]]));
  const Dy = det3(A.map((r, i) => [r[0], B[i], r[2]]));
  const Dz = det3(A.map((r, i) => [r[0], r[1], B[i]]));

  const x = Dx / D;
  const y = Dy / D;
  const z = Dz / D;
  steps.push(`Dₓ = ${fmt(Dx)}, Dᵧ = ${fmt(Dy)}, D_z = ${fmt(Dz)}`);
  steps.push(`x = ${fmt(x)}, y = ${fmt(y)}, z = ${fmt(z)}`);

  const maxRes = Math.max(
    ...rows.map((r) => Math.abs(r[0] * x + r[1] * y + r[2] * z - r[3]))
  );

  return {
    ok: true,
    roots: [
      { label: 'x', value: fmt(x), residual: maxRes.toExponential(2) },
      { label: 'y', value: fmt(y), residual: maxRes.toExponential(2) },
      { label: 'z', value: fmt(z), residual: maxRes.toExponential(2) },
    ],
    steps,
  };
}

export function solveEquationSystemSymbolic(equations: string[]): EquationSolveOutput {
  const cleaned = equations.map((e) => e.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return { ok: false, roots: [], steps: [], error: 'Enter at least one equation.' };
  }
  try {
    const sols = solveSystem(cleaned);
    const items: EquationRootItem[] = [];

    sols.elements.forEach((solEntry, solIdx) => {
      if (solEntry && typeof solEntry === 'object' && 'entries' in solEntry) {
        const dict = solEntry as unknown as { entries: Record<string, unknown> };
        Object.entries(dict.entries).forEach(([variable, val]) => {
          items.push({
            label: sols.elements.length > 1 ? `${variable} (sol ${solIdx + 1})` : variable,
            value: String(val),
          });
        });
      } else {
        items.push({
          label: `sol_${solIdx + 1}`,
          value: String(solEntry),
        });
      }
    });

    if (items.length === 0) {
      return {
        ok: false,
        roots: [],
        steps: [],
        error: 'System appears inconsistent or has no isolated solution.',
      };
    }

    return {
      ok: true,
      roots: items,
      steps: [`Solved system of ${cleaned.length} equations symbolically.`],
    };
  } catch (err) {
    return {
      ok: false,
      roots: [],
      steps: [],
      error: err instanceof Error ? err.message : 'Unable to solve equation system.',
    };
  }
}

export function newtonRaphsonMethod(
  expr: string,
  x0: number,
  tolerance = 1e-8,
  maxIter = 50
): NumericalMethodOutput {
  const steps: string[] = [];
  try {
    const f = compile(expr);
    const dfNode = derivative(expr, 'x');
    const df = dfNode.compile();
    steps.push(`f(x) = ${expr}`);
    steps.push(`f'(x) = ${dfNode.toString()}`);

    const iterations: NumericalIterationRow[] = [];
    let x = x0;

    for (let i = 1; i <= maxIter; i++) {
      const fx = Number(f.evaluate({ x }));
      const dfx = Number(df.evaluate({ x }));
      if (!Number.isFinite(fx) || !Number.isFinite(dfx)) {
        return {
          ok: false,
          converged: false,
          iterations,
          steps,
          error: `Evaluation became undefined at x = ${fmt(x)}.`,
        };
      }
      if (Math.abs(dfx) < 1e-14) {
        return {
          ok: false,
          converged: false,
          iterations,
          steps,
          error: `Derivative f'(x) = 0 at x = ${fmt(x)}. Newton-Raphson cannot continue.`,
        };
      }
      const nextX = x - fx / dfx;
      const err = Math.abs(nextX - x);
      iterations.push({
        iteration: i,
        x,
        fx,
        extra: `f'(x)=${fmt(dfx)}`,
        error: err,
      });

      if (err < tolerance || Math.abs(fx) < tolerance) {
        const finalFx = Number(f.evaluate({ x: nextX }));
        steps.push(`Converged in ${i} iterations to x ≈ ${fmt(nextX)} with |f(x)| = ${Math.abs(finalFx).toExponential(2)}.`);
        return {
          ok: true,
          root: nextX,
          fx: finalFx,
          converged: true,
          iterations,
          steps,
        };
      }
      x = nextX;
    }

    return {
      ok: true,
      root: x,
      fx: Number(f.evaluate({ x })),
      converged: false,
      iterations,
      steps: [...steps, `Reached max iterations (${maxIter}) without full tolerance convergence.`],
    };
  } catch (err) {
    return {
      ok: false,
      converged: false,
      iterations: [],
      steps,
      error: err instanceof Error ? err.message : 'Invalid expression for Newton-Raphson.',
    };
  }
}

export function bisectionMethod(
  expr: string,
  aInit: number,
  bInit: number,
  tolerance = 1e-8,
  maxIter = 60
): NumericalMethodOutput {
  const steps: string[] = [];
  try {
    const f = compile(expr);
    let a = aInit;
    let b = bInit;
    let fa = Number(f.evaluate({ x: a }));
    let fb = Number(f.evaluate({ x: b }));

    if (!Number.isFinite(fa) || !Number.isFinite(fb)) {
      return { ok: false, converged: false, iterations: [], steps, error: 'f(a) or f(b) is undefined.' };
    }
    if (fa * fb > 0) {
      return {
        ok: false,
        converged: false,
        iterations: [],
        steps,
        error: `Root is not bracketed: f(${fmt(a)}) = ${fmt(fa)} and f(${fmt(b)}) = ${fmt(fb)} have the same sign.`,
      };
    }

    steps.push(`Bracket [${fmt(a)}, ${fmt(b)}] verified: f(a)·f(b) ≤ 0.`);
    const iterations: NumericalIterationRow[] = [];
    let mid = (a + b) / 2;

    for (let i = 1; i <= maxIter; i++) {
      mid = (a + b) / 2;
      const fmid = Number(f.evaluate({ x: mid }));
      const err = Math.abs(b - a) / 2;
      iterations.push({
        iteration: i,
        x: mid,
        fx: fmid,
        extra: `[${fmt(a)}, ${fmt(b)}]`,
        error: err,
      });

      if (Math.abs(fmid) < tolerance || err < tolerance) {
        steps.push(`Converged in ${i} iterations to x ≈ ${fmt(mid)}.`);
        return { ok: true, root: mid, fx: fmid, converged: true, iterations, steps };
      }

      if (fa * fmid < 0) {
        b = mid;
        fb = fmid;
      } else {
        a = mid;
        fa = fmid;
      }
    }

    return {
      ok: true,
      root: mid,
      fx: Number(f.evaluate({ x: mid })),
      converged: false,
      iterations,
      steps,
    };
  } catch (err) {
    return {
      ok: false,
      converged: false,
      iterations: [],
      steps,
      error: err instanceof Error ? err.message : 'Invalid expression for Bisection.',
    };
  }
}

export function secantMethod(
  expr: string,
  x0Init: number,
  x1Init: number,
  tolerance = 1e-8,
  maxIter = 50
): NumericalMethodOutput {
  const steps: string[] = [];
  try {
    const f = compile(expr);
    let x0 = x0Init;
    let x1 = x1Init;
    const iterations: NumericalIterationRow[] = [];

    for (let i = 1; i <= maxIter; i++) {
      const f0 = Number(f.evaluate({ x: x0 }));
      const f1 = Number(f.evaluate({ x: x1 }));
      const denom = f1 - f0;
      if (!Number.isFinite(f0) || !Number.isFinite(f1)) {
        return { ok: false, converged: false, iterations, steps, error: 'Function undefined during iteration.' };
      }
      if (Math.abs(denom) < 1e-14) {
        return {
          ok: false,
          converged: false,
          iterations,
          steps,
          error: 'Secant denominator f(x₁) - f(x₀) became zero.',
        };
      }

      const x2 = x1 - (f1 * (x1 - x0)) / denom;
      const fx2 = Number(f.evaluate({ x: x2 }));
      const err = Math.abs(x2 - x1);

      iterations.push({
        iteration: i,
        x: x2,
        fx: fx2,
        extra: `x₀=${fmt(x0)}, x₁=${fmt(x1)}`,
        error: err,
      });

      if (err < tolerance || Math.abs(fx2) < tolerance) {
        steps.push(`Converged in ${i} iterations to x ≈ ${fmt(x2)}.`);
        return { ok: true, root: x2, fx: fx2, converged: true, iterations, steps };
      }

      x0 = x1;
      x1 = x2;
    }

    return {
      ok: true,
      root: x1,
      fx: Number(f.evaluate({ x: x1 })),
      converged: false,
      iterations,
      steps,
    };
  } catch (err) {
    return {
      ok: false,
      converged: false,
      iterations: [],
      steps,
      error: err instanceof Error ? err.message : 'Invalid expression for Secant method.',
    };
  }
}
