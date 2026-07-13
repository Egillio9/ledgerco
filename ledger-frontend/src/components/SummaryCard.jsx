/** @param {{ label: string, value: string, hint?: string }} props */
export default function SummaryCard({ label, value, hint }) {
  return (
    <div className="card summary-card">
      <h3>{label}</h3>
      <p className="summary-value">{value}</p>
      {hint && <p className="summary-hint">{hint}</p>}
    </div>
  )
}
