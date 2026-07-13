import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addPayment, getLoan, getLoanPayments } from '../api/loans'
import { useAsync } from '../hooks/useAsync'
import { LoadingState, ErrorState, EmptyState } from '../components/StatusState'
import PaymentTable from '../components/PaymentTable'
import { formatCurrency } from '../utils/format'

async function loadLoanAndPayments(bankName, borrowerName) {
  const [loan, payments] = await Promise.all([
    getLoan(bankName, borrowerName),
    getLoanPayments(bankName, borrowerName),
  ])
  return { loan, payments }
}

export default function PaymentHistory() {
  const { bankName, borrowerName } = useParams()
  const { data, loading, error, reload } = useAsync(
    () => loadLoanAndPayments(bankName, borrowerName),
    [bankName, borrowerName],
  )

  if (loading) return <LoadingState label="Loading payment history..." />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return <PaymentHistoryContent loan={data.loan} initialPayments={data.payments} onChanged={reload} />
}

/**
 * @param {{ loan: object, initialPayments: Array<object>, onChanged: () => void }} props
 */
function PaymentHistoryContent({ loan, initialPayments, onChanged }) {
  const [payments, setPayments] = useState(initialPayments)
  const [form, setForm] = useState({ amount: '', afterEmi: '' })
  const [formError, setFormError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const path = `/loans/${encodeURIComponent(loan.bankName)}/${encodeURIComponent(loan.borrowerName)}`
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function validate() {
    const amount = Number(form.amount)
    const afterEmi = Number(form.afterEmi)
    if (!(amount > 0)) return 'Amount must be greater than zero.'
    if (!Number.isInteger(afterEmi) || afterEmi < 1 || afterEmi > loan.totalMonths) {
      return `After EMI must be a whole number between 1 and ${loan.totalMonths}.`
    }
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      setSuccessMessage(null)
      return
    }

    setSubmitting(true)
    setFormError(null)
    setSuccessMessage(null)
    try {
      const response = await addPayment({
        bankName: loan.bankName,
        borrowerName: loan.borrowerName,
        amount: Number(form.amount),
        afterEmi: Number(form.afterEmi),
      })
      setPayments((prev) => [...prev, { amount: response.amount, afterEmi: response.afterEmi }])
      setSuccessMessage(response.message || 'Payment added successfully.')
      setForm({ amount: '', afterEmi: '' })
      onChanged()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Payment History</h2>
        <p className="page-subtitle">
          {loan.borrowerName} &middot; {loan.bankName}
        </p>
      </div>

      <div className="split-grid">
        <div className="card">
          <h3>Record a payment</h3>
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="1"
                value={form.amount}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="afterEmi">After EMI</label>
              <input
                id="afterEmi"
                name="afterEmi"
                type="number"
                min="1"
                max={loan.totalMonths}
                value={form.afterEmi}
                onChange={handleChange}
              />
            </div>

            {formError && (
              <div className="message message-error" role="alert">
                {formError}
              </div>
            )}
            {successMessage && <div className="message">{successMessage}</div>}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Payment'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Totals</h3>
          <ul className="preview-list">
            <li>
              <span>Total lump-sum paid</span>
              <strong>{formatCurrency(totalPaid)}</strong>
            </li>
            <li>
              <span>Payments recorded</span>
              <strong>{payments.length}</strong>
            </li>
          </ul>
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState message="No payments recorded for this loan yet." />
      ) : (
        <PaymentTable payments={[...payments].sort((a, b) => a.afterEmi - b.afterEmi)} />
      )}

      <div className="actions">
        <Link to={path} className="btn btn-secondary">
          Back to Loan Details
        </Link>
        <Link to="/loans" className="btn btn-secondary">
          Back to Loans
        </Link>
      </div>
    </div>
  )
}
