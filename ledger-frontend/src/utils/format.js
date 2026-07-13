const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('en-IN')

/** @param {number|null|undefined} value */
export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
  return currencyFormatter.format(value)
}

/** @param {number|null|undefined} value */
export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
  return numberFormatter.format(value)
}
