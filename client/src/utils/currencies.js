/**
 * currencies.js - Global Currencies Database & Real-time Conversion Engine
 * Supports searching by country name, currency code, currency name, and symbol.
 */

// Exchange rates relative to INR (1 INR = X units of currency)
// Highly accurate reference rates; can be updated dynamically via live API
export const DEFAULT_RATES_FROM_INR = {
  INR: 1.0,
  AED: 0.0438, // 1 AED ≈ 22.83 INR (United Arab Emirates / Dubai)
  USD: 0.0118, // 1 USD ≈ 84.75 INR (United States)
  EUR: 0.0109, // 1 EUR ≈ 91.74 INR (Eurozone)
  GBP: 0.0093, // 1 GBP ≈ 107.53 INR (United Kingdom)
  SAR: 0.0443, // 1 SAR ≈ 22.57 INR (Saudi Arabia)
  QAR: 0.0430, // 1 QAR ≈ 23.25 INR (Qatar)
  KWD: 0.00363, // 1 KWD ≈ 275.48 INR (Kuwait)
  OMR: 0.00454, // 1 OMR ≈ 220.26 INR (Oman)
  BHD: 0.00445, // 1 BHD ≈ 224.72 INR (Bahrain)
  CAD: 0.0165, // 1 CAD ≈ 60.61 INR (Canada)
  AUD: 0.0181, // 1 AUD ≈ 55.25 INR (Australia)
  SGD: 0.0158, // 1 SGD ≈ 63.29 INR (Singapore)
  JPY: 1.8100, // 1 JPY ≈ 0.55 INR (Japan)
  CHF: 0.0105, // 1 CHF ≈ 95.24 INR (Switzerland)
  CNY: 0.0855, // 1 CNY ≈ 11.70 INR (China)
  NZD: 0.0198, // 1 NZD ≈ 50.51 INR (New Zealand)
  THB: 0.4050, // 1 THB ≈ 2.47 INR (Thailand)
  MYR: 0.0525, // 1 MYR ≈ 19.05 INR (Malaysia)
  IDR: 191.0,  // 1 INR ≈ 191 IDR (Indonesia)
  PHP: 0.6900, // 1 PHP ≈ 1.45 INR (Philippines)
  VND: 301.0,  // 1 INR ≈ 301 VND (Vietnam)
  KRW: 16.50,  // 1 KRW ≈ 0.061 INR (South Korea)
  TRY: 0.4080, // 1 TRY ≈ 2.45 INR (Turkey)
  BRL: 0.0685, // 1 BRL ≈ 14.60 INR (Brazil)
  MXN: 0.2400, // 1 MXN ≈ 4.17 INR (Mexico)
  ZAR: 0.2150, // 1 ZAR ≈ 4.65 INR (South Africa)
  RUB: 1.1500, // 1 RUB ≈ 0.87 INR (Russia)
  SEK: 0.1260, // 1 SEK ≈ 7.94 INR (Sweden)
  NOK: 0.1310, // 1 NOK ≈ 7.63 INR (Norway)
  DKK: 0.0815, // 1 DKK ≈ 12.27 INR (Denmark)
  PLN: 0.0475, // 1 PLN ≈ 21.05 INR (Poland)
  ILS: 0.0440, // 1 ILS ≈ 22.73 INR (Israel)
  EGP: 0.5850, // 1 EGP ≈ 1.71 INR (Egypt)
  PKR: 3.3000, // 1 PKR ≈ 0.30 INR (Pakistan)
  BDT: 1.4200, // 1 BDT ≈ 0.70 INR (Bangladesh)
  LKR: 3.4800, // 1 LKR ≈ 0.29 INR (Sri Lanka)
  NPR: 1.6000, // 1 NPR ≈ 0.625 INR (Nepal)
  HKD: 0.0918  // 1 HKD ≈ 10.89 INR (Hong Kong)
};

export const CURRENCIES_LIST = [
  {
    code: 'INR',
    name: 'Indian Rupee',
    country: 'India',
    symbol: '₹',
    flag: '🇮🇳',
    keywords: 'india rupee inr ₹ bharat hindustan'
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    country: 'United Arab Emirates, Dubai, Abu Dhabi, Sharjah',
    symbol: 'د.إ',
    flag: '🇦🇪',
    keywords: 'dubai uae united arab emirates dirham aed dxb dhm د.إ'
  },
  {
    code: 'USD',
    name: 'US Dollar',
    country: 'United States of America, USA',
    symbol: '$',
    flag: '🇺🇸',
    keywords: 'usa united states america us dollar usd $'
  },
  {
    code: 'EUR',
    name: 'Euro',
    country: 'European Union, Germany, France, Italy, Spain, Netherlands',
    symbol: '€',
    flag: '🇪🇺',
    keywords: 'europe european union euro eur germany france spain italy €'
  },
  {
    code: 'GBP',
    name: 'British Pound Sterling',
    country: 'United Kingdom, England, London, Great Britain, UK',
    symbol: '£',
    flag: '🇬🇧',
    keywords: 'uk united kingdom britain england london pound sterling gbp £'
  },
  {
    code: 'SAR',
    name: 'Saudi Riyal',
    country: 'Saudi Arabia, Riyadh, Jeddah, Mecca, Medina',
    symbol: '﷼',
    flag: '🇸🇦',
    keywords: 'saudi arabia riyal ksa sar riyadh jeddah ﷼'
  },
  {
    code: 'QAR',
    name: 'Qatari Riyal',
    country: 'Qatar, Doha',
    symbol: '﷼',
    flag: '🇶🇦',
    keywords: 'qatar doha riyal qar ﷼'
  },
  {
    code: 'KWD',
    name: 'Kuwaiti Dinar',
    country: 'Kuwait, Kuwait City',
    symbol: 'KD',
    flag: '🇰🇼',
    keywords: 'kuwait dinar kwd kd kuwait city'
  },
  {
    code: 'OMR',
    name: 'Omani Rial',
    country: 'Oman, Muscat',
    symbol: '﷼',
    flag: '🇴🇲',
    keywords: 'oman rial omr muscat ﷼'
  },
  {
    code: 'BHD',
    name: 'Bahraini Dinar',
    country: 'Bahrain, Manama',
    symbol: 'BD',
    flag: '🇧🇭',
    keywords: 'bahrain dinar bhd bd manama'
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    country: 'Canada, Toronto, Vancouver, Montreal',
    symbol: 'C$',
    flag: '🇨🇦',
    keywords: 'canada canadian dollar cad c$ toronto vancouver'
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    country: 'Australia, Sydney, Melbourne',
    symbol: 'A$',
    flag: '🇦🇺',
    keywords: 'australia australian dollar aud a$ sydney melbourne'
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    country: 'Singapore',
    symbol: 'S$',
    flag: '🇸🇬',
    keywords: 'singapore singapore dollar sgd s$'
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    country: 'Japan, Tokyo',
    symbol: '¥',
    flag: '🇯🇵',
    keywords: 'japan tokyo yen jpy ¥'
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    country: 'Switzerland, Zurich, Geneva',
    symbol: 'CHF',
    flag: '🇨🇭',
    keywords: 'switzerland swiss franc chf zurich geneva'
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan Renminbi',
    country: 'China, Beijing, Shanghai',
    symbol: '¥',
    flag: '🇨🇳',
    keywords: 'china chinese yuan cny rmb renminbi beijing shanghai ¥'
  },
  {
    code: 'NZD',
    name: 'New Zealand Dollar',
    country: 'New Zealand, Auckland',
    symbol: 'NZ$',
    flag: '🇳🇿',
    keywords: 'new zealand dollar nzd nz$ auckland'
  },
  {
    code: 'THB',
    name: 'Thai Baht',
    country: 'Thailand, Bangkok',
    symbol: '฿',
    flag: '🇹🇭',
    keywords: 'thailand bangkok baht thb ฿'
  },
  {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    country: 'Malaysia, Kuala Lumpur',
    symbol: 'RM',
    flag: '🇲🇾',
    keywords: 'malaysia ringgit myr rm kuala lumpur'
  },
  {
    code: 'IDR',
    name: 'Indonesian Rupiah',
    country: 'Indonesia, Jakarta, Bali',
    symbol: 'Rp',
    flag: '🇮🇩',
    keywords: 'indonesia rupiah idr rp jakarta bali'
  },
  {
    code: 'PHP',
    name: 'Philippine Peso',
    country: 'Philippines, Manila',
    symbol: '₱',
    flag: '🇵🇭',
    keywords: 'philippines peso php ₱ manila'
  },
  {
    code: 'VND',
    name: 'Vietnamese Dong',
    country: 'Vietnam, Hanoi, Ho Chi Minh',
    symbol: '₫',
    flag: '🇻🇳',
    keywords: 'vietnam dong vnd ₫ hanoi'
  },
  {
    code: 'KRW',
    name: 'South Korean Won',
    country: 'South Korea, Seoul',
    symbol: '₩',
    flag: '🇰🇷',
    keywords: 'korea south korea won krw ₩ seoul'
  },
  {
    code: 'TRY',
    name: 'Turkish Lira',
    country: 'Turkey, Istanbul, Ankara',
    symbol: '₺',
    flag: '🇹🇷',
    keywords: 'turkey turkish lira try ₺ istanbul'
  },
  {
    code: 'BRL',
    name: 'Brazilian Real',
    country: 'Brazil, Sao Paulo, Rio',
    symbol: 'R$',
    flag: '🇧🇷',
    keywords: 'brazil real brl r$ sao paulo rio'
  },
  {
    code: 'MXN',
    name: 'Mexican Peso',
    country: 'Mexico, Mexico City',
    symbol: 'Mex$',
    flag: '🇲🇽',
    keywords: 'mexico peso mxn mex$ mexico city'
  },
  {
    code: 'ZAR',
    name: 'South African Rand',
    country: 'South Africa, Johannesburg, Cape Town',
    symbol: 'R',
    flag: '🇿🇦',
    keywords: 'south africa rand zar r cape town'
  },
  {
    code: 'RUB',
    name: 'Russian Ruble',
    country: 'Russia, Moscow',
    symbol: '₽',
    flag: '🇷🇺',
    keywords: 'russia ruble rub ₽ moscow'
  },
  {
    code: 'SEK',
    name: 'Swedish Krona',
    country: 'Sweden, Stockholm',
    symbol: 'kr',
    flag: '🇸🇪',
    keywords: 'sweden krona sek kr stockholm'
  },
  {
    code: 'NOK',
    name: 'Norwegian Krone',
    country: 'Norway, Oslo',
    symbol: 'kr',
    flag: '🇳🇴',
    keywords: 'norway krone nok kr oslo'
  },
  {
    code: 'DKK',
    name: 'Danish Krone',
    country: 'Denmark, Copenhagen',
    symbol: 'kr',
    flag: '🇩🇰',
    keywords: 'denmark krone dkk kr copenhagen'
  },
  {
    code: 'PLN',
    name: 'Polish Zloty',
    country: 'Poland, Warsaw',
    symbol: 'zł',
    flag: '🇵🇱',
    keywords: 'poland zloty pln zł warsaw'
  },
  {
    code: 'ILS',
    name: 'Israeli Shekel',
    country: 'Israel, Tel Aviv, Jerusalem',
    symbol: '₪',
    flag: '🇮🇱',
    keywords: 'israel shekel ils ₪ tel aviv'
  },
  {
    code: 'EGP',
    name: 'Egyptian Pound',
    country: 'Egypt, Cairo',
    symbol: 'E£',
    flag: '🇪🇬',
    keywords: 'egypt pound egp e£ cairo'
  },
  {
    code: 'PKR',
    name: 'Pakistani Rupee',
    country: 'Pakistan, Islamabad, Karachi',
    symbol: '₨',
    flag: '🇵🇰',
    keywords: 'pakistan rupee pkr ₨ islamabad karachi'
  },
  {
    code: 'BDT',
    name: 'Bangladeshi Taka',
    country: 'Bangladesh, Dhaka',
    symbol: '৳',
    flag: '🇧🇩',
    keywords: 'bangladesh taka bdt ৳ dhaka'
  },
  {
    code: 'LKR',
    name: 'Sri Lankan Rupee',
    country: 'Sri Lanka, Colombo',
    symbol: 'Rs',
    flag: '🇱🇰',
    keywords: 'sri lanka rupee lkr rs colombo'
  },
  {
    code: 'NPR',
    name: 'Nepalese Rupee',
    country: 'Nepal, Kathmandu',
    symbol: 'Rs',
    flag: '🇳🇵',
    keywords: 'nepal rupee npr rs kathmandu'
  },
  {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    country: 'Hong Kong',
    symbol: 'HK$',
    flag: '🇭🇰',
    keywords: 'hong kong dollar hkd hk$'
  }
];

export const POPULAR_CURRENCY_CODES = ['INR', 'AED', 'USD', 'EUR', 'GBP', 'SAR', 'CAD', 'AUD', 'SGD'];

/**
 * Convert an amount from one currency to another using exchange rates table
 */
export function convertCurrency(amount, fromCode = 'INR', toCode = 'INR', customRates = {}) {
  const num = Number(amount);
  if (isNaN(num) || num === 0) return 0;

  const from = (fromCode || 'INR').trim().toUpperCase();
  const to = (toCode || 'INR').trim().toUpperCase();

  if (from === to) return num;

  const rates = { ...DEFAULT_RATES_FROM_INR, ...customRates };
  const fromRate = Number(rates[from]) || 1.0;
  const toRate = Number(rates[to]) || 1.0;

  if (fromRate <= 0 || toRate <= 0) return num;

  // Convert to Base (INR) first, then to target currency
  // Since rates are: 1 INR = X units of currency
  // amount in INR = amount / fromRate
  // amount in target = (amount / fromRate) * toRate
  const amountInINR = num / fromRate;
  const converted = amountInINR * toRate;
  if (!isFinite(converted) || isNaN(converted)) return num;
  return converted;
}

/**
 * Format an amount with currency symbol
 */
export function formatCurrencyAmount(amount, currencyCode = 'INR') {
  const num = Number(amount) || 0;
  const normalized = (currencyCode || 'INR').trim().toUpperCase();
  const currencyObj = CURRENCIES_LIST.find((c) => c.code === normalized) || {
    code: normalized,
    symbol: normalized
  };

  const formattedNum = num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${currencyObj.symbol} ${formattedNum}`;
}

/**
 * Get currency details by code
 */
export function getCurrencyInfo(code = 'INR') {
  const normalized = (code || 'INR').trim().toUpperCase();
  return (
    CURRENCIES_LIST.find((c) => c.code === normalized) || {
      code: normalized,
      name: normalized,
      country: '',
      symbol: normalized,
      flag: '🌐'
    }
  );
}

/**
 * Attempt to fetch latest exchange rates from Open Exchange API and cache in localStorage
 */
export async function fetchLiveExchangeRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR', { cache: 'no-cache' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.rates) {
      localStorage.setItem('cached_exchange_rates', JSON.stringify({
        rates: data.rates,
        updatedAt: Date.now()
      }));
      return data.rates;
    }
  } catch {
    // If offline or blocked, fallback gracefully to cached or default rates
  }
  return null;
}
