export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  supportsIndianFormat: boolean;
  defaultUnit: SalaryUnit;
  availableUnits: SalaryUnit[];
}

export type SalaryUnit =
  | 'thousands'
  | 'lakhs'
  | 'crores'
  | 'units'
  | 'millions'
  | 'billions';

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '',
    name: 'US Dollar',
    locale: 'en-US',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  EUR: {
    code: 'EUR',
    symbol: '',
    name: 'Euro',
    locale: 'de-DE',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  GBP: {
    code: 'GBP',
    symbol: '',
    name: 'British Pound',
    locale: 'en-GB',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  INR: {
    code: 'INR',
    symbol: '',
    name: 'Indian Rupee',
    locale: 'en-IN',
    supportsIndianFormat: true,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'lakhs', 'crores'],
  },
  CAD: {
    code: 'CAD',
    symbol: '',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  AUD: {
    code: 'AUD',
    symbol: '',
    name: 'Australian Dollar',
    locale: 'en-AU',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  JPY: {
    code: 'JPY',
    symbol: '',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  SGD: {
    code: 'SGD',
    symbol: '',
    name: 'Singapore Dollar',
    locale: 'en-SG',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  HKD: {
    code: 'HKD',
    symbol: '',
    name: 'Hong Kong Dollar',
    locale: 'en-HK',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  CHF: {
    code: 'CHF',
    symbol: '',
    name: 'Swiss Franc',
    locale: 'de-CH',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  CNY: {
    code: 'CNY',
    symbol: '',
    name: 'Chinese Yuan',
    locale: 'zh-CN',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  MXN: {
    code: 'MXN',
    symbol: '',
    name: 'Mexican Peso',
    locale: 'es-MX',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  NZD: {
    code: 'NZD',
    symbol: '',
    name: 'New Zealand Dollar',
    locale: 'en-NZ',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  RUB: {
    code: 'RUB',
    symbol: '',
    name: 'Russian Ruble',
    locale: 'ru-RU',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  SEK: {
    code: 'SEK',
    symbol: '',
    name: 'Swedish Krona',
    locale: 'sv-SE',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  NOK: {
    code: 'NOK',
    symbol: '',
    name: 'Norwegian Krone',
    locale: 'no-NO',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  TRY: {
    code: 'TRY',
    symbol: '',
    name: 'Turkish Lira',
    locale: 'tr-TR',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  ZAR: {
    code: 'ZAR',
    symbol: '',
    name: 'South African Rand',
    locale: 'en-ZA',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
  BRL: {
    code: 'BRL',
    symbol: '',
    name: 'Brazilian Real',
    locale: 'pt-BR',
    supportsIndianFormat: false,
    defaultUnit: 'thousands',
    availableUnits: ['thousands', 'millions', 'billions'],
  },
};

export const SALARY_UNITS: Record<
  SalaryUnit,
  { label: string; multiplier: number; shortLabel: string }
> = {
  units: { label: 'Units', multiplier: 1, shortLabel: '' },
  thousands: { label: 'Thousands', multiplier: 1000, shortLabel: 'K' },
  lakhs: { label: 'Lakhs', multiplier: 100000, shortLabel: 'L' },
  crores: { label: 'Crores', multiplier: 10000000, shortLabel: 'Cr' },
  millions: { label: 'Millions', multiplier: 1000000, shortLabel: 'M' },
  billions: { label: 'Billions', multiplier: 1000000000, shortLabel: 'B' },
};

export const getAvailableUnits = (currencyCode: string): SalaryUnit[] => {
  const config = CURRENCY_CONFIGS[currencyCode];
  if (!config) return ['thousands'];

  return config.availableUnits;
};

export const convertToBaseValue = (value: number, unit: SalaryUnit): number => {
  return value * SALARY_UNITS[unit].multiplier;
};

export const convertFromBaseValue = (
  baseValue: number,
  unit: SalaryUnit
): number => {
  return baseValue / SALARY_UNITS[unit].multiplier;
};

export const formatSalaryDisplay = (
  value: number,
  currencyCode: string,
  unit: SalaryUnit = 'thousands',
  showUnit: boolean = true
): string => {
  const config = CURRENCY_CONFIGS[currencyCode];
  if (!config) return `${value}`;

  const displayValue = convertFromBaseValue(value, unit);
  const unitInfo = SALARY_UNITS[unit];

  // Format the number with appropriate locale
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(displayValue);

  const unitLabel = showUnit ? ` ${unitInfo.shortLabel}` : '';

  return `${formattedNumber}${unitLabel}`;
};

export const formatSalaryRange = (
  minValue: number,
  maxValue: number,
  currencyCode: string,
  unit: SalaryUnit = 'thousands'
): string => {
  const config = CURRENCY_CONFIGS[currencyCode];
  if (!config) return `${minValue} - ${maxValue}`;

  const minDisplay = convertFromBaseValue(minValue, unit);
  const maxDisplay = convertFromBaseValue(maxValue, unit);
  const unitInfo = SALARY_UNITS[unit];

  const formattedMin = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(minDisplay);

  const formattedMax = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(maxDisplay);

  const unitLabel = ` ${unitInfo.shortLabel}`;

  return `${formattedMin} - ${formattedMax}${unitLabel}`;
};

export const parseSalaryInput = (
  inputValue: string,
  unit: SalaryUnit = 'thousands'
): number => {
  // Remove currency symbols and non-numeric characters except decimal point
  const cleanValue = inputValue.replace(/[^\d.]/g, '');
  const numericValue = parseFloat(cleanValue) || 0;

  return convertToBaseValue(numericValue, unit);
};

export const validateSalaryRange = (
  minValue: number,
  maxValue: number,
  currencyCode: string
): { isValid: boolean; error?: string } => {
  if (minValue <= 0) {
    return { isValid: false, error: 'Minimum salary must be greater than 0' };
  }

  if (maxValue <= 0) {
    return { isValid: false, error: 'Maximum salary must be greater than 0' };
  }

  if (minValue >= maxValue) {
    return {
      isValid: false,
      error: 'Maximum salary must be greater than minimum salary',
    };
  }

  const config = CURRENCY_CONFIGS[currencyCode];
  if (!config) {
    return { isValid: false, error: 'Invalid currency code' };
  }

  // Add reasonable limits based on currency
  const maxReasonableValue = currencyCode === 'INR' ? 100000000 : 1000000; // 10 Cr INR or 1M others

  if (maxValue > maxReasonableValue) {
    return {
      isValid: false,
      error: `Maximum salary seems unreasonably high for ${config.name}`,
    };
  }

  return { isValid: true };
};

export const getSalaryInputPlaceholder = (
  currencyCode: string,
  unit: SalaryUnit
): string => {
  const config = CURRENCY_CONFIGS[currencyCode];
  if (!config) return 'Enter amount';

  const unitInfo = SALARY_UNITS[unit];

  // Define example values based on unit type
  const getExampleValue = (unit: SalaryUnit): string => {
    switch (unit) {
      case 'thousands':
        return '50';
      case 'lakhs':
        return '5';
      case 'crores':
        return '1';
      case 'millions':
        return '0.5';
      case 'billions':
        return '0.1';
      default:
        return '50000';
    }
  };

  const exampleValue = getExampleValue(unit);
  return `e.g., ${exampleValue}${unitInfo.shortLabel ? ` ${unitInfo.shortLabel}` : ''}`;
};

export const getRecommendedUnit = (
  value: number,
  currencyCode: string
): SalaryUnit => {
  const config = CURRENCY_CONFIGS[currencyCode];
  if (!config) return 'thousands';

  // Check available units for this currency and recommend based on value
  const availableUnits = config.availableUnits;

  if (config.supportsIndianFormat) {
    // INR logic: lakhs and crores
    if (availableUnits.includes('crores') && value >= 10000000) return 'crores'; // 1 crore+
    if (availableUnits.includes('lakhs') && value >= 100000) return 'lakhs'; // 1 lakh+
    return 'thousands';
  } else {
    // International currencies: thousands, millions, billions
    if (availableUnits.includes('billions') && value >= 1000000000)
      return 'billions'; // 1 billion+
    if (availableUnits.includes('millions') && value >= 1000000)
      return 'millions'; // 1 million+
    return 'thousands';
  }
};

export const formatCompactSalary = (
  value: number,
  currencyCode: string
): string => {
  const config = CURRENCY_CONFIGS[currencyCode];
  if (!config) return `${value}`;

  const recommendedUnit = getRecommendedUnit(value, currencyCode);
  return formatSalaryDisplay(value, currencyCode, recommendedUnit, true);
};
