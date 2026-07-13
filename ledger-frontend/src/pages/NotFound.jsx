import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page">
      <div className="status-state status-empty">
        <p>We couldn&apos;t find that page.</p>
        <Link to="/" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
