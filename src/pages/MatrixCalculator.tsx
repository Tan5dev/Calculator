import { useState } from 'react';
import { MatrixInput } from '../components/MatrixInput';
import { ResultPanel } from '../components/ResultPanel';
import { useCalculator } from '../context/CalculatorContext';
import {
  addMatrices,
  cofactorAndAdjoint,
  computeEchelonForm,
  createIdentityMatrix,
  createZeroMatrix,
  determinantMatrix,
  eigenAnalysis,
  inverseMatrix,
  isSymmetricMatrix,
  luDecomposition,
  multiplyMatrices,
  rankMatrix,
  scalarMultiplyMatrix,
  solveLinearMatrixEquation,
  subtractMatrices,
  traceMatrix,
  transposeMatrix,
  type MatrixData,
  type MatrixResult,
} from '../engines/matrixEngine';

function resizeMatrix(mat: MatrixData, newRows: number, newCols: number): MatrixData {
  return Array.from({ length: newRows }, (_, r) =>
    Array.from({ length: newCols }, (__, c) => mat[r]?.[c] ?? 0)
  );
}

function MatrixDisplayTable({ title, data }: { title?: string; data: MatrixData }) {
  return (
    <div className="space-y-1.5">
      {title && <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</div>}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19] p-3">
        <table className="font-mono text-sm tabular-nums mx-auto">
          <tbody>
            {data.map((row, r) => (
              <tr key={r}>
                {row.map((val, c) => (
                  <td
                    key={c}
                    className="px-3 py-1.5 text-right text-slate-900 dark:text-cyan-300 whitespace-nowrap"
                  >
                    {Number(val.toFixed(6))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MatrixCalculator() {
  const { addHistory } = useCalculator();
  const [matrixA, setMatrixA] = useState<MatrixData>([
    [1, 2],
    [3, 4],
  ]);
  const [matrixB, setMatrixB] = useState<MatrixData>([
    [5, 6],
    [7, 8],
  ]);
  const [scalarK, setScalarK] = useState(2);
  const [activeOp, setActiveOp] = useState('Determinant det(A)');
  const [result, setResult] = useState<MatrixResult>(() => determinantMatrix([[1, 2], [3, 4]]));

  const applyPreset = (
    setter: (m: MatrixData) => void,
    current: MatrixData,
    preset: 'identity' | 'zero' | 'random' | 'symmetric'
  ) => {
    const r = current.length;
    const c = current[0].length;
    if (preset === 'zero') {
      setter(createZeroMatrix(r, c));
    } else if (preset === 'identity') {
      const size = Math.min(r, c);
      const id = createIdentityMatrix(size);
      setter(resizeMatrix(id, r, c));
    } else if (preset === 'random') {
      setter(
        Array.from({ length: r }, () =>
          Array.from({ length: c }, () => Math.floor(Math.random() * 19) - 9)
        )
      );
    } else {
      const sym = createZeroMatrix(r, r);
      for (let i = 0; i < r; i++) {
        for (let j = i; j < r; j++) {
          const val = Math.floor(Math.random() * 11) - 5;
          sym[i][j] = val;
          sym[j][i] = val;
        }
      }
      setter(resizeMatrix(sym, r, c));
    }
  };

  const runOp = (label: string, fn: () => MatrixResult) => {
    setActiveOp(label);
    const res = fn();
    setResult(res);
    if (res.ok) {
      addHistory({
        module: 'Matrix',
        expression: label,
        result: res.scalar ?? (res.matrix ? `${res.matrix.length}×${res.matrix[0].length} matrix` : 'Computed'),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MatrixInput
          label="Matrix A"
          matrix={matrixA}
          onChange={setMatrixA}
          onResize={(r, c) => setMatrixA((prev) => resizeMatrix(prev, r, c))}
          onPreset={(p) => applyPreset(setMatrixA, matrixA, p)}
        />
        <MatrixInput
          label="Matrix B"
          matrix={matrixB}
          onChange={setMatrixB}
          onResize={(r, c) => setMatrixB((prev) => resizeMatrix(prev, r, c))}
          onPreset={(p) => applyPreset(setMatrixB, matrixB, p)}
        />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Matrix Operations
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span>Scalar k =</span>
              <input
                type="number"
                step="any"
                value={scalarK}
                onChange={(e) => setScalarK(Number(e.target.value))}
                className="w-20 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-slate-900 dark:text-slate-100"
              />
            </label>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-slate-400">
              A is {isSymmetricMatrix(matrixA) ? 'Symmetric' : 'Non-symmetric'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={() => runOp('A + B', () => addMatrices(matrixA, matrixB))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            A + B
          </button>
          <button
            type="button"
            onClick={() => runOp('A - B', () => subtractMatrices(matrixA, matrixB))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            A − B
          </button>
          <button
            type="button"
            onClick={() => runOp('A × B', () => multiplyMatrices(matrixA, matrixB))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            A × B
          </button>
          <button
            type="button"
            onClick={() => runOp(`${scalarK} · A`, () => scalarMultiplyMatrix(matrixA, scalarK))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            k · A
          </button>
          <button
            type="button"
            onClick={() => runOp('Transpose(A)', () => transposeMatrix(matrixA))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            Aᵀ
          </button>
          <button
            type="button"
            onClick={() => runOp('Determinant det(A)', () => determinantMatrix(matrixA))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            det(A)
          </button>

          <button
            type="button"
            onClick={() => runOp('Inverse A⁻¹', () => inverseMatrix(matrixA))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            A⁻¹
          </button>
          <button
            type="button"
            onClick={() => runOp('Rank(A)', () => rankMatrix(matrixA))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            rank(A)
          </button>
          <button
            type="button"
            onClick={() => runOp('Trace(A)', () => traceMatrix(matrixA))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            tr(A)
          </button>
          <button
            type="button"
            onClick={() => runOp('Adjoint & Cofactor(A)', () => cofactorAndAdjoint(matrixA))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            adj(A) / cof
          </button>
          <button
            type="button"
            onClick={() =>
              runOp('Row Echelon Form (Gaussian)', () => {
                const { matrix, steps } = computeEchelonForm(matrixA, false);
                return { ok: true, matrix, steps };
              })
            }
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            REF (Gaussian)
          </button>
          <button
            type="button"
            onClick={() =>
              runOp('Reduced Row Echelon (Gauss-Jordan)', () => {
                const { matrix, steps } = computeEchelonForm(matrixA, true);
                return { ok: true, matrix, steps };
              })
            }
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            RREF (G-J)
          </button>

          <button
            type="button"
            onClick={() => runOp('LU Decomposition (PA = LU)', () => luDecomposition(matrixA))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            LU Decomp
          </button>
          <button
            type="button"
            onClick={() => runOp('Eigenvalues & Eigenvectors(A)', () => eigenAnalysis(matrixA))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            Eigenvalues
          </button>
          <button
            type="button"
            onClick={() => runOp('Solve AX = B', () => solveLinearMatrixEquation(matrixA, matrixB))}
            className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-medium cursor-pointer col-span-2"
          >
            Solve AX = B
          </button>
          <button
            type="button"
            onClick={() => {
              const tmp = matrixA;
              setMatrixA(matrixB);
              setMatrixB(tmp);
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            Swap A ↔ B
          </button>
          <button
            type="button"
            onClick={() =>
              runOp('Symmetric Projection (A + Aᵀ)/2', () => {
                if (matrixA.length !== matrixA[0].length) {
                  return { ok: false, error: 'Symmetric projection requires a square matrix.' };
                }
                const at = transposeMatrix(matrixA).matrix!;
                const sum = addMatrices(matrixA, at).matrix!;
                return scalarMultiplyMatrix(sum, 0.5);
              })
            }
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono cursor-pointer"
          >
            (A+Aᵀ)/2
          </button>
        </div>
      </div>

      <ResultPanel
        title={`Result · ${activeOp}`}
        primaryValue={result.scalar}
        error={result.error}
        steps={result.steps}
      >
        {result.matrix && <MatrixDisplayTable title="Primary Matrix Output" data={result.matrix} />}
        {result.secondaryMatrix && (
          <MatrixDisplayTable title={result.secondaryLabel} data={result.secondaryMatrix} />
        )}
        {result.tertiaryMatrix && (
          <MatrixDisplayTable title={result.tertiaryLabel} data={result.tertiaryMatrix} />
        )}
        {result.eigenPairs && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2 text-left">Index</th>
                  <th className="py-2 text-left">Eigenvalue (λ)</th>
                  <th className="py-2 text-left">Eigenvector (v)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                {result.eigenPairs.map((pair, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-slate-400">λ{idx + 1}</td>
                    <td className="py-2 font-semibold text-cyan-600 dark:text-cyan-300">
                      {pair.eigenvalue}
                    </td>
                    <td className="py-2 text-slate-800 dark:text-slate-200">
                      [{pair.eigenvector.join(', ')}]ᵀ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ResultPanel>
    </div>
  );
}
