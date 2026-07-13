import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLoan } from '../api/loans'
import { computeLoanPreview } from '../utils/loanMath'
import { formatCurrency, formatNumber } from '../utils/format'
import { BankIcon, UserIcon, CurrencyIcon, CalendarIcon, PercentIcon } from '../components/FieldIcons'

const initialForm = { bankName: '', borrowerName: '', principal: '', years: '', rate: '' }

function validate(form) {
  const errors = {}
  if (!form.bankName.trim()) errors.bankName = 'Bank name is required.'
  if (!form.borrowerName.trim()) errors.borrowerName = 'Borrower name is required.'
  if (!(Number(form.principal) > 0)) errors.principal = 'Principal must be greater than zero.'
  if (!Number.isInteger(Number(form.years)) || Number(form.years) <= 0)
    errors.years = 'Loan term must be a positive whole number of years.'
  if (!(Number(form.rate) > 0)) errors.rate = 'Rate must be greater than zero.'
  return errors
}

export default function CreateLoan() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const errors = validate(form)
  const preview = computeLoanPreview(form)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleBlur(event) {
    setTouched((prev) => ({ ...prev, [event.target.name]: true }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched({ bankName: true, borrowerName: true, principal: true, years: true, rate: true })
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const loan = await createLoan({
        bankName: form.bankName.trim(),
        borrowerName: form.borrowerName.trim(),
        principal: Number(form.principal),
        years: Number(form.years),
        rate: Number(form.rate),
      })
      navigate(`/loans/${encodeURIComponent(loan.bankName)}/${encodeURIComponent(loan.borrowerName)}`)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header fade-up">
        <h2>Create Loan</h2>
        <p className="page-subtitle">Set up a new loan for a borrower.</p>
      </div>

      <div className="split-grid">
        <form className="card fade-up" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="bankName">
              <BankIcon className="field-icon" />
              Bank name
            </label>
            <input
              id="bankName"
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.bankName && errors.bankName && <p className="field-error">{errors.bankName}</p>}
          </div>

          <div className="field">
            <label htmlFor="borrowerName">
              <UserIcon className="field-icon" />
              Borrower name
            </label>
            <input
              id="borrowerName"
              name="borrowerName"
              value={form.borrowerName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.borrowerName && errors.borrowerName && (
              <p className="field-error">{errors.borrowerName}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="principal">
              <CurrencyIcon className="field-icon" />
              Principal
            </label>
            <input
              id="principal"
              name="principal"
              type="number"
              min="1"
              value={form.principal}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.principal && errors.principal && <p className="field-error">{errors.principal}</p>}
          </div>

          <div className="field">
            <label htmlFor="years">
              <CalendarIcon className="field-icon" />
              Loan term (years)
            </label>
            <input
              id="years"
              name="years"
              type="number"
              min="1"
              step="1"
              value={form.years}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.years && errors.years && <p className="field-error">{errors.years}</p>}
          </div>

          <div className="field">
            <label htmlFor="rate">
              <PercentIcon className="field-icon" />
              Annual interest rate (%)
            </label>
            <input
              id="rate"
              name="rate"
              type="number"
              min="0.01"
              step="0.01"
              value={form.rate}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.rate && errors.rate && <p className="field-error">{errors.rate}</p>}
          </div>

          {submitError && (
            <div className="message message-error" role="alert">
              {submitError}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Loan'}
          </button>
        </form>

        <div className="card fade-up fade-delay-1">
          <h3>Preview</h3>
          {preview ? (
            <ul className="preview-list">
              <li>
                <span>Total interest</span>
                <strong>{formatCurrency(preview.totalInterest)}</strong>
              </li>
              <li>
                <span>Total amount payable</span>
                <strong>{formatCurrency(preview.totalAmount)}</strong>
              </li>
              <li>
                <span>Monthly EMI</span>
                <strong>{formatCurrency(preview.emi)}</strong>
              </li>
              <li>
                <span>Number of EMIs</span>
                <strong>{formatNumber(preview.totalMonths)}</strong>
              </li>
            </ul>
          ) : (
            <p className="muted">Fill in principal, years, and rate to see an estimate.</p>
          )}
        </div>
      </div>
    </div>
  )
}
