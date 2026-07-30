const SYMBOL_TO_ISO: Record<string, string> = {
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  '₹': 'INR',
  'MX$': 'MXN',
  '֏': 'AMD',
};

const ISO_TO_SYMBOL: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'INR': '₹',
  'MXN': 'MX$',
  'AMD': '֏',
};

interface RateCache {
  rates: Record<string, number>;
  timestamp: number;
}

let cache: RateCache | null = null;
const CACHE_TTL = 3600000;

export async function fetchRates(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.rates;
  }

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    if (data.result === 'success') {
      const rates = { ...data.rates, USD: 1 };
      cache = { rates, timestamp: Date.now() };
      return rates;
    }
    throw new Error('API error');
  } catch {
    if (cache) return cache.rates;
    return {};
  }
}

export function convertAmount(
  amount: number,
  fromSymbol: string,
  toSymbol: string,
  rates: Record<string, number>
): number {
  if (amount === 0 || fromSymbol === toSymbol) return amount;

  const fromCode = SYMBOL_TO_ISO[fromSymbol];
  const toCode = SYMBOL_TO_ISO[toSymbol];

  if (!fromCode || !toCode) return amount;
  if (fromCode === toCode) return amount;

  const fromRate = fromCode === 'USD' ? 1 : rates[fromCode];
  const toRate = toCode === 'USD' ? 1 : rates[toCode];

  if (fromRate == null || toRate == null) return amount;

  const inUSD = amount / fromRate;
  return inUSD * toRate;
}
