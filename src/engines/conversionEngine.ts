export type UnitCategoryId =
  | 'length'
  | 'mass'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'time'
  | 'speed'
  | 'pressure'
  | 'energy'
  | 'power'
  | 'storage'
  | 'angle';

export interface UnitDefinition {
  id: string;
  label: string;
  symbol: string;
  // Factor relative to category base unit (ignored for temperature)
  factor: number;
}

export interface UnitCategory {
  id: UnitCategoryId;
  name: string;
  baseUnitId: string;
  units: UnitDefinition[];
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length',
    baseUnitId: 'm',
    units: [
      { id: 'nm', label: 'Nanometer', symbol: 'nm', factor: 1e-9 },
      { id: 'um', label: 'Micrometer', symbol: 'µm', factor: 1e-6 },
      { id: 'mm', label: 'Millimeter', symbol: 'mm', factor: 1e-3 },
      { id: 'cm', label: 'Centimeter', symbol: 'cm', factor: 1e-2 },
      { id: 'm', label: 'Meter', symbol: 'm', factor: 1 },
      { id: 'km', label: 'Kilometer', symbol: 'km', factor: 1000 },
      { id: 'in', label: 'Inch', symbol: 'in', factor: 0.0254 },
      { id: 'ft', label: 'Foot', symbol: 'ft', factor: 0.3048 },
      { id: 'yd', label: 'Yard', symbol: 'yd', factor: 0.9144 },
      { id: 'mi', label: 'Mile', symbol: 'mi', factor: 1609.344 },
      { id: 'nmi', label: 'Nautical Mile', symbol: 'nmi', factor: 1852 },
      { id: 'au', label: 'Astronomical Unit', symbol: 'AU', factor: 149597870700 },
    ],
  },
  {
    id: 'mass',
    name: 'Mass',
    baseUnitId: 'kg',
    units: [
      { id: 'ug', label: 'Microgram', symbol: 'µg', factor: 1e-9 },
      { id: 'mg', label: 'Milligram', symbol: 'mg', factor: 1e-6 },
      { id: 'g', label: 'Gram', symbol: 'g', factor: 1e-3 },
      { id: 'kg', label: 'Kilogram', symbol: 'kg', factor: 1 },
      { id: 't', label: 'Metric Tonne', symbol: 't', factor: 1000 },
      { id: 'oz', label: 'Ounce', symbol: 'oz', factor: 0.028349523125 },
      { id: 'lb', label: 'Pound', symbol: 'lb', factor: 0.45359237 },
      { id: 'st', label: 'Stone', symbol: 'st', factor: 6.35029318 },
      { id: 'ton_us', label: 'Short Ton (US)', symbol: 'ton', factor: 907.18474 },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    baseUnitId: 'C',
    units: [
      { id: 'C', label: 'Celsius', symbol: '°C', factor: 1 },
      { id: 'F', label: 'Fahrenheit', symbol: '°F', factor: 1 },
      { id: 'K', label: 'Kelvin', symbol: 'K', factor: 1 },
      { id: 'R', label: 'Rankine', symbol: '°R', factor: 1 },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    baseUnitId: 'm2',
    units: [
      { id: 'mm2', label: 'Square Millimeter', symbol: 'mm²', factor: 1e-6 },
      { id: 'cm2', label: 'Square Centimeter', symbol: 'cm²', factor: 1e-4 },
      { id: 'm2', label: 'Square Meter', symbol: 'm²', factor: 1 },
      { id: 'ha', label: 'Hectare', symbol: 'ha', factor: 10000 },
      { id: 'km2', label: 'Square Kilometer', symbol: 'km²', factor: 1e6 },
      { id: 'in2', label: 'Square Inch', symbol: 'in²', factor: 0.00064516 },
      { id: 'ft2', label: 'Square Foot', symbol: 'ft²', factor: 0.09290304 },
      { id: 'yd2', label: 'Square Yard', symbol: 'yd²', factor: 0.83612736 },
      { id: 'acre', label: 'Acre', symbol: 'acre', factor: 4046.8564224 },
      { id: 'mi2', label: 'Square Mile', symbol: 'mi²', factor: 2589988.110336 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    baseUnitId: 'L',
    units: [
      { id: 'mL', label: 'Milliliter', symbol: 'mL', factor: 1e-3 },
      { id: 'L', label: 'Liter', symbol: 'L', factor: 1 },
      { id: 'm3', label: 'Cubic Meter', symbol: 'm³', factor: 1000 },
      { id: 'cm3', label: 'Cubic Centimeter', symbol: 'cm³', factor: 1e-3 },
      { id: 'tsp', label: 'Teaspoon (US)', symbol: 'tsp', factor: 0.00492892159375 },
      { id: 'tbsp', label: 'Tablespoon (US)', symbol: 'tbsp', factor: 0.01478676478125 },
      { id: 'floz', label: 'Fluid Ounce (US)', symbol: 'fl oz', factor: 0.0295735295625 },
      { id: 'cup', label: 'Cup (US)', symbol: 'cup', factor: 0.2365882365 },
      { id: 'gal', label: 'Gallon (US)', symbol: 'gal', factor: 3.785411784 },
      { id: 'ft3', label: 'Cubic Foot', symbol: 'ft³', factor: 28.316846592 },
    ],
  },
  {
    id: 'time',
    name: 'Time',
    baseUnitId: 's',
    units: [
      { id: 'ns', label: 'Nanosecond', symbol: 'ns', factor: 1e-9 },
      { id: 'us', label: 'Microsecond', symbol: 'µs', factor: 1e-6 },
      { id: 'ms', label: 'Millisecond', symbol: 'ms', factor: 1e-3 },
      { id: 's', label: 'Second', symbol: 's', factor: 1 },
      { id: 'min', label: 'Minute', symbol: 'min', factor: 60 },
      { id: 'h', label: 'Hour', symbol: 'h', factor: 3600 },
      { id: 'd', label: 'Day', symbol: 'd', factor: 86400 },
      { id: 'wk', label: 'Week', symbol: 'wk', factor: 604800 },
      { id: 'yr', label: 'Year (Julian)', symbol: 'yr', factor: 31557600 },
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    baseUnitId: 'mps',
    units: [
      { id: 'mps', label: 'Meters per Second', symbol: 'm/s', factor: 1 },
      { id: 'kmh', label: 'Kilometers per Hour', symbol: 'km/h', factor: 1 / 3.6 },
      { id: 'mph', label: 'Miles per Hour', symbol: 'mph', factor: 0.44704 },
      { id: 'fps', label: 'Feet per Second', symbol: 'ft/s', factor: 0.3048 },
      { id: 'kn', label: 'Knot', symbol: 'kn', factor: 1852 / 3600 },
      { id: 'mach', label: 'Mach (ISA Sea Level)', symbol: 'Mach', factor: 340.29 },
      { id: 'c', label: 'Speed of Light', symbol: 'c', factor: 299792458 },
    ],
  },
  {
    id: 'pressure',
    name: 'Pressure',
    baseUnitId: 'Pa',
    units: [
      { id: 'Pa', label: 'Pascal', symbol: 'Pa', factor: 1 },
      { id: 'kPa', label: 'Kilopascal', symbol: 'kPa', factor: 1000 },
      { id: 'MPa', label: 'Megapascal', symbol: 'MPa', factor: 1e6 },
      { id: 'bar', label: 'Bar', symbol: 'bar', factor: 1e5 },
      { id: 'mbar', label: 'Millibar', symbol: 'mbar', factor: 100 },
      { id: 'atm', label: 'Standard Atmosphere', symbol: 'atm', factor: 101325 },
      { id: 'psi', label: 'Pound per Sq Inch', symbol: 'psi', factor: 6894.757293168 },
      { id: 'mmHg', label: 'Millimeter of Mercury', symbol: 'mmHg', factor: 133.322387415 },
      { id: 'torr', label: 'Torr', symbol: 'Torr', factor: 101325 / 760 },
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    baseUnitId: 'J',
    units: [
      { id: 'J', label: 'Joule', symbol: 'J', factor: 1 },
      { id: 'kJ', label: 'Kilojoule', symbol: 'kJ', factor: 1000 },
      { id: 'MJ', label: 'Megajoule', symbol: 'MJ', factor: 1e6 },
      { id: 'cal', label: 'Calorie (thermochemical)', symbol: 'cal', factor: 4.184 },
      { id: 'kcal', label: 'Kilocalorie', symbol: 'kcal', factor: 4184 },
      { id: 'Wh', label: 'Watt-hour', symbol: 'Wh', factor: 3600 },
      { id: 'kWh', label: 'Kilowatt-hour', symbol: 'kWh', factor: 3.6e6 },
      { id: 'eV', label: 'Electronvolt', symbol: 'eV', factor: 1.602176634e-19 },
      { id: 'BTU', label: 'British Thermal Unit', symbol: 'BTU', factor: 1055.05585262 },
    ],
  },
  {
    id: 'power',
    name: 'Power',
    baseUnitId: 'W',
    units: [
      { id: 'mW', label: 'Milliwatt', symbol: 'mW', factor: 1e-3 },
      { id: 'W', label: 'Watt', symbol: 'W', factor: 1 },
      { id: 'kW', label: 'Kilowatt', symbol: 'kW', factor: 1000 },
      { id: 'MW', label: 'Megawatt', symbol: 'MW', factor: 1e6 },
      { id: 'hp', label: 'Horsepower (mechanical)', symbol: 'hp', factor: 745.6998715822702 },
      { id: 'BTUh', label: 'BTU per Hour', symbol: 'BTU/h', factor: 1055.05585262 / 3600 },
    ],
  },
  {
    id: 'storage',
    name: 'Digital Storage',
    baseUnitId: 'B',
    units: [
      { id: 'b', label: 'Bit', symbol: 'b', factor: 0.125 },
      { id: 'B', label: 'Byte', symbol: 'B', factor: 1 },
      { id: 'KB', label: 'Kilobyte (10³)', symbol: 'KB', factor: 1e3 },
      { id: 'KiB', label: 'Kibibyte (2¹⁰)', symbol: 'KiB', factor: 1024 },
      { id: 'MB', label: 'Megabyte (10⁶)', symbol: 'MB', factor: 1e6 },
      { id: 'MiB', label: 'Mebibyte (2²⁰)', symbol: 'MiB', factor: 1024 ** 2 },
      { id: 'GB', label: 'Gigabyte (10⁹)', symbol: 'GB', factor: 1e9 },
      { id: 'GiB', label: 'Gibibyte (2³⁰)', symbol: 'GiB', factor: 1024 ** 3 },
      { id: 'TB', label: 'Terabyte (10¹²)', symbol: 'TB', factor: 1e12 },
      { id: 'TiB', label: 'Tebibyte (2⁴⁰)', symbol: 'TiB', factor: 1024 ** 4 },
      { id: 'PB', label: 'Petabyte (10¹⁵)', symbol: 'PB', factor: 1e15 },
    ],
  },
  {
    id: 'angle',
    name: 'Angles',
    baseUnitId: 'rad',
    units: [
      { id: 'deg', label: 'Degree', symbol: '°', factor: Math.PI / 180 },
      { id: 'rad', label: 'Radian', symbol: 'rad', factor: 1 },
      { id: 'grad', label: 'Gradian', symbol: 'grad', factor: Math.PI / 200 },
      { id: 'arcmin', label: 'Arcminute', symbol: "'", factor: Math.PI / 10800 },
      { id: 'arcsec', label: 'Arcsecond', symbol: '"', factor: Math.PI / 648000 },
      { id: 'rev', label: 'Revolution', symbol: 'rev', factor: 2 * Math.PI },
    ],
  },
];

function convertTemperature(value: number, fromId: string, toId: string): number {
  let celsius: number;
  switch (fromId) {
    case 'C':
      celsius = value;
      break;
    case 'F':
      celsius = ((value - 32) * 5) / 9;
      break;
    case 'K':
      celsius = value - 273.15;
      break;
    case 'R':
      celsius = ((value - 491.67) * 5) / 9;
      break;
    default:
      celsius = value;
  }

  switch (toId) {
    case 'C':
      return celsius;
    case 'F':
      return (celsius * 9) / 5 + 32;
    case 'K':
      return celsius + 273.15;
    case 'R':
      return ((celsius + 273.15) * 9) / 5;
    default:
      return celsius;
  }
}

export function convertUnit(
  value: number,
  categoryId: UnitCategoryId,
  fromUnitId: string,
  toUnitId: string
): { ok: boolean; result?: number; error?: string } {
  if (!Number.isFinite(value)) {
    return { ok: false, error: 'Enter a valid finite number.' };
  }
  const cat = UNIT_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return { ok: false, error: 'Unknown unit category.' };

  if (categoryId === 'temperature') {
    const out = convertTemperature(value, fromUnitId, toUnitId);
    return { ok: true, result: out };
  }

  const fromUnit = cat.units.find((u) => u.id === fromUnitId);
  const toUnit = cat.units.find((u) => u.id === toUnitId);
  if (!fromUnit || !toUnit) {
    return { ok: false, error: 'Invalid unit selection.' };
  }

  const baseValue = value * fromUnit.factor;
  return { ok: true, result: baseValue / toUnit.factor };
}
