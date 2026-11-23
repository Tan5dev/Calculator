import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AngleMode, CalculatorSettings, HistoryEntry, ThemeMode } from '../types/calculator';
import { escapeCsvCell } from '../utils/formatters';

const SETTINGS_KEY = 'nexus_calculator_settings_v1';
const HISTORY_KEY = 'nexus_calculator_history_v1';
const MEMORY_KEY = 'nexus_calculator_memory_v1';
const ANS_KEY = 'nexus_calculator_ans_v1';

const DEFAULT_SETTINGS: CalculatorSettings = {
  theme: 'dark',
  angleMode: 'DEG',
  precision: 10,
  scientificNotation: false,
  scientificThreshold: 1e10,
  keyboardShortcuts: true,
  autoSaveHistory: true,
};

interface CalculatorContextValue {
  settings: CalculatorSettings;
  updateSettings: (patch: Partial<CalculatorSettings>) => void;
  toggleTheme: () => void;
  setAngleMode: (mode: AngleMode) => void;
  history: HistoryEntry[];
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  exportHistoryCsv: () => string;
  memory: number;
  memoryClear: () => void;
  memoryRecall: () => number;
  memoryStore: (val: number) => void;
  memoryAdd: (val: number) => void;
  memorySubtract: (val: number) => void;
  lastAnswer: number;
  setLastAnswer: (val: number) => void;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CalculatorSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...loadJson<Partial<CalculatorSettings>>(SETTINGS_KEY, {}),
  }));

  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    loadJson<HistoryEntry[]>(HISTORY_KEY, [])
  );

  const [memory, setMemory] = useState<number>(() =>
    loadJson<number>(MEMORY_KEY, 0)
  );

  const [lastAnswer, setLastAnswerState] = useState<number>(() =>
    loadJson<number>(ANS_KEY, 0)
  );

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings]);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota errors
    }
  }, [history]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
    } catch {
      // Ignore storage quota errors
    }
  }, [memory]);

  const setLastAnswer = useCallback((val: number) => {
    if (!Number.isFinite(val)) return;
    setLastAnswerState(val);
    try {
      window.localStorage.setItem(ANS_KEY, JSON.stringify(val));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const updateSettings = useCallback((patch: Partial<CalculatorSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: (prev.theme === 'dark' ? 'light' : 'dark') as ThemeMode,
    }));
  }, []);

  const setAngleMode = useCallback((mode: AngleMode) => {
    setSettings((prev) => ({ ...prev, angleMode: mode }));
  }, []);

  const addHistory = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
      if (!settings.autoSaveHistory) return;
      const newEntry: HistoryEntry = {
        ...entry,
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newEntry, ...prev].slice(0, 500));
    },
    [settings.autoSaveHistory]
  );

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const exportHistoryCsv = useCallback(() => {
    const header = ['Timestamp', 'Module', 'Expression', 'Result', 'Details'].join(',');
    const rows = history.map((item) =>
      [
        escapeCsvCell(new Date(item.timestamp).toISOString()),
        escapeCsvCell(item.module),
        escapeCsvCell(item.expression),
        escapeCsvCell(item.result),
        escapeCsvCell(item.metadata ?? ''),
      ].join(',')
    );
    return [header, ...rows].join('\n');
  }, [history]);

  const memoryClear = useCallback(() => setMemory(0), []);
  const memoryRecall = useCallback(() => memory, [memory]);
  const memoryStore = useCallback((val: number) => {
    if (Number.isFinite(val)) setMemory(val);
  }, []);
  const memoryAdd = useCallback((val: number) => {
    if (Number.isFinite(val)) setMemory((prev) => prev + val);
  }, []);
  const memorySubtract = useCallback((val: number) => {
    if (Number.isFinite(val)) setMemory((prev) => prev - val);
  }, []);

  return (
    <CalculatorContext.Provider
      value={{
        settings,
        updateSettings,
        toggleTheme,
        setAngleMode,
        history,
        addHistory,
        deleteHistoryItem,
        clearHistory,
        exportHistoryCsv,
        memory,
        memoryClear,
        memoryRecall,
        memoryStore,
        memoryAdd,
        memorySubtract,
        lastAnswer,
        setLastAnswer,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) {
    throw new Error('useCalculator must be used inside CalculatorProvider');
  }
  return ctx;
}
