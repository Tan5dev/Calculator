import { useMemo, useState } from 'react';
import { ResultPanel } from '../components/ResultPanel';
import { useCalculator } from '../context/CalculatorContext';
import {
  bitwiseNot,
  computeBitwiseBinary,
  formatBases,
  maskToWidth,
  parseIntegerInput,
  type BitwiseOp,
} from '../engines/programmerEngine';
import type { BitWidth, NumberBase } from '../types/calculator';

export function ProgrammerCalculator() {
  const { addHistory } = useCalculator();
  const [bitWidth, setBitWidth] = useState<BitWidth>(32);
  const [inputBase, setInputBase] = useState<NumberBase>(10);
  const [operandAInput, setOperandAInput] = useState('10');
  const [operandBInput, setOperandBInput] = useState('6');
  const [activeOp, setActiveOp] = useState<BitwiseOp>('AND');
  const [overrideValue, setOverrideValue] = useState<bigint | null>(null);
  const [opError, setOpError] = useState<string | undefined>(undefined);

  const parsedA = useMemo(
    () => parseIntegerInput(operandAInput, inputBase, bitWidth),
    [operandAInput, inputBase, bitWidth]
  );

  const parsedB = useMemo(
    () => parseIntegerInput(operandBInput, inputBase, bitWidth),
    [operandBInput, inputBase, bitWidth]
  );

  const currentValue = useMemo(() => {
    if (overrideValue !== null) return maskToWidth(overrideValue, bitWidth);
    return parsedA.ok && parsedA.unsigned !== undefined ? parsedA.unsigned : 0n;
  }, [overrideValue, parsedA, bitWidth]);

  const baseFormats = useMemo(
    () => formatBases(currentValue, bitWidth),
    [currentValue, bitWidth]
  );

  const handleBinaryOp = (op: BitwiseOp) => {
    if (!parsedA.ok || parsedA.unsigned === undefined) {
      setOpError(parsedA.error ?? 'Invalid Operand A');
      return;
    }
    if (!parsedB.ok || parsedB.unsigned === undefined) {
      setOpError(parsedB.error ?? 'Invalid Operand B');
      return;
    }
    const res = computeBitwiseBinary(currentValue, parsedB.unsigned, op, bitWidth);
    if (!res.ok || res.result === undefined) {
      setOpError(res.error);
      return;
    }
    setOpError(undefined);
    setActiveOp(op);
    setOverrideValue(res.result);
    const outBases = formatBases(res.result, bitWidth);
    addHistory({
      module: `Programmer (${bitWidth}-bit)`,
      expression: `${currentValue.toString(10)} ${op} ${parsedB.unsigned.toString(10)}`,
      result: `DEC ${outBases.decSigned} · HEX 0x${outBases.hex}`,
    });
  };

  const handleNot = () => {
    const next = bitwiseNot(currentValue, bitWidth);
    setOpError(undefined);
    setOverrideValue(next);
    const outBases = formatBases(next, bitWidth);
    addHistory({
      module: `Programmer (${bitWidth}-bit)`,
      expression: `NOT ${baseFormats.hex}`,
      result: `DEC ${outBases.decSigned} · HEX 0x${outBases.hex}`,
    });
  };

  const toggleBit = (bitIndexFromMsb: number) => {
    const bitPos = BigInt(bitWidth - 1 - bitIndexFromMsb);
    const flipped = currentValue ^ (1n << bitPos);
    setOverrideValue(maskToWidth(flipped, bitWidth));
    setOpError(undefined);
  };

  const bitsArray = baseFormats.bin.split('');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Word Size:</span>
          {([8, 16, 32, 64] as BitWidth[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => {
                setBitWidth(w);
                setOpError(undefined);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                bitWidth === w
                  ? 'bg-cyan-600 text-white'
                  : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {w}-bit
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Input Base:</span>
          {(
            [
              [2, 'BIN'],
              [8, 'OCT'],
              [10, 'DEC'],
              [16, 'HEX'],
            ] as [NumberBase, string][]
          ).map(([b, label]) => (
            <button
              key={b}
              type="button"
              onClick={() => {
                setInputBase(b);
                setOverrideValue(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                inputBase === b
                  ? 'bg-cyan-600 text-white'
                  : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Operand A (Base {inputBase})
                </span>
                <input
                  type="text"
                  value={operandAInput}
                  onChange={(e) => {
                    setOperandAInput(e.target.value);
                    setOverrideValue(null);
                    setOpError(undefined);
                  }}
                  spellCheck={false}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-sm uppercase"
                />
                {!parsedA.ok && <p className="text-rose-500">{parsedA.error}</p>}
              </label>

              <label className="space-y-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Operand B / Shift Count (Base {inputBase})
                </span>
                <input
                  type="text"
                  value={operandBInput}
                  onChange={(e) => {
                    setOperandBInput(e.target.value);
                    setOpError(undefined);
                  }}
                  spellCheck={false}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] font-mono text-sm uppercase"
                />
                {!parsedB.ok && <p className="text-rose-500">{parsedB.error}</p>}
              </label>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Bitwise, Shift &amp; Arithmetic Operations
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(
                  [
                    ['AND', 'AND'],
                    ['OR', 'OR'],
                    ['XOR', 'XOR'],
                    ['NAND', 'NAND'],
                    ['NOR', 'NOR'],
                    ['XNOR', 'XNOR'],
                    ['SHL', 'A << B'],
                    ['SHR_ARITH', 'A >> B'],
                    ['SHR_LOGIC', 'A >>> B'],
                    ['ROL', 'ROL'],
                    ['ROR', 'ROR'],
                    ['ADD', 'A + B'],
                    ['SUB', 'A - B'],
                    ['MUL', 'A × B'],
                    ['DIV', 'A ÷ B'],
                    ['MOD', 'A mod B'],
                  ] as [BitwiseOp, string][]
                ).map(([op, label]) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => handleBinaryOp(op)}
                    className={`py-2 rounded-lg border font-mono text-xs font-medium cursor-pointer ${
                      activeOp === op
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleNot}
                  className="py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono text-xs font-medium cursor-pointer"
                >
                  NOT (~A)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOverrideValue(0n);
                    setOperandAInput('0');
                    setOpError(undefined);
                  }}
                  className="py-2 rounded-lg border border-rose-200 dark:border-rose-900/70 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-mono text-xs font-medium cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-6 space-y-4">
          <ResultPanel
            title={`Base Conversions (${bitWidth}-bit)`}
            primaryValue={`DEC ${baseFormats.decSigned}`}
            secondaryValue={`Unsigned: ${baseFormats.decUnsigned}`}
            error={opError}
          >
            <div className="space-y-2.5 text-xs font-mono">
              {[
                ['HEX (Base 16)', `0x${baseFormats.hex}`],
                ['DEC Signed (Two’s Comp)', baseFormats.decSigned],
                ['DEC Unsigned', baseFormats.decUnsigned],
                ['OCT (Base 8)', `0o${baseFormats.oct}`],
                ['BIN (Base 2)', baseFormats.binGrouped],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800"
                >
                  <span className="text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="font-semibold text-slate-900 dark:text-cyan-300 break-all">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </ResultPanel>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Interactive Bitfield ({bitWidth} bits — click any bit to toggle)
              </span>
              <span className="font-mono text-slate-400">MSB → LSB</span>
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
              {bitsArray.map((bit, idx) => {
                const bitPos = bitWidth - 1 - idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleBit(idx)}
                    title={`Bit ${bitPos}`}
                    className={`py-1.5 rounded border font-mono text-xs tabular-nums cursor-pointer transition-colors ${
                      bit === '1'
                        ? 'bg-cyan-600 border-cyan-500 text-white font-semibold'
                        : 'bg-slate-50 dark:bg-[#0B0F19] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-cyan-500/50'
                    }`}
                  >
                    {bit}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
