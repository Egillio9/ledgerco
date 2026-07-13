import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format'

const COLUMNS = [
  { key: 'bankName', label: 'Bank' },
  { key: 'borrowerName', label: 'Borrower' },
  { key: 'principal', label: 'Principal' },
  { key: 'totalAmount', label: 'Total payable' },
  { key: 'emi', label: 'EMI / Months' },
  { key: 'paid', label: 'Paid / Pending' },
]

/**
 * @param {{
 *   rows: Array<object>,
 *   sortKey: string,
 *   sortDir: 'asc'|'desc',
 *   onSort: (key: string) => void,
 * }} props
 */
export default function LoanTable({ rows, sortKey, sortDir, onSort }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column.key}>
                <button type="button" className="th-sort" onClick={() => onSort(column.key)}>
                  {column.label}
                  {sortKey === column.key && <span className="sort-indicator">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                </button>
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((loan) => {
            const path = `/loans/${encodeURIComponent(loan.bankName)}/${encodeURIComponent(loan.borrowerName)}`
            return (
              <tr key={`${loan.bankName}-${loan.borrowerName}`}>
                <td data-label="Bank">{loan.bankName}</td>
                <td data-label="Borrower">{loan.borrowerName}</td>
                <td data-label="Principal">{formatCurrency(loan.principal)}</td>
                <td data-label="Total payable">{formatCurrency(loan.totalAmount)}</td>
                <td data-label="EMI / Months">
                  {formatCurrency(loan.emi)} &times; {loan.totalMonths}
                </td>
                <td data-label="Paid / Pending">
                  {formatCurrency(loan.amountPaid)} / {formatCurrency(loan.amountPending)}
                </td>
                <td data-label="Actions" className="row-actions">
                  <Link to={path} className="btn btn-secondary btn-sm">
                    View
                  </Link>
                  <Link to={`${path}/payments`} className="btn btn-secondary btn-sm">
                    Add payment
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
