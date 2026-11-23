import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { HistoryPanel } from './components/HistoryPanel';
import { Sidebar } from './components/Sidebar';
import { CalculatorProvider } from './context/CalculatorContext';
import { Calculus } from './pages/Calculus';
import { ComplexCalculator } from './pages/ComplexCalculator';
import { Constants } from './pages/Constants';
import { EquationSolver } from './pages/EquationSolver';
import { GraphingCalculator } from './pages/GraphingCalculator';
import { History } from './pages/History';
import { MathematicalTools } from './pages/MathematicalTools';
import { MatrixCalculator } from './pages/MatrixCalculator';
import { ProgrammerCalculator } from './pages/ProgrammerCalculator';
import { ScientificCalculator } from './pages/ScientificCalculator';
import { Settings } from './pages/Settings';
import { StandardCalculator } from './pages/StandardCalculator';
import { Statistics } from './pages/Statistics';
import { UnitConverter } from './pages/UnitConverter';

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleHistoryDrawer={() => setHistoryDrawerOpen((v) => !v)}
          historyDrawerOpen={historyDrawerOpen}
        />

        <div className="flex-1 flex min-h-0 relative">
          <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<StandardCalculator />} />
                <Route path="/scientific" element={<ScientificCalculator />} />
                <Route path="/graphing" element={<GraphingCalculator />} />
                <Route path="/equations" element={<EquationSolver />} />
                <Route path="/matrix" element={<MatrixCalculator />} />
                <Route path="/complex" element={<ComplexCalculator />} />
                <Route path="/calculus" element={<Calculus />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/programmer" element={<ProgrammerCalculator />} />
                <Route path="/converter" element={<UnitConverter />} />
                <Route path="/tools" element={<MathematicalTools />} />
                <Route path="/constants" element={<Constants />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>

          {historyDrawerOpen && (
            <aside className="fixed inset-y-0 right-0 z-40 w-80 border-l border-slate-200 dark:border-slate-800 shadow-xl lg:static lg:shadow-none">
              <HistoryPanel onClose={() => setHistoryDrawerOpen(false)} compact />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CalculatorProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </CalculatorProvider>
  );
}
