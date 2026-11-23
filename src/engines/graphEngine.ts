import { compile } from 'mathjs';
import type { AngleMode, GraphFunctionItem, GraphPointFeature } from '../types/calculator';

function buildTrigScope(angleMode: AngleMode) {
  const factor = angleMode === 'DEG' ? Math.PI / 180 : angleMode === 'GRAD' ? Math.PI / 200 : 1;
  return {
    pi: Math.PI,
    e: Math.E,
    tau: 2 * Math.PI,
    phi: (1 + Math.sqrt(5)) / 2,
    sin: (x: number) => Math.sin(x * factor),
    cos: (x: number) => Math.cos(x * factor),
    tan: (x: number) => Math.tan(x * factor),
    sec: (x: number) => 1 / Math.cos(x * factor),
    csc: (x: number) => 1 / Math.sin(x * factor),
    cot: (x: number) => 1 / Math.tan(x * factor),
    asin: (x: number) => Math.asin(x) / factor,
    acos: (x: number) => Math.acos(x) / factor,
    atan: (x: number) => Math.atan(x) / factor,
    ln: (x: number) => Math.log(x),
    log10: (x: number) => Math.log10(x),
    log2: (x: number) => Math.log2(x),
    log: (x: number, b?: number) => (b === undefined ? Math.log10(x) : Math.log(x) / Math.log(b)),
  };
}

export function cleanGraphExpression(raw: string): string {
  let s = raw.trim();
  if (s.includes('=') && !s.startsWith('y=') && !s.startsWith('r=') && !s.startsWith('z=')) {
    const parts = s.split('=');
    if (parts.length === 2) {
      s = `(${parts[0]}) - (${parts[1]})`;
    }
  }
  s = s.replace(/^[yrz]\s*=\s*/i, '');
  s = s
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi');
  return s;
}

export function compileMathFn(expr: string, angleMode: AngleMode) {
  const cleaned = cleanGraphExpression(expr);
  const compiled = compile(cleaned);
  const baseScope = buildTrigScope(angleMode);
  return (vars: Record<string, number>): number => {
    const val = compiled.evaluate({ ...baseScope, ...vars });
    if (typeof val === 'number' && Number.isFinite(val)) {
      return val;
    }
    return NaN;
  };
}

export interface PlotTraceResult {
  traces: Record<string, unknown>[];
  features: GraphPointFeature[];
  errors: { id: string; message: string }[];
  is3D: boolean;
}

function refineRootBisect(
  fn: (vars: Record<string, number>) => number,
  a: number,
  b: number
): number {
  let lo = a;
  let hi = b;
  let flo = fn({ x: lo });
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const fmid = fn({ x: mid });
    if (!Number.isFinite(fmid)) break;
    if (Math.abs(fmid) < 1e-11) return mid;
    if (flo * fmid <= 0) {
      hi = mid;
    } else {
      lo = mid;
      flo = fmid;
    }
  }
  return (lo + hi) / 2;
}

export function analyzeCartesianFeatures(
  fn: (vars: Record<string, number>) => number,
  xMin: number,
  xMax: number,
  label: string
): GraphPointFeature[] {
  const features: GraphPointFeature[] = [];
  const samples = 400;
  const dx = (xMax - xMin) / samples;

  // y-intercept
  if (xMin <= 0 && xMax >= 0) {
    const y0 = fn({ x: 0 });
    if (Number.isFinite(y0)) {
      features.push({
        kind: 'y-intercept',
        x: 0,
        y: y0,
        label: `${label} y-int (0, ${Number(y0.toFixed(4))})`,
      });
    }
  }

  let prevX = xMin;
  let prevY = fn({ x: prevX });
  let prevSlope: number | null = null;

  for (let i = 1; i <= samples; i++) {
    const x = xMin + i * dx;
    const y = fn({ x });

    if (Number.isFinite(prevY) && Number.isFinite(y)) {
      // Root detection
      if (Math.abs(y) < 1e-7) {
        features.push({
          kind: 'root',
          x,
          y: 0,
          label: `${label} root (${Number(x.toFixed(4))}, 0)`,
        });
      } else if (prevY * y < 0 && Math.abs(y - prevY) < 50) {
        const rx = refineRootBisect(fn, prevX, x);
        if (Math.abs(fn({ x: rx })) < 1e-3) {
          features.push({
            kind: 'root',
            x: rx,
            y: 0,
            label: `${label} root (${Number(rx.toFixed(4))}, 0)`,
          });
        }
      }

      // Local extrema detection
      const slope = (y - prevY) / dx;
      if (prevSlope !== null && Math.abs(slope) < 1e4 && Math.abs(prevSlope) < 1e4) {
        if (prevSlope > 0 && slope <= 0) {
          const mx = prevX;
          const my = fn({ x: mx });
          if (Number.isFinite(my)) {
            features.push({
              kind: 'maximum',
              x: mx,
              y: my,
              label: `${label} max (${Number(mx.toFixed(3))}, ${Number(my.toFixed(3))})`,
            });
          }
        } else if (prevSlope < 0 && slope >= 0) {
          const mnX = prevX;
          const mnY = fn({ x: mnX });
          if (Number.isFinite(mnY)) {
            features.push({
              kind: 'minimum',
              x: mnX,
              y: mnY,
              label: `${label} min (${Number(mnX.toFixed(3))}, ${Number(mnY.toFixed(3))})`,
            });
          }
        }
      }
      prevSlope = slope;
    } else {
      prevSlope = null;
    }

    prevX = x;
    prevY = y;
  }

  return features.slice(0, 24);
}

export function buildPlotData(
  items: GraphFunctionItem[],
  config: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    tMin: number;
    tMax: number;
    angleMode: AngleMode;
    showFeatures: boolean;
  }
): PlotTraceResult {
  const traces: Record<string, unknown>[] = [];
  const features: GraphPointFeature[] = [];
  const errors: { id: string; message: string }[] = [];

  const visibleItems = items.filter((item) => item.visible && item.expression.trim().length > 0);
  const is3D = visibleItems.some((item) => item.type === 'surface3d' || item.type === 'parametric3d');

  for (const item of visibleItems) {
    try {
      if (item.type === 'cartesian') {
        const fn = compileMathFn(item.expression, config.angleMode);
        const n = 500;
        const xArr: number[] = [];
        const yArr: (number | null)[] = [];
        const step = (config.xMax - config.xMin) / n;
        const ySpan = Math.max(config.yMax - config.yMin, 1);

        let prevY: number | null = null;
        for (let i = 0; i <= n; i++) {
          const x = config.xMin + i * step;
          const y = fn({ x });
          xArr.push(x);
          if (!Number.isFinite(y) || Math.abs(y) > ySpan * 20) {
            yArr.push(null);
            prevY = null;
          } else if (prevY !== null && Math.abs(y - prevY) > ySpan * 3) {
            // Asymptote break
            yArr.push(null);
            prevY = y;
          } else {
            yArr.push(y);
            prevY = y;
          }
        }

        traces.push({
          type: 'scatter',
          mode: 'lines',
          name: `y = ${item.expression}`,
          x: xArr,
          y: yArr,
          line: { color: item.color, width: 2.5 },
          connectgaps: false,
        });

        if (config.showFeatures && !is3D) {
          features.push(...analyzeCartesianFeatures(fn, config.xMin, config.xMax, item.label));
        }
      } else if (item.type === 'polar') {
        const fn = compileMathFn(item.expression, config.angleMode);
        const n = 600;
        const xArr: (number | null)[] = [];
        const yArr: (number | null)[] = [];
        const tStep = (config.tMax - config.tMin) / n;
        for (let i = 0; i <= n; i++) {
          const theta = config.tMin + i * tStep;
          const r = fn({ theta, t: theta, x: theta });
          if (!Number.isFinite(r)) {
            xArr.push(null);
            yArr.push(null);
          } else {
            const rad =
              config.angleMode === 'DEG'
                ? (theta * Math.PI) / 180
                : config.angleMode === 'GRAD'
                  ? (theta * Math.PI) / 200
                  : theta;
            xArr.push(r * Math.cos(rad));
            yArr.push(r * Math.sin(rad));
          }
        }
        traces.push({
          type: 'scatter',
          mode: 'lines',
          name: `r = ${item.expression}`,
          x: xArr,
          y: yArr,
          line: { color: item.color, width: 2.5 },
        });
      } else if (item.type === 'parametric') {
        const fx = compileMathFn(item.expression, config.angleMode);
        const fy = compileMathFn(item.expressionY || 't', config.angleMode);
        const n = 500;
        const xArr: (number | null)[] = [];
        const yArr: (number | null)[] = [];
        const tStep = (config.tMax - config.tMin) / n;
        for (let i = 0; i <= n; i++) {
          const t = config.tMin + i * tStep;
          const x = fx({ t });
          const y = fy({ t });
          if (!Number.isFinite(x) || !Number.isFinite(y)) {
            xArr.push(null);
            yArr.push(null);
          } else {
            xArr.push(x);
            yArr.push(y);
          }
        }
        traces.push({
          type: 'scatter',
          mode: 'lines',
          name: `(${item.expression}, ${item.expressionY || 't'})`,
          x: xArr,
          y: yArr,
          line: { color: item.color, width: 2.5 },
        });
      } else if (item.type === 'implicit') {
        const fn = compileMathFn(item.expression, config.angleMode);
        const gridN = 90;
        const xs: number[] = [];
        const ys: number[] = [];
        const zs: (number | null)[][] = [];
        for (let i = 0; i <= gridN; i++) {
          xs.push(config.xMin + (i * (config.xMax - config.xMin)) / gridN);
          ys.push(config.yMin + (i * (config.yMax - config.yMin)) / gridN);
        }
        for (let j = 0; j <= gridN; j++) {
          const row: (number | null)[] = [];
          for (let i = 0; i <= gridN; i++) {
            const v = fn({ x: xs[i], y: ys[j] });
            row.push(Number.isFinite(v) ? v : null);
          }
          zs.push(row);
        }
        traces.push({
          type: 'contour',
          name: `${item.expression} = 0`,
          x: xs,
          y: ys,
          z: zs,
          contours: {
            coloring: 'none',
            start: 0,
            end: 0,
            size: 1,
          },
          line: { color: item.color, width: 2.5 },
          showscale: false,
        });
      } else if (item.type === 'surface3d') {
        const fn = compileMathFn(item.expression, config.angleMode);
        const gridN = 45;
        const xs: number[] = [];
        const ys: number[] = [];
        const zs: (number | null)[][] = [];
        for (let i = 0; i <= gridN; i++) {
          xs.push(config.xMin + (i * (config.xMax - config.xMin)) / gridN);
          ys.push(config.yMin + (i * (config.yMax - config.yMin)) / gridN);
        }
        for (let j = 0; j <= gridN; j++) {
          const row: (number | null)[] = [];
          for (let i = 0; i <= gridN; i++) {
            const v = fn({ x: xs[i], y: ys[j] });
            row.push(Number.isFinite(v) ? v : null);
          }
          zs.push(row);
        }
        traces.push({
          type: 'surface',
          name: `z = ${item.expression}`,
          x: xs,
          y: ys,
          z: zs,
          colorscale: 'Viridis',
          showscale: true,
        });
      } else if (item.type === 'parametric3d') {
        const fx = compileMathFn(item.expression, config.angleMode);
        const fy = compileMathFn(item.expressionY || 'sin(t)', config.angleMode);
        const fz = compileMathFn(item.expressionZ || 't', config.angleMode);
        const n = 400;
        const xArr: number[] = [];
        const yArr: number[] = [];
        const zArr: number[] = [];
        const tStep = (config.tMax - config.tMin) / n;
        for (let i = 0; i <= n; i++) {
          const t = config.tMin + i * tStep;
          const x = fx({ t });
          const y = fy({ t });
          const z = fz({ t });
          if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
            xArr.push(x);
            yArr.push(y);
            zArr.push(z);
          }
        }
        traces.push({
          type: 'scatter3d',
          mode: 'lines',
          name: `r(t) = (${item.expression}, ${item.expressionY || 'sin(t)'}, ${item.expressionZ || 't'})`,
          x: xArr,
          y: yArr,
          z: zArr,
          line: { color: item.color, width: 4 },
        });
      }
    } catch (err) {
      errors.push({
        id: item.id,
        message: err instanceof Error ? err.message : 'Invalid function expression',
      });
    }
  }

  if (!is3D && config.showFeatures && features.length > 0) {
    const roots = features.filter((f) => f.kind === 'root');
    const yInts = features.filter((f) => f.kind === 'y-intercept');
    const extrema = features.filter((f) => f.kind === 'maximum' || f.kind === 'minimum');

    if (roots.length > 0) {
      traces.push({
        type: 'scatter',
        mode: 'markers',
        name: 'Roots (x-intercepts)',
        x: roots.map((r) => r.x),
        y: roots.map((r) => r.y),
        text: roots.map((r) => r.label),
        marker: { color: '#10B981', size: 8, symbol: 'circle' },
      });
    }
    if (yInts.length > 0) {
      traces.push({
        type: 'scatter',
        mode: 'markers',
        name: 'y-Intercepts',
        x: yInts.map((r) => r.x),
        y: yInts.map((r) => r.y),
        text: yInts.map((r) => r.label),
        marker: { color: '#F59E0B', size: 8, symbol: 'diamond' },
      });
    }
    if (extrema.length > 0) {
      traces.push({
        type: 'scatter',
        mode: 'markers',
        name: 'Local Extrema',
        x: extrema.map((r) => r.x),
        y: extrema.map((r) => r.y),
        text: extrema.map((r) => r.label),
        marker: { color: '#F43F5E', size: 8, symbol: 'triangle-up' },
      });
    }
  }

  return { traces, features, errors, is3D };
}
