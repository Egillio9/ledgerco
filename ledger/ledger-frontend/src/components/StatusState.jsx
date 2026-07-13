/** @param {{ label?: string }} props */
export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="status-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

/** @param {{ message?: string, onRetry?: () => void }} props */
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="status-state status-error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

/** @param {{ message?: string, action?: import('react').ReactNode }} props */
export function EmptyState({ message = 'Nothing here yet.', action }) {
  return (
    <div className="status-state status-empty">
      <p>{message}</p>
      {action}
    </div>
  )
}
