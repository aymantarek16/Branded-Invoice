// Currency utilities

export const CURRENCIES = {
  EGP: { symbol: 'ج.م', name: 'جنيه مصري', code: 'EGP' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  SAR: { symbol: '﷼', name: 'Saudi Riyal', code: 'SAR' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', code: 'AED' },
}

export const CURRENCY_LIST = Object.values(CURRENCIES)

export function getCurrencyInfo(code) {
  return CURRENCIES[code] || CURRENCIES.EGP
}

function toSafeNumber(amount) {
  const number = Number.parseFloat(amount)
  return Number.isFinite(number) ? number : 0
}

export function formatCurrency(amount, currencyCode = 'EGP') {
  const currency = getCurrencyInfo(currencyCode)
  const formattedAmount = toSafeNumber(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  if (currencyCode === 'EGP') {
    return `${formattedAmount} ${currency.symbol}`
  }

  return `${currency.symbol}${formattedAmount}`
}

export function formatCurrencyShort(amount, currencyCode = 'EGP') {
  const currency = getCurrencyInfo(currencyCode)
  const value = toSafeNumber(amount)

  if (value >= 1000000) {
    return currencyCode === 'EGP'
      ? `${(value / 1000000).toFixed(1)}M ${currency.symbol}`
      : `${currency.symbol}${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return currencyCode === 'EGP'
      ? `${(value / 1000).toFixed(1)}K ${currency.symbol}`
      : `${currency.symbol}${(value / 1000).toFixed(1)}K`
  }

  return currencyCode === 'EGP'
    ? `${value.toFixed(2)} ${currency.symbol}`
    : `${currency.symbol}${value.toFixed(2)}`
}
