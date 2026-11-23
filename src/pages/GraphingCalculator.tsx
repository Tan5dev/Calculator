import { Eye, EyeOff, Plus, RotateCcw, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GraphPanel } from '../components/GraphPanel';
import { useCalculator } from '../context/CalculatorContext';
import { buildPlotData } from '../engines/graphEngine';
import type { GraphFunctionItem, GraphPlotType } from '../types/calculator';

const PALETTE = ['#06B6D4', '#F59E0B', '#10B981', '#F43F5E', '#3B82F6', '#A855F7'];

const INITIAL_FUNCTIONS: GraphFunctionItem[] = [
  {
    id: 'fn-1',
    label: 'f₁',
    expression: 'sin(x) * exp(-0.1 * x^2)',
    color: '#06B6D4',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'fn-2',
    label: 'f₂',
    expression: '0.2 * x^2 - 1',
    color: '#F59E0B',
    visible: true,
    type: 'cartesian',
  },
];

export function GraphingCalculator() {
  const { settings, addHistory } = useCalculator();
  const [functions, setFunctions] = useState<GraphFunctionItem[]>(INITIAL_FUNCTIONS);
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-6);
  const [yMax, setYMax] = useState(6);
  const [tMin, setTMin] = useState(0);
  const [tMax, setTMax] = useState(12.5664);
  const [showFeatures, setShowFeatures] = useState(true);
  const [trackedPoint, setTrackedPoint] = useState<{ x: number; y: number } | null>(null);

  const plotResult = useMemo(
    () =>
      buildPlotData(functions, {
        xMin,
        xMax,
        yMin,
        yMax,
        tMin,
        tMax,
        angleMode: settings.angleMode,
        showFeatures,
      }),
    [functions, xMin, xMax, yMin, yMax, tMin, tMax, settings.angleMode, showFeatures]
  );

  const addFunction = () => {
    const idx = functions.length + 1;
    setFunctions((prev) => [
      ...prev,
      {
        id: `fn-${Date.now()}`,
        label: `f${idx}`,
        expression: 'cos(x)',
        color: PALETTE[(idx - 1) % PALETTE.length],
        visible: true,
        type: 'cartesian',
      },
    ]);
  };

  const updateFunction = (id: string, patch: Partial<GraphFunctionItem>) => {
    setFunctions((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeFunction = (id: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  const zoom = (factor: number) => {
    const cx = (xMin + xMax) / 2;
    const cy = (yMin + yMax) / 2;
    const hw = ((xMax - xMin) / 2) * factor;
    const hh = ((yMax - yMin) / 2) * factor;
    setXMin(Number((cx - hw).toFixed(3)));
    setXMax(Number((cx + hw).toFixed(3)));
    setYMin(Number((cy - hh).toFixed(3)));
    setYMax(Number((cy + hh).toFixed(3)));
  };

  const resetView = () => {
    setXMin(-10);
    setXMax(10);
    setYMin(-6);
    setYMax(6);
    setTMin(0);
    setTMax(Number((4 * Math.PI).toFixed(4)));
  };

  const applyPreset = (
    preset: 'cartesian' | 'polar' | 'parametric' | 'implicit' | 'surface3d' | 'parametric3d'
  ) => {
    resetView();
    if (preset === 'cartesian') {
      setFunctions([
        { id: 'p1', label: 'f₁', expression: 'x^3 - 3*x', color: '#06B6D4', visible: true, type: 'cartesian' },
        { id: 'p2', label: 'f₂', expression: '2*sin(x)', color: '#F59E0B', visible: true, type: 'cartesian' },
      ]);
      addHistory({ module: 'Graphing', expression: 'y = x^3 - 3*x', result: 'Plotted 2D Cartesian' });
    } else if (preset === 'polar') {
      setXMin(-5);
      setXMax(5);
      setYMin(-5);
      setYMax(5);
      setTMin(0);
      setTMax(settings.angleMode === 'DEG' ? 360 : Number((2 * Math.PI).toFixed(4)));
      setFunctions([
        { id: 'p1', label: 'r₁', expression: '4 * cos(3 * theta)', color: '#06B6D4', visible: true, type: 'polar' },
      ]);
    } else if (preset === 'parametric') {
      setXMin(-6);
      setXMax(6);
      setYMin(-6);
      setYMax(6);
      setTMin(0);
      setTMax(settings.angleMode === 'DEG' ? 360 : Number((2 * Math.PI).toFixed(4)));
      setFunctions([
        {
          id: 'p1',
          label: 'p₁',
          expression: '4 * sin(3 * t)',
          expressionY: '4 * cos(2 * t)',
          color: '#10B981',
          visible: true,
          type: 'parametric',
        },
      ]);
    } else if (preset === 'implicit') {
      setXMin(-6);
      setXMax(6);
      setYMin(-6);
      setYMax(6);
      setFunctions([
        { id: 'p1', label: 'c₁', expression: 'x^2 + y^2 - 16', color: '#F43F5E', visible: true, type: 'implicit' },
        { id: 'p2', label: 'c₂', expression: 'x^2/9 - y^2/4 - 1', color: '#06B6D4', visible: true, type: 'implicit' },
      ]);
    } else if (preset === 'surface3d') {
      setXMin(-6);
      setXMax(6);
      setYMin(-6);
      setYMax(6);
      setFunctions([
        {
          id: 'p1',
          label: 'z₁',
          expression: 'sin(sqrt(x^2 + y^2)) / (sqrt(x^2 + y^2) + 0.5)',
          color: '#06B6D4',
          visible: true,
          type: 'surface3d',
        },
      ]);
    } else if (preset === 'parametric3d') {
      setTMin(0);
      setTMax(settings.angleMode === 'DEG' ? 1080 : Number((6 * Math.PI).toFixed(4)));
      setFunctions([
        {
          id: 'p1',
          label: 'h₁',
          expression: '3 * cos(t)',
          expressionY: '3 * sin(t)',
          expressionZ: 't',
          color: '#06B6D4',
          visible: true,
          type: 'parametric3d',
        },
      ]);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-4 space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Plot Functions
            </h2>
            <button
              type="button"
              onClick={addFunction}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['cartesian', '2D y=f(x)'],
                ['polar', 'Polar r(θ)'],
                ['parametric', 'Parametric 2D'],
                ['implicit', 'Implicit F(x,y)=0'],
                ['surface3d', '3D Surface'],
                ['parametric3d', '3D Curve'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {functions.map((fn) => (
              <div
                key={fn.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label={`Color for ${fn.label}`}
                      value={fn.color}
                      onChange={(e) => updateFunction(fn.id, { color: e.target.value })}
                      className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <select
                      value={fn.type}
                      onChange={(e) => updateFunction(fn.id, { type: e.target.value as GraphPlotType })}
                      className="text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-800 dark:text-slate-200"
                    >
                      <option value="cartesian">Cartesian y=f(x)</option>
                      <option value="polar">Polar r=f(θ)</option>
                      <option value="parametric">Parametric (x(t), y(t))</option>
                      <option value="implicit">Implicit F(x,y)=0</option>
                      <option value="surface3d">3D Surface z=f(x,y)</option>
                      <option value="parametric3d">3D Curve (x(t),y(t),z(t))</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateFunction(fn.id, { visible: !fn.visible })}
                      aria-label={fn.visible ? 'Hide trace' : 'Show trace'}
                      className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                    >
                      {fn.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFunction(fn.id)}
                      aria-label="Remove function"
                      className="p-1.5 rounded-md text-slate-500 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={fn.expression}
                  onChange={(e) => updateFunction(fn.id, { expression: e.target.value })}
                  placeholder={
                    fn.type === 'parametric' || fn.type === 'parametric3d'
                      ? 'x(t) expression'
                      : fn.type === 'polar'
                        ? 'r(theta) expression'
                        : 'Expression'
                  }
                  spellCheck={false}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-slate-100"
                />

                {(fn.type === 'parametric' || fn.type === 'parametric3d') && (
                  <input
                    type="text"
                    value={fn.expressionY ?? ''}
                    onChange={(e) => updateFunction(fn.id, { expressionY: e.target.value })}
                    placeholder="y(t) expression"
                    spellCheck={false}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-slate-100"
                  />
                )}

                {fn.type === 'parametric3d' && (
                  <input
                    type="text"
                    value={fn.expressionZ ?? ''}
                    onChange={(e) => updateFunction(fn.id, { expressionZ: e.target.value })}
                    placeholder="z(t) expression"
                    spellCheck={false}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-slate-100"
                  />
                )}

                {plotResult.errors.find((err) => err.id === fn.id) && (
                  <p className="text-xs text-rose-500">
                    {plotResult.errors.find((err) => err.id === fn.id)?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Domain &amp; Range
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => zoom(0.7)}
                aria-label="Zoom in"
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => zoom(1.4)}
                aria-label="Zoom out"
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetView}
                aria-label="Reset viewport"
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400">x Min</span>
              <input
                type="number"
                value={xMin}
                onChange={(e) => setXMin(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400">x Max</span>
              <input
                type="number"
                value={xMax}
                onChange={(e) => setXMax(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400">y Min</span>
              <input
                type="number"
                value={yMin}
                onChange={(e) => setYMin(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400">y Max</span>
              <input
                type="number"
                value={yMax}
                onChange={(e) => setYMax(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400">t / θ Min</span>
              <input
                type="number"
                step="any"
                value={tMin}
                onChange={(e) => setTMin(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400">t / θ Max</span>
              <input
                type="number"
                step="any"
                value={tMax}
                onChange={(e) => setTMax(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showFeatures}
              onChange={(e) => setShowFeatures(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700"
            />
            <span>Detect roots, y-intercepts &amp; local extrema</span>
          </label>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-4">
        <GraphPanel
          data={plotResult.traces}
          is3D={plotResult.is3D}
          height={500}
          xRange={plotResult.is3D ? undefined : [xMin, xMax]}
          yRange={plotResult.is3D ? undefined : [yMin, yMax]}
          exportFilename="nexus-graph"
          onPointClick={(x, y) => setTrackedPoint({ x, y })}
        />

        {trackedPoint && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] px-4 py-2.5 text-xs font-mono text-slate-700 dark:text-slate-300">
            Selected Coordinate: ({trackedPoint.x.toFixed(5)}, {trackedPoint.y.toFixed(5)})
          </div>
        )}

        {showFeatures && plotResult.features.length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Detected Key Points
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 text-left font-medium">Type</th>
                    <th className="py-2 text-right font-medium">x</th>
                    <th className="py-2 text-right font-medium">y</th>
                    <th className="py-2 text-left pl-4 font-medium">Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                  {plotResult.features.map((feat, idx) => (
                    <tr key={idx}>
                      <td className="py-2 capitalize text-slate-700 dark:text-slate-200">
                        {feat.kind}
                      </td>
                      <td className="py-2 text-right tabular-nums text-cyan-700 dark:text-cyan-300">
                        {feat.x.toFixed(5)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-slate-800 dark:text-slate-100">
                        {feat.y.toFixed(5)}
                      </td>
                      <td className="py-2 pl-4 text-slate-500 dark:text-slate-400">{feat.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
