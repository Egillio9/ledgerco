import { formatCurrency } from '../utils/format'

/** @param {{ payments: Array<{ amount: number, afterEmi: number }> }} props */
export default function PaymentTable({ payments }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Amount</th>
            <th>After EMI</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={`${payment.afterEmi}-${index}`}>
              <td data-label="Amount">{formatCurrency(payment.amount)}</td>
              <td data-label="After EMI">{payment.afterEmi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
