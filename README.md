# Nexus Calculator

**Advanced Scientific & Engineering Computing Platform**

Nexus Calculator is an offline-capable scientific, engineering, and symbolic mathematics computing suite built with React, TypeScript, Vite, Tailwind CSS, Math.js, Nerdamer, and Plotly.js. All calculations execute locally in the browser with no external API keys required.

## Modules Implemented

- **Standard Calculator** — Arithmetic, percentage, modulo, parentheses, squares/cubes, square/cube roots, factorial, reciprocal, memory registers (`MC`, `MR`, `M+`, `M-`, `MS`), `Ans` recall, and keyboard shortcuts.
- **Scientific Calculator** — Trigonometric, inverse trigonometric, hyperbolic, logarithms (`ln`, `log10`, arbitrary base `log(x, b)`), exponentials, `DEG`/`RAD`/`GRAD` modes, `nPr`/`nCr`, `gcd`/`lcm`, scientific notation, and physical constants insertion.
- **Graphing 2D / 3D** — Multi-function Cartesian, Polar, Parametric, Implicit (`F(x, y) = 0`), 3D Surface (`z = f(x, y)`), and 3D Parametric curve plotting with Plotly.js, root/intercept/extrema detection, coordinate tracking, domain/range controls, and PNG export.
- **Equation Solver** — Linear, quadratic, cubic, general polynomial/symbolic equations, 2-variable and 3-variable simultaneous systems, general equation systems, and numerical root finders (Newton-Raphson, Bisection, Secant) with iteration tables and root residuals.
- **Matrix Algebra** — Addition, subtraction, multiplication, scalar multiplication, transpose, determinant, inverse, rank, trace, adjoint/cofactor, symmetric projection, Gaussian REF, Gauss-Jordan RREF, `PA = LU` decomposition, eigenvalues/eigenvectors, and `AX = B` solving.
- **Complex Numbers** — Binary operations, modulus, argument, conjugate, reciprocal, powers, `n`-th roots, rectangular/polar/trigonometric/Euler forms, complex exponential/log/trig/hyperbolic functions, and interactive Argand plane plotting.
- **Calculus** — Symbolic & higher-order derivatives, partial derivatives & gradient, indefinite integration, definite & numerical integration (Trapezoidal, Simpson's 1/3, Simpson's 3/8), symbolic/one-sided limits, Taylor & Maclaurin series, and critical point classification.
- **Statistics** — Mean, median, mode, sample/population variance and standard deviation, quartiles, IQR, arbitrary percentiles, weighted mean, frequency distribution table, linear regression, and interactive Histogram, Bar, Pie, Box, and Scatter plots.
- **Programmer Calculator** — 8, 16, 32, and 64-bit signed/unsigned conversions across `BIN`, `OCT`, `DEC`, `HEX`, bitwise logic (`AND`, `OR`, `XOR`, `NOT`, `NAND`, `NOR`, `XNOR`), bit shifts/rotates, and clickable bitfield toggles.
- **Unit Converter** — Length, mass, temperature, area, volume, time, speed, pressure, energy, power, digital storage (SI & IEC), and angles.
- **Mathematical Tools** — Prime check, prime factorization, HCF/GCD & LCM, Fibonacci sequence, arithmetic & geometric progressions, number properties, summation/product series, and random number generation.
- **Constants, History & Settings** — Searchable physical constants table, persistent LocalStorage calculation history with search/delete/CSV export, dark/light themes, precision, and angle settings.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## TypeScript & Production Build

```bash
npm run lint
npm run build
npm run preview
```

## Deploying to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the project in the Vercel dashboard.
3. Configure build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add a `vercel.json` rewrite rule if needed for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
