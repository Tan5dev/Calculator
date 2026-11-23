export type AngleMode = 'DEG' | 'RAD' | 'GRAD';
export type ThemeMode = 'dark' | 'light';

export type CalculatorModuleId =
  | 'standard'
  | 'scientific'
  | 'graphing'
  | 'equations'
  | 'matrix'
  | 'complex'
  | 'calculus'
  | 'statistics'
  | 'programmer'
  | 'converter'
  | 'tools'
  | 'constants'
  | 'history'
  | 'settings';

export interface HistoryEntry {
  id: string;
  module: string;
  expression: string;
  result: string;
  timestamp: number;
  metadata?: string;
}

export interface CalculatorSettings {
  theme: ThemeMode;
  angleMode: AngleMode;
  precision: number;
  scientificNotation: boolean;
  scientificThreshold: number;
  keyboardShortcuts: boolean;
  autoSaveHistory: boolean;
}

export interface EvalResult {
  ok: boolean;
  value: string;
  numericValue?: number;
  scientificValue?: string;
  fractionValue?: string;
  error?: string;
}

export type BitWidth = 8 | 16 | 32 | 64;
export type NumberBase = 2 | 8 | 10 | 16;

export type GraphPlotType =
  | 'cartesian'
  | 'polar'
  | 'parametric'
  | 'implicit'
  | 'surface3d'
  | 'parametric3d';

export interface GraphFunctionItem {
  id: string;
  label: string;
  expression: string;
  expressionY?: string;
  expressionZ?: string;
  color: string;
  visible: boolean;
  type: GraphPlotType;
}

export interface GraphPointFeature {
  kind: 'root' | 'y-intercept' | 'maximum' | 'minimum';
  x: number;
  y: number;
  label: string;
}

export interface PhysicalConstant {
  symbol: string;
  name: string;
  value: number;
  displayValue: string;
  unit: string;
  category: 'Mathematics' | 'Physics' | 'Chemistry' | 'Astrophysics';
  insertToken: string;
  description: string;
}
