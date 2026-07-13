import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllLoans, getLoanPayments } from '../api/loans'
import { useAsync } from '../hooks/useAsync'
import { LoadingState, ErrorState, EmptyState } from '../components/StatusState'
import LoanTable from '../components/LoanTable'

const PAGE_SIZE = 10

async function loadLoansWithPayments() {
  const loans = await getAllLoans()
  const withPayments = await Promise.all(
    loans.map(async (loan) => {
      const payments = await getLoanPayments(loan.bankName, loan.borrowerName)
      const amountPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
      const amountPending = Math.max(Number(loan.totalAmount) - amountPaid, 0)
      return { ...loan, amountPaid, amountPending }
    }),
  )
  return withPayments
}

export default function LoanList() {
  const { data: loans, loading, error, reload } = useAsync(loadLoansWithPayments, [])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('borrowerName')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!loans) return []
    const term = search.trim().toLowerCase()
    if (!term) return loans
    return loans.filter(
      (loan) =>
        loan.bankName.toLowerCase().includes(term) || loan.borrowerName.toLowerCase().includes(term),
    )
  }, [loans, search])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const result = typeof av === 'string' ? av.localeCompare(bv) : av - bv
      return sortDir === 'asc' ? result : -result
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(Math.ceil(sorted.length / PAGE_SIZE), 1)
  const currentPage = Math.min(page, totalPages)
  const pageRows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function handleSearchChange(event) {
    setSearch(event.target.value)
    setPage(1)
  }

  if (loading) return <LoadingState label="Loading loans..." />
  if (error) return <ErrorState message={error} onRetry={reload} />

  if (loans.length === 0) {
    return (
      <EmptyState
        message="No loans have been created yet."
        action={
          <Link to="/loans/new" className="btn btn-primary">
            Create Loan
          </Link>
        }
      />
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Loans</h2>
        <p className="page-subtitle">{loans.length} loan(s) on record.</p>
      </div>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search by bank or borrower..."
          value={search}
          onChange={handleSearchChange}
          aria-label="Search loans"
        />
        <Link to="/loans/new" className="btn btn-primary">
          Create Loan
        </Link>
      </div>

      {sorted.length === 0 ? (
        <EmptyState message={`No loans match "${search}".`} />
      ) : (
        <>
          <LoanTable rows={pageRows} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />

          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
