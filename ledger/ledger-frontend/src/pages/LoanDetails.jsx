import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBalance, getLoan } from '../api/loans'
import { useAsync } from '../hooks/useAsync'
import { LoadingState, ErrorState } from '../components/StatusState'
import { formatCurrency, formatNumber } from '../utils/format'

export default function LoanDetails() {
  const { bankName, borrowerName } = useParams()
  const {
    data: loan,
    loading,
    error,
    reload,
  } = useAsync(() => getLoan(bankName, borrowerName), [bankName, borrowerName])

  if (loading) return <LoadingState label="Loading loan..." />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return <LoanDetailsContent loan={loan} />
}

/** @param {{ loan: object }} props */
function LoanDetailsContent({ loan }) {
  const [emi, setEmi] = useState(loan.totalMonths)
  const [balance, setBalance] = useState(null)
  const [balanceError, setBalanceError] = useState(null)
  const [checking, setChecking] = useState(false)

  const path = `/loans/${encodeURIComponent(loan.bankName)}/${encodeURIComponent(loan.borrowerName)}`

  async function handleCheckBalance(event) {
    event.preventDefault()
    setChecking(true)
    setBalanceError(null)
    try {
      const result = await getBalance(loan.bankName, loan.borrowerName, Number(emi))
      setBalance(result)
    } catch (err) {
      setBalanceError(err.message)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>
          {loan.borrowerName} &middot; {loan.bankName}
        </h2>
        <p className="page-subtitle">Loan details and balance progress.</p>
      </div>

      <div className="split-grid">
        <div className="card">
          <h3>Loan terms</h3>
          <ul className="preview-list">
            <li>
              <span>Principal</span>
              <strong>{formatCurrency(loan.principal)}</strong>
            </li>
            <li>
              <span>Rate</span>
              <strong>{loan.rate}%</strong>
            </li>
            <li>
              <span>Term</span>
              <strong>{loan.years} year(s)</strong>
            </li>
            <li>
              <span>Total amount payable</span>
              <strong>{formatCurrency(loan.totalAmount)}</strong>
            </li>
            <li>
              <span>Monthly EMI</span>
              <strong>{formatCurrency(loan.emi)}</strong>
            </li>
            <li>
              <span>Total EMIs</span>
              <strong>{formatNumber(loan.totalMonths)}</strong>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3>Payment summary</h3>
          <form onSubmit={handleCheckBalance} className="inline-form">
            <div className="field">
              <label htmlFor="emi">Check balance after EMI</label>
              <input
                id="emi"
                type="number"
                min="0"
                max={loan.totalMonths}
                value={emi}
                onChange={(event) => setEmi(event.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={checking}>
              {checking ? 'Checking...' : 'Check balance'}
            </button>
          </form>

          {balanceError && (
            <div className="message message-error" role="alert">
              {balanceError}
            </div>
          )}

          {balance && !balanceError && (
            <ul className="preview-list">
              <li>
                <span>Amount paid so far</span>
                <strong>{formatCurrency(balance.amountPaid)}</strong>
              </li>
              <li>
                <span>EMIs left</span>
                <strong>{formatNumber(balance.emisLeft)}</strong>
              </li>
            </ul>
          )}
        </div>
      </div>

      <div className="actions">
        <Link to={`${path}/payments`} className="btn btn-primary">
          Add Payment
        </Link>
        <Link to={`${path}/payments`} className="btn btn-secondary">
          View Payment History
        </Link>
        <Link to="/loans" className="btn btn-secondary">
          Back to Loans
        </Link>
      </div>
    </div>
  )
}
