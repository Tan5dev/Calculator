import * as math from 'mathjs';
import type { Complex } from 'mathjs';
import { formatNumber } from '../utils/formatters';

export interface ComplexForms {
  rectangular: string;
  polarDeg: string;
  polarRad: string;
  euler: string;
  trigonometric: string;
  real: string;
  imag: string;
  modulus: string;
  argumentRad: string;
  argumentDeg: string;
}

export interface ComplexCalcOutput {
  ok: boolean;
  forms?: ComplexForms;
  roots?: ComplexForms[];
  error?: string;
}

function clean(v: number): number {
  return Math.abs(v) < 1e-12 ? 0 : v;
}

function fmt(v: number): string {
  return formatNumber(clean(v), { precision: 8 });
}

export function formatComplexForms(c: Complex): ComplexForms {
  const re = clean(c.re);
  const im = clean(c.im);
  const r = Math.hypot(re, im);
  const theta = clean(Math.atan2(im, re));
  const thetaDeg = clean((theta * 180) / Math.PI);

  const imSign = im >= 0 ? '+' : '-';
  const absIm = Math.abs(im);

  let rectangular = '';
  if (absIm === 0) {
    rectangular = fmt(re);
  } else if (re === 0) {
    rectangular = absIm === 1 ? `${im < 0 ? '-' : ''}i` : `${im < 0 ? '-' : ''}${fmt(absIm)}i`;
  } else {
    const imPart = absIm === 1 ? 'i' : `${fmt(absIm)}i`;
    rectangular = `${fmt(re)} ${imSign} ${imPart}`;
  }

  const rStr = fmt(r);
  const thetaRadStr = fmt(theta);
  const thetaDegStr = fmt(thetaDeg);

  return {
    rectangular,
    polarDeg: `${rStr} ∠ ${thetaDegStr}°`,
    polarRad: `${rStr} ∠ ${thetaRadStr} rad`,
    euler: `${rStr}·e^(${thetaRadStr}i)`,
    trigonometric: `${rStr}(cos(${thetaDegStr}°) + i·sin(${thetaDegStr}°))`,
    real: fmt(re),
    imag: fmt(im),
    modulus: rStr,
    argumentRad: thetaRadStr,
    argumentDeg: `${thetaDegStr}°`,
  };
}

export function parseComplexInput(input: string, realFallback = 0, imagFallback = 0): Complex {
  const trimmed = input.trim();
  if (!trimmed) return math.complex(realFallback, imagFallback);
  const normalized = trimmed.replace(/\s+/g, '').replace(/j/gi, 'i');
  return math.complex(normalized);
}

export function evaluateComplexBinary(
  z1Str: string,
  z2Str: string,
  op: 'add' | 'sub' | 'mul' | 'div' | 'pow'
): ComplexCalcOutput {
  try {
    const z1 = parseComplexInput(z1Str);
    const z2 = parseComplexInput(z2Str);

    if (op === 'div' && Math.hypot(z2.re, z2.im) < 1e-14) {
      return { ok: false, error: 'Division by zero complex number (0 + 0i) is undefined.' };
    }

    let result: Complex;
    if (op === 'add') result = math.add(z1, z2) as Complex;
    else if (op === 'sub') result = math.subtract(z1, z2) as Complex;
    else if (op === 'mul') result = math.multiply(z1, z2) as Complex;
    else if (op === 'div') result = math.divide(z1, z2) as Complex;
    else result = math.pow(z1, z2) as Complex;

    if (!Number.isFinite(result.re) || !Number.isFinite(result.im)) {
      return { ok: false, error: 'Complex operation resulted in non-finite overflow.' };
    }

    return { ok: true, forms: formatComplexForms(result) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid complex number.' };
  }
}

export function evaluateComplexUnary(
  zStr: string,
  op:
    | 'analyze'
    | 'conj'
    | 'inv'
    | 'sqrt'
    | 'exp'
    | 'log'
    | 'sin'
    | 'cos'
    | 'tan'
    | 'sinh'
    | 'cosh'
    | 'tanh',
  powerN = 2
): ComplexCalcOutput {
  try {
    const z = parseComplexInput(zStr);
    let res: Complex;
    switch (op) {
      case 'analyze':
        res = z;
        break;
      case 'conj':
        res = math.conj(z) as Complex;
        break;
      case 'inv':
        if (Math.hypot(z.re, z.im) < 1e-14) {
          return { ok: false, error: 'Reciprocal of 0 is undefined.' };
        }
        res = math.divide(1, z) as Complex;
        break;
      case 'sqrt':
        res = math.sqrt(z) as Complex;
        break;
      case 'exp':
        res = math.exp(z) as Complex;
        break;
      case 'log':
        if (Math.hypot(z.re, z.im) < 1e-14) {
          return { ok: false, error: 'Complex logarithm ln(0) is undefined.' };
        }
        res = math.log(z) as Complex;
        break;
      case 'sin':
        res = math.sin(z) as Complex;
        break;
      case 'cos':
        res = math.cos(z) as Complex;
        break;
      case 'tan':
        res = math.tan(z) as Complex;
        break;
      case 'sinh':
        res = math.sinh(z) as Complex;
        break;
      case 'cosh':
        res = math.cosh(z) as Complex;
        break;
      case 'tanh':
        res = math.tanh(z) as Complex;
        break;
    }

    if (typeof res === 'number') {
      res = math.complex(res, 0);
    }

    if (!Number.isFinite(res.re) || !Number.isFinite(res.im)) {
      return { ok: false, error: 'Operation resulted in non-finite value or pole.' };
    }

    const roots = op === 'analyze' && Number.isInteger(powerN) && powerN >= 2 && powerN <= 12
      ? computeComplexRoots(z, powerN)
      : undefined;

    return { ok: true, forms: formatComplexForms(res), roots };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid complex operation.' };
  }
}

export function computeComplexRoots(z: Complex, n: number): ComplexForms[] {
  const r = Math.hypot(z.re, z.im);
  const theta = Math.atan2(z.im, z.re);
  const rootR = Math.pow(r, 1 / n);
  const list: ComplexForms[] = [];
  for (let k = 0; k < n; k++) {
    const angle = (theta + 2 * Math.PI * k) / n;
    const c = math.complex(rootR * Math.cos(angle), rootR * Math.sin(angle));
    list.push(formatComplexForms(c));
  }
  return list;
}

export function computeComplexNthRoots(zStr: string, n: number): ComplexCalcOutput {
  try {
    if (!Number.isInteger(n) || n < 1 || n > 24) {
      return { ok: false, error: 'Root order n must be an integer between 1 and 24.' };
    }
    const z = parseComplexInput(zStr);
    const roots = computeComplexRoots(z, n);
    return {
      ok: true,
      forms: roots[0],
      roots,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid complex number.' };
  }
}
