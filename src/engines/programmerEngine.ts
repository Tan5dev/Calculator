import type { BitWidth, NumberBase } from '../types/calculator';

export function getBitMask(width: BitWidth): bigint {
  return (1n << BigInt(width)) - 1n;
}

export function maskToWidth(value: bigint, width: BitWidth): bigint {
  return value & getBitMask(width);
}

export function toSignedBigInt(unsignedValue: bigint, width: BitWidth): bigint {
  const masked = maskToWidth(unsignedValue, width);
  const signBit = 1n << BigInt(width - 1);
  if ((masked & signBit) !== 0n) {
    return masked - (1n << BigInt(width));
  }
  return masked;
}

export function parseIntegerInput(
  input: string,
  base: NumberBase,
  width: BitWidth
): { ok: boolean; unsigned?: bigint; signed?: bigint; error?: string } {
  const raw = input.trim().replace(/[\s_]/g, '');
  if (!raw) return { ok: true, unsigned: 0n, signed: 0n };

  const negative = raw.startsWith('-');
  const body = negative ? raw.slice(1) : raw;
  if (!body) return { ok: false, error: 'Incomplete number.' };

  const patterns: Record<NumberBase, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9a-fA-F]+$/,
  };

  if (!patterns[base].test(body)) {
    return { ok: false, error: `Invalid digit for base ${base}.` };
  }

  const prefix = base === 2 ? '0b' : base === 8 ? '0o' : base === 16 ? '0x' : '';
  let val = BigInt(`${prefix}${body}`);
  if (negative) val = -val;

  const unsigned = maskToWidth(val, width);
  const signed = toSignedBigInt(unsigned, width);
  return { ok: true, unsigned, signed };
}

export function formatBases(unsignedValue: bigint, width: BitWidth) {
  const masked = maskToWidth(unsignedValue, width);
  const signed = toSignedBigInt(masked, width);

  const binRaw = masked.toString(2).padStart(width, '0');
  const binGrouped = binRaw.replace(/(.{4})(?=.)/g, '$1 ');

  return {
    bin: binRaw,
    binGrouped,
    oct: masked.toString(8),
    decSigned: signed.toString(10),
    decUnsigned: masked.toString(10),
    hex: masked.toString(16).toUpperCase(),
  };
}

export type BitwiseOp =
  | 'AND'
  | 'OR'
  | 'XOR'
  | 'NAND'
  | 'NOR'
  | 'XNOR'
  | 'SHL'
  | 'SHR_ARITH'
  | 'SHR_LOGIC'
  | 'ROL'
  | 'ROR'
  | 'ADD'
  | 'SUB'
  | 'MUL'
  | 'DIV'
  | 'MOD';

export function computeBitwiseBinary(
  aUnsigned: bigint,
  bUnsigned: bigint,
  op: BitwiseOp,
  width: BitWidth
): { ok: boolean; result?: bigint; error?: string } {
  const mask = getBitMask(width);
  const a = maskToWidth(aUnsigned, width);
  const b = maskToWidth(bUnsigned, width);
  const w = BigInt(width);
  const shiftAmount = b % w;

  switch (op) {
    case 'AND':
      return { ok: true, result: maskToWidth(a & b, width) };
    case 'OR':
      return { ok: true, result: maskToWidth(a | b, width) };
    case 'XOR':
      return { ok: true, result: maskToWidth(a ^ b, width) };
    case 'NAND':
      return { ok: true, result: maskToWidth(~(a & b), width) };
    case 'NOR':
      return { ok: true, result: maskToWidth(~(a | b), width) };
    case 'XNOR':
      return { ok: true, result: maskToWidth(~(a ^ b), width) };
    case 'SHL':
      return { ok: true, result: maskToWidth(a << shiftAmount, width) };
    case 'SHR_LOGIC':
      return { ok: true, result: maskToWidth(a >> shiftAmount, width) };
    case 'SHR_ARITH': {
      const signedA = toSignedBigInt(a, width);
      return { ok: true, result: maskToWidth(signedA >> shiftAmount, width) };
    }
    case 'ROL': {
      const s = shiftAmount;
      if (s === 0n) return { ok: true, result: a };
      return { ok: true, result: ((a << s) | (a >> (w - s))) & mask };
    }
    case 'ROR': {
      const s = shiftAmount;
      if (s === 0n) return { ok: true, result: a };
      return { ok: true, result: ((a >> s) | (a << (w - s))) & mask };
    }
    case 'ADD':
      return { ok: true, result: maskToWidth(toSignedBigInt(a, width) + toSignedBigInt(b, width), width) };
    case 'SUB':
      return { ok: true, result: maskToWidth(toSignedBigInt(a, width) - toSignedBigInt(b, width), width) };
    case 'MUL':
      return { ok: true, result: maskToWidth(toSignedBigInt(a, width) * toSignedBigInt(b, width), width) };
    case 'DIV': {
      const sb = toSignedBigInt(b, width);
      if (sb === 0n) return { ok: false, error: 'Division by zero.' };
      return { ok: true, result: maskToWidth(toSignedBigInt(a, width) / sb, width) };
    }
    case 'MOD': {
      const sb = toSignedBigInt(b, width);
      if (sb === 0n) return { ok: false, error: 'Modulo by zero.' };
      return { ok: true, result: maskToWidth(toSignedBigInt(a, width) % sb, width) };
    }
  }
}

export function bitwiseNot(aUnsigned: bigint, width: BitWidth): bigint {
  return maskToWidth(~aUnsigned, width);
}
