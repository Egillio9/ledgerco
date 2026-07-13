/**
 * Mirrors the backend's LoanService#createLoan calculation so the create-loan
 * form can preview EMI/total payable before submitting.
 * @param {{ principal: number|string, years: number|string, rate: number|string }} input
 * @returns {{ totalInterest: number, totalAmount: number, emi: number, totalMonths: number } | null}
 */
export function computeLoanPreview({ principal, years, rate }) {
  const p = Number(principal)
  const y = Number(years)
  const r = Number(rate)

  if (!(p > 0) || !(y > 0) || !(r > 0)) return null

  const totalInterest = (p * y * r) / 100
  const totalMonths = y * 12
  const totalAmount = p + totalInterest
  const emi = Math.ceil(totalAmount / totalMonths)

  return { totalInterest, totalAmount, emi, totalMonths }
}
