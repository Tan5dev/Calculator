import { compile } from 'mathjs';

export function isPrimeNumber(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function primeFactorization(n: number): {
  ok: boolean;
  factors?: { prime: number; power: number }[];
  canonical?: string;
  error?: string;
} {
  if (!Number.isInteger(n) || n < 2 || n > 1e13) {
    return { ok: false, error: 'Enter an integer between 2 and 10¹³.' };
  }
  let rem = n;
  const factors: { prime: number; power: number }[] = [];

  for (let p = 2; p * p <= rem; p += p === 2 ? 1 : 2) {
    if (rem % p === 0) {
      let count = 0;
      while (rem % p === 0) {
        rem /= p;
        count++;
      }
      factors.push({ prime: p, power: count });
    }
  }
  if (rem > 1) {
    factors.push({ prime: rem, power: 1 });
  }

  const canonical = factors
    .map((f) => (f.power === 1 ? `${f.prime}` : `${f.prime}^${f.power}`))
    .join(' × ');

  return { ok: true, factors, canonical };
}

export function gcdTwo(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function lcmTwo(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcdTwo(a, b)) * b);
}

export function gcdAndLcmList(nums: number[]): {
  ok: boolean;
  gcd?: number;
  lcm?: number;
  error?: string;
} {
  if (nums.length < 2) return { ok: false, error: 'Enter at least 2 integers.' };
  if (nums.some((n) => !Number.isInteger(n))) {
    return { ok: false, error: 'All inputs must be integers.' };
  }
  let g = Math.abs(nums[0]);
  let l = Math.abs(nums[0]);
  for (let i = 1; i < nums.length; i++) {
    g = gcdTwo(g, nums[i]);
    l = lcmTwo(l, nums[i]);
  }
  return { ok: true, gcd: g, lcm: l };
}

export function generateFibonacci(count: number): {
  ok: boolean;
  sequence?: string[];
  nthTerm?: string;
  sum?: string;
  ratioApprox?: number;
  error?: string;
} {
  if (!Number.isInteger(count) || count < 1 || count > 200) {
    return { ok: false, error: 'Term count must be an integer between 1 and 200.' };
  }
  const seq: bigint[] = [];
  for (let i = 0; i < count; i++) {
    if (i === 0) seq.push(0n);
    else if (i === 1) seq.push(1n);
    else seq.push(seq[i - 1] + seq[i - 2]);
  }
  const sum = seq.reduce((a, b) => a + b, 0n);
  const ratioApprox =
    seq.length >= 2 && seq[seq.length - 2] > 0n
      ? Number(seq[seq.length - 1]) / Number(seq[seq.length - 2])
      : undefined;

  return {
    ok: true,
    sequence: seq.map((v) => v.toString()),
    nthTerm: seq[seq.length - 1].toString(),
    sum: sum.toString(),
    ratioApprox,
  };
}

export function computeArithmeticProgression(a1: number, d: number, n: number) {
  if (!Number.isInteger(n) || n < 1 || n > 1000) {
    return { ok: false, error: 'Number of terms n must be an integer between 1 and 1000.' };
  }
  const an = a1 + (n - 1) * d;
  const sn = (n / 2) * (2 * a1 + (n - 1) * d);
  const previewCount = Math.min(n, 30);
  const terms = Array.from({ length: previewCount }, (_, i) => a1 + i * d);
  return { ok: true, an, sn, terms };
}

export function computeGeometricProgression(a1: number, r: number, n: number) {
  if (!Number.isInteger(n) || n < 1 || n > 1000) {
    return { ok: false, error: 'Number of terms n must be an integer between 1 and 1000.' };
  }
  const an = a1 * Math.pow(r, n - 1);
  const sn = Math.abs(r - 1) < 1e-12 ? a1 * n : (a1 * (1 - Math.pow(r, n))) / (1 - r);
  const sInf = Math.abs(r) < 1 ? a1 / (1 - r) : null;
  const previewCount = Math.min(n, 30);
  const terms = Array.from({ length: previewCount }, (_, i) => a1 * Math.pow(r, i));
  return { ok: true, an, sn, sInf, terms };
}

export function analyzeNumberProperties(n: number) {
  if (!Number.isInteger(n) || n < 0 || n > 1e8) {
    return { ok: false, error: 'Enter a non-negative integer up to 10⁸.' };
  }
  const isEven = n % 2 === 0;
  const isPrime = isPrimeNumber(n);

  const divisors: number[] = [];
  if (n > 0) {
    for (let i = 1; i * i <= n; i++) {
      if (n % i === 0) {
        divisors.push(i);
        if (i !== n / i) divisors.push(n / i);
      }
    }
    divisors.sort((a, b) => a - b);
  }
  const properDivisorSum = divisors.filter((d) => d !== n).reduce((a, b) => a + b, 0);
  const classification =
    n === 0
      ? 'Zero'
      : properDivisorSum === n
        ? 'Perfect'
        : properDivisorSum > n
          ? 'Abundant'
          : 'Deficient';

  const digits = String(n).split('').map(Number);
  const digitSum = digits.reduce((a, b) => a + b, 0);
  const armstrongSum = digits.reduce((acc, d) => acc + Math.pow(d, digits.length), 0);
  const isArmstrong = armstrongSum === n;
  const isPalindrome = String(n) === String(n).split('').reverse().join('');
  const sqrtInt = Math.round(Math.sqrt(n));
  const isPerfectSquare = sqrtInt * sqrtInt === n;
  const cbrtInt = Math.round(Math.cbrt(n));
  const isPerfectCube = cbrtInt * cbrtInt * cbrtInt === n;
  const triCheck = Math.round((-1 + Math.sqrt(1 + 8 * n)) / 2);
  const isTriangular = (triCheck * (triCheck + 1)) / 2 === n;

  return {
    ok: true,
    n,
    parity: isEven ? 'Even' : 'Odd',
    isPrime,
    classification,
    divisors,
    divisorCount: divisors.length,
    properDivisorSum,
    digitSum,
    isArmstrong,
    isPalindrome,
    isPerfectSquare,
    isPerfectCube,
    isTriangular,
  };
}

export function evaluateSeries(
  expr: string,
  variable: string,
  start: number,
  end: number,
  mode: 'sum' | 'product'
): { ok: boolean; value?: number; termsPreview?: string[]; error?: string } {
  if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) {
    return { ok: false, error: 'Bounds must be integers with start ≤ end.' };
  }
  if (end - start > 10000) {
    return { ok: false, error: 'Series span is capped at 10,000 iterations for responsiveness.' };
  }
  try {
    const fn = compile(expr);
    let acc = mode === 'sum' ? 0 : 1;
    const preview: string[] = [];
    for (let k = start; k <= end; k++) {
      const term = Number(fn.evaluate({ [variable]: k }));
      if (!Number.isFinite(term)) {
        return { ok: false, error: `Term undefined or non-finite at ${variable} = ${k}.` };
      }
      if (mode === 'sum') acc += term;
      else acc *= term;
      if (preview.length < 8) {
        preview.push(`${k} → ${Number(term.toFixed(6))}`);
      }
    }
    return { ok: true, value: acc, termsPreview: preview };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid series formula.' };
  }
}

export function generateRandomValues(options: {
  mode: 'integer' | 'float' | 'normal' | 'unique';
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  count: number;
}): { ok: boolean; values?: number[]; error?: string } {
  const count = Math.max(1, Math.min(500, Math.floor(options.count)));
  if (options.mode === 'integer' || options.mode === 'float' || options.mode === 'unique') {
    if (options.max < options.min) {
      return { ok: false, error: 'Max must be greater than or equal to Min.' };
    }
  }

  if (options.mode === 'integer') {
    const lo = Math.ceil(options.min);
    const hi = Math.floor(options.max);
    const values = Array.from({ length: count }, () => Math.floor(Math.random() * (hi - lo + 1)) + lo);
    return { ok: true, values };
  }

  if (options.mode === 'unique') {
    const lo = Math.ceil(options.min);
    const hi = Math.floor(options.max);
    const available = hi - lo + 1;
    if (available < count) {
      return { ok: false, error: `Cannot pick ${count} unique integers from range [${lo}, ${hi}] (${available} available).` };
    }
    const pool = Array.from({ length: available }, (_, i) => lo + i);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return { ok: true, values: pool.slice(0, count) };
  }

  if (options.mode === 'float') {
    const values = Array.from({ length: count }, () =>
      Number((options.min + Math.random() * (options.max - options.min)).toFixed(6))
    );
    return { ok: true, values };
  }

  // Normal distribution via Box-Muller transform
  if (options.stdDev <= 0) {
    return { ok: false, error: 'Standard deviation must be > 0.' };
  }
  const values: number[] = [];
  while (values.length < count) {
    const u1 = Math.max(1e-12, Math.random());
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    values.push(Number((options.mean + z0 * options.stdDev).toFixed(6)));
  }
  return { ok: true, values };
}
