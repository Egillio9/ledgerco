import { Link } from 'react-router-dom'
import { getAllLoans, getLoanPayments } from '../api/loans'
import { useAsync } from '../hooks/useAsync'
import { LoadingState, ErrorState, EmptyState } from '../components/StatusState'
import SummaryCard from '../components/SummaryCard'
import { formatCurrency, formatNumber } from '../utils/format'

async function loadDashboard() {
  const loans = await getAllLoans()
  const payments = await Promise.all(
    loans.map((loan) =>
      getLoanPayments(loan.bankName, loan.borrowerName).then((list) => ({ loan, payments: list })),
    ),
  )
  return { loans, payments }
}

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(loadDashboard, [])

  if (loading) return <LoadingState label="Loading dashboard..." />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const { loans, payments } = data

  if (loans.length === 0) {
    return (
      <EmptyState
        message="No loans yet. Create your first loan to see portfolio metrics here."
        action={
          <Link to="/loans/new" className="btn btn-primary">
            Create Loan
          </Link>
        }
      />
    )
  }

  const totalLoans = loans.length
  const totalBorrowers = new Set(loans.map((loan) => loan.borrowerName)).size
  const totalReceivable = loans.reduce((sum, loan) => sum + Number(loan.totalAmount), 0)

  const allPayments = payments.flatMap(({ loan, payments: list }) =>
    list.map((payment) => ({ ...payment, loan })),
  )
  const totalPaymentsReceived = allPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)
  const totalOutstanding = Math.max(totalReceivable - totalPaymentsReceived, 0)

  const recentLoans = loans.slice(-5).reverse()
  const recentPayments = allPayments.slice(-5).reverse()

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">An at-a-glance view of your loan portfolio.</p>
      </div>

      <div className="cards-grid">
        <SummaryCard label="Total loans" value={formatNumber(totalLoans)} />
        <SummaryCard label="Total borrowers" value={formatNumber(totalBorrowers)} />
        <SummaryCard label="Total outstanding" value={formatCurrency(totalOutstanding)} />
        <SummaryCard label="Total payments received" value={formatCurrency(totalPaymentsReceived)} />
      </div>

      <div className="card action-card">
        <h3>Quick actions</h3>
        <div className="actions">
          <Link to="/loans/new" className="btn btn-primary">
            Create Loan
          </Link>
          <Link to="/loans" className="btn btn-secondary">
            Record Payment
          </Link>
          <Link to="/loans" className="btn btn-secondary">
            Search Loan
          </Link>
        </div>
      </div>

      <div className="split-grid">
        <div className="card">
          <h3>Recently created loans</h3>
          {recentLoans.length === 0 ? (
            <p className="muted">No loans yet.</p>
          ) : (
            <ul className="activity-list">
              {recentLoans.map((loan) => (
                <li key={`${loan.bankName}-${loan.borrowerName}`}>
                  <Link to={`/loans/${encodeURIComponent(loan.bankName)}/${encodeURIComponent(loan.borrowerName)}`}>
                    {loan.borrowerName} &middot; {loan.bankName}
                  </Link>
                  <span className="muted">{formatCurrency(loan.totalAmount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>Recent payments</h3>
          {recentPayments.length === 0 ? (
            <p className="muted">No payments recorded yet.</p>
          ) : (
            <ul className="activity-list">
              {recentPayments.map((payment, index) => (
                <li key={`${payment.loan.bankName}-${payment.loan.borrowerName}-${payment.afterEmi}-${index}`}>
                  <Link
                    to={`/loans/${encodeURIComponent(payment.loan.bankName)}/${encodeURIComponent(payment.loan.borrowerName)}/payments`}
                  >
                    {payment.loan.borrowerName} &middot; after EMI {payment.afterEmi}
                  </Link>
                  <span className="muted">{formatCurrency(payment.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
