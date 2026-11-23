import * as math from 'mathjs';
import { formatNumber } from '../utils/formatters';

export type MatrixData = number[][];

export interface MatrixResult {
  ok: boolean;
  scalar?: string;
  matrix?: MatrixData;
  secondaryMatrix?: MatrixData;
  secondaryLabel?: string;
  tertiaryMatrix?: MatrixData;
  tertiaryLabel?: string;
  eigenPairs?: { eigenvalue: string; eigenvector: string[] }[];
  steps?: string[];
  error?: string;
}

const EPS = 1e-10;

function cleanVal(v: number): number {
  return Math.abs(v) < EPS ? 0 : Number(v.toFixed(12));
}

function cloneMatrix(m: MatrixData): MatrixData {
  return m.map((row) => row.map((v) => cleanVal(v)));
}

function assertSquare(m: MatrixData, op: string) {
  if (m.length === 0 || m.length !== m[0].length) {
    throw new Error(`${op} requires a square matrix (got ${m.length}×${m[0]?.length ?? 0}).`);
  }
}

export function createZeroMatrix(rows: number, cols: number): MatrixData {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
}

export function createIdentityMatrix(size: number): MatrixData {
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (__, c) => (r === c ? 1 : 0))
  );
}

export function isSymmetricMatrix(m: MatrixData): boolean {
  if (m.length !== m[0].length) return false;
  for (let i = 0; i < m.length; i++) {
    for (let j = i + 1; j < m.length; j++) {
      if (Math.abs(m[i][j] - m[j][i]) > 1e-9) return false;
    }
  }
  return true;
}

export function addMatrices(a: MatrixData, b: MatrixData): MatrixResult {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    return {
      ok: false,
      error: `Dimension mismatch: cannot add ${a.length}×${a[0].length} and ${b.length}×${b[0].length}.`,
    };
  }
  return {
    ok: true,
    matrix: a.map((row, r) => row.map((v, c) => cleanVal(v + b[r][c]))),
  };
}

export function subtractMatrices(a: MatrixData, b: MatrixData): MatrixResult {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    return {
      ok: false,
      error: `Dimension mismatch: cannot subtract ${b.length}×${b[0].length} from ${a.length}×${a[0].length}.`,
    };
  }
  return {
    ok: true,
    matrix: a.map((row, r) => row.map((v, c) => cleanVal(v - b[r][c]))),
  };
}

export function multiplyMatrices(a: MatrixData, b: MatrixData): MatrixResult {
  if (a[0].length !== b.length) {
    return {
      ok: false,
      error: `Dimension mismatch: A has ${a[0].length} columns but B has ${b.length} rows.`,
    };
  }
  const rows = a.length;
  const cols = b[0].length;
  const inner = b.length;
  const out = createZeroMatrix(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let sum = 0;
      for (let k = 0; k < inner; k++) sum += a[r][k] * b[k][c];
      out[r][c] = cleanVal(sum);
    }
  }
  return { ok: true, matrix: out };
}

export function scalarMultiplyMatrix(a: MatrixData, scalar: number): MatrixResult {
  return {
    ok: true,
    matrix: a.map((row) => row.map((v) => cleanVal(v * scalar))),
  };
}

export function transposeMatrix(a: MatrixData): MatrixResult {
  const rows = a.length;
  const cols = a[0].length;
  const out = createZeroMatrix(cols, rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out[c][r] = cleanVal(a[r][c]);
    }
  }
  return { ok: true, matrix: out };
}

export function traceMatrix(a: MatrixData): MatrixResult {
  try {
    assertSquare(a, 'Trace');
    let tr = 0;
    for (let i = 0; i < a.length; i++) tr += a[i][i];
    return { ok: true, scalar: formatNumber(cleanVal(tr), { precision: 10 }) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Trace failed.' };
  }
}

export function determinantMatrix(a: MatrixData): MatrixResult {
  try {
    assertSquare(a, 'Determinant');
    const det = Number(math.det(a));
    return { ok: true, scalar: formatNumber(cleanVal(det), { precision: 10 }) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Determinant failed.' };
  }
}

export function inverseMatrix(a: MatrixData): MatrixResult {
  try {
    assertSquare(a, 'Matrix inverse');
    const det = Number(math.det(a));
    if (Math.abs(det) < EPS) {
      return {
        ok: false,
        error: 'Singular matrix: determinant is 0, so this matrix has no inverse.',
      };
    }
    const inv = math.inv(a) as MatrixData;
    return { ok: true, matrix: cloneMatrix(inv) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Matrix inversion failed.' };
  }
}

function minorMatrix(m: MatrixData, skipR: number, skipC: number): MatrixData {
  return m
    .filter((_, r) => r !== skipR)
    .map((row) => row.filter((_, c) => c !== skipC));
}

export function cofactorAndAdjoint(a: MatrixData): MatrixResult {
  try {
    assertSquare(a, 'Cofactor & Adjoint');
    const n = a.length;
    const cof = createZeroMatrix(n, n);
    if (n === 1) {
      cof[0][0] = 1;
      return { ok: true, matrix: cof, secondaryMatrix: cof, secondaryLabel: 'Cofactor Matrix' };
    }
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const sub = minorMatrix(a, r, c);
        const detSub = Number(math.det(sub));
        cof[r][c] = cleanVal(((r + c) % 2 === 0 ? 1 : -1) * detSub);
      }
    }
    const adj = transposeMatrix(cof).matrix!;
    return {
      ok: true,
      matrix: adj,
      secondaryMatrix: cof,
      secondaryLabel: 'Cofactor Matrix',
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Adjoint calculation failed.' };
  }
}

export function computeEchelonForm(
  a: MatrixData,
  reduced: boolean
): { matrix: MatrixData; rank: number; steps: string[] } {
  const m = cloneMatrix(a);
  const rows = m.length;
  const cols = m[0].length;
  const steps: string[] = [];
  let lead = 0;
  let rank = 0;

  for (let r = 0; r < rows; r++) {
    if (lead >= cols) break;
    let i = r;
    while (Math.abs(m[i][lead]) < EPS) {
      i++;
      if (i === rows) {
        i = r;
        lead++;
        if (lead === cols) break;
      }
    }
    if (lead === cols) break;

    if (i !== r) {
      [m[i], m[r]] = [m[r], m[i]];
      steps.push(`Swap R${r + 1} ↔ R${i + 1}`);
    }

    const pivot = m[r][lead];
    if (reduced && Math.abs(pivot - 1) > EPS) {
      for (let c = 0; c < cols; c++) m[r][c] = cleanVal(m[r][c] / pivot);
      steps.push(`R${r + 1} ← R${r + 1} / ${formatNumber(pivot, { precision: 6 })}`);
    }

    const startRow = reduced ? 0 : r + 1;
    for (let k = startRow; k < rows; k++) {
      if (k !== r && Math.abs(m[k][lead]) > EPS) {
        const factor = m[k][lead] / m[r][lead];
        for (let c = 0; c < cols; c++) {
          m[k][c] = cleanVal(m[k][c] - factor * m[r][c]);
        }
        steps.push(`R${k + 1} ← R${k + 1} - (${formatNumber(factor, { precision: 6 })})·R${r + 1}`);
      }
    }

    rank++;
    lead++;
  }

  return { matrix: m, rank, steps };
}

export function rankMatrix(a: MatrixData): MatrixResult {
  const { rank, steps } = computeEchelonForm(a, false);
  return { ok: true, scalar: String(rank), steps };
}

export function luDecomposition(a: MatrixData): MatrixResult {
  try {
    assertSquare(a, 'LU Decomposition');
    const n = a.length;
    const L = createIdentityMatrix(n);
    const U = createZeroMatrix(n, n);
    const P = createIdentityMatrix(n);
    const work = cloneMatrix(a);
    const steps: string[] = [];

    for (let k = 0; k < n; k++) {
      // Partial pivot
      let maxRow = k;
      let maxVal = Math.abs(work[k][k]);
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(work[i][k]) > maxVal) {
          maxVal = Math.abs(work[i][k]);
          maxRow = i;
        }
      }
      if (maxRow !== k) {
        [work[k], work[maxRow]] = [work[maxRow], work[k]];
        [P[k], P[maxRow]] = [P[maxRow], P[k]];
        for (let j = 0; j < k; j++) {
          [L[k][j], L[maxRow][j]] = [L[maxRow][j], L[k][j]];
        }
        steps.push(`Pivot swap row ${k + 1} ↔ row ${maxRow + 1}`);
      }

      if (Math.abs(work[k][k]) < EPS) {
        return {
          ok: false,
          error: 'Matrix is singular or zero-pivot encountered during LU factorization.',
        };
      }

      for (let j = k; j < n; j++) {
        U[k][j] = cleanVal(work[k][j]);
      }
      for (let i = k + 1; i < n; i++) {
        const factor = work[i][k] / work[k][k];
        L[i][k] = cleanVal(factor);
        for (let j = k; j < n; j++) {
          work[i][j] = cleanVal(work[i][j] - factor * work[k][j]);
        }
      }
    }

    steps.push('Factored as P·A = L·U with partial pivoting.');
    return {
      ok: true,
      matrix: U,
      secondaryMatrix: L,
      secondaryLabel: 'Lower Triangular (L)',
      tertiaryMatrix: P,
      tertiaryLabel: 'Permutation Matrix (P)',
      steps,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'LU decomposition failed.' };
  }
}

export function eigenAnalysis(a: MatrixData): MatrixResult {
  try {
    assertSquare(a, 'Eigenvalues & Eigenvectors');
    const res = math.eigs(a);
    const values = Array.isArray(res.values)
      ? res.values
      : ((res.values as math.Matrix).toArray() as unknown[]);
    const eigens = (res.eigenvectors ?? []) as Array<{
      value: unknown;
      vector: math.Matrix | number[];
    }>;

    const formatComplexOrReal = (v: unknown): string => {
      if (typeof v === 'number') return formatNumber(cleanVal(v), { precision: 8 });
      if (v && typeof v === 'object' && 're' in v && 'im' in v) {
        const c = v as { re: number; im: number };
        const re = cleanVal(c.re);
        const im = cleanVal(c.im);
        if (Math.abs(im) < 1e-10) return formatNumber(re, { precision: 8 });
        const sign = im >= 0 ? '+' : '-';
        return `${formatNumber(re, { precision: 6 })} ${sign} ${formatNumber(Math.abs(im), { precision: 6 })}i`;
      }
      return String(v);
    };

    const pairs = eigens.length > 0
      ? eigens.map((item) => {
          const vecArr = Array.isArray(item.vector)
            ? item.vector
            : ((item.vector as math.Matrix).toArray() as unknown[]);
          return {
            eigenvalue: formatComplexOrReal(item.value),
            eigenvector: vecArr.map((v) => formatComplexOrReal(v)),
          };
        })
      : values.map((val) => ({
          eigenvalue: formatComplexOrReal(val),
          eigenvector: [],
        }));

    return {
      ok: true,
      eigenPairs: pairs,
      steps: [`Computed ${pairs.length} eigenvalue/eigenvector pair(s).`],
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Eigenvalue computation failed for this matrix.',
    };
  }
}

export function solveLinearMatrixEquation(a: MatrixData, b: MatrixData): MatrixResult {
  try {
    assertSquare(a, 'Solve AX = B');
    if (b.length !== a.length) {
      return {
        ok: false,
        error: `Dimension mismatch: A is ${a.length}×${a[0].length}, so B must have ${a.length} rows (got ${b.length}).`,
      };
    }
    const det = Number(math.det(a));
    if (Math.abs(det) < EPS) {
      return {
        ok: false,
        error: 'Coefficient matrix A is singular (det = 0); no unique solution exists.',
      };
    }
    const aug = a.map((row, r) => [...row, ...b[r]]);
    const { matrix: rref, steps } = computeEchelonForm(aug, true);
    const n = a[0].length;
    const xCols = b[0].length;
    const solution = rref.map((row) => row.slice(n, n + xCols));
    return {
      ok: true,
      matrix: solution,
      steps: ['Augmented [A | B] reduced via Gauss-Jordan elimination:', ...steps],
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to solve AX = B.' };
  }
}
