import { Download } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import { useEffect, useRef } from 'react';
import { useCalculator } from '../context/CalculatorContext';

interface GraphPanelProps {
  data: Record<string, unknown>[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  zLabel?: string;
  is3D?: boolean;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  exportFilename?: string;
  onPointClick?: (x: number, y: number) => void;
}

export function GraphPanel({
  data,
  title,
  xLabel = 'x',
  yLabel = 'y',
  zLabel = 'z',
  is3D = false,
  height = 460,
  xRange,
  yRange,
  exportFilename = 'nexus-graph',
  onPointClick,
}: GraphPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { settings } = useCalculator();
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const bg = isDark ? '#0D1322' : '#FFFFFF';
    const gridColor = isDark ? '#1E293B' : '#E2E8F0';
    const zeroColor = isDark ? '#475569' : '#94A3B8';
    const textColor = isDark ? '#CBD5E1' : '#334155';

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      height,
      paper_bgcolor: bg,
      plot_bgcolor: bg,
      font: {
        family: 'Plus Jakarta Sans, sans-serif',
        color: textColor,
        size: 12,
      },
      title: title ? { text: title, font: { size: 14, color: textColor } } : undefined,
      margin: is3D
        ? { l: 10, r: 10, t: title ? 40 : 16, b: 10 }
        : { l: 52, r: 20, t: title ? 42 : 20, b: 48 },
      showlegend: true,
      legend: {
        orientation: 'h',
        y: -0.15,
        font: { size: 11, color: textColor },
      },
      hovermode: is3D ? 'closest' : 'closest',
      ...(is3D
        ? {
            scene: {
              xaxis: { title: { text: xLabel }, gridcolor: gridColor, zerolinecolor: zeroColor },
              yaxis: { title: { text: yLabel }, gridcolor: gridColor, zerolinecolor: zeroColor },
              zaxis: { title: { text: zLabel }, gridcolor: gridColor, zerolinecolor: zeroColor },
              bgcolor: bg,
            },
          }
        : {
            xaxis: {
              title: { text: xLabel },
              gridcolor: gridColor,
              zerolinecolor: zeroColor,
              zerolinewidth: 1.5,
              range: xRange,
            },
            yaxis: {
              title: { text: yLabel },
              gridcolor: gridColor,
              zerolinecolor: zeroColor,
              zerolinewidth: 1.5,
              range: yRange,
            },
          }),
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displaylogo: false,
      scrollZoom: true,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    };

    void Plotly.react(el, data as Plotly.Data[], layout, config);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    const plotlyDiv = el as unknown as {
      on?: (event: string, cb: (ev: { points?: { x?: number; y?: number }[] }) => void) => void;
      removeAllListeners?: (event: string) => void;
    };

    if (onPointClick && plotlyDiv.on) {
      plotlyDiv.on('plotly_click', (ev) => {
        const pt = ev.points?.[0];
        if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') {
          onPointClick(pt.x, pt.y);
        }
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (plotlyDiv.removeAllListeners) {
        plotlyDiv.removeAllListeners('plotly_click');
      }
    };
  }, [data, title, xLabel, yLabel, zLabel, is3D, height, xRange, yRange, isDark, onPointClick]);

  useEffect(() => {
    const el = containerRef.current;
    return () => {
      if (el) Plotly.purge(el);
    };
  }, []);

  const handleExportPng = () => {
    if (!containerRef.current) return;
    void Plotly.downloadImage(containerRef.current, {
      format: 'png',
      filename: exportFilename,
      width: 1200,
      height: 800,
      scale: 2,
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {is3D ? 'Interactive 3D Viewport (Drag to orbit, scroll to zoom)' : 'Interactive 2D Plot (Drag to pan, scroll to zoom)'}
        </span>
        <button
          type="button"
          onClick={handleExportPng}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export PNG</span>
        </button>
      </div>
      <div ref={containerRef} className="w-full" style={{ minHeight: `${height}px` }} />
    </div>
  );
}
