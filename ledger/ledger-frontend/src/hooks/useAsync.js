import { useCallback, useEffect, useState } from 'react'

/**
 * Runs an async loader on mount (and whenever `deps` change), tracking
 * loading/error/data state. Returns a `reload` function to re-run it on demand.
 * @template T
 * @param {() => Promise<T>} loader
 * @param {import('react').DependencyList} deps
 */
export function useAsync(loader, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  const run = useCallback(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    loader()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error: error.message })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => run(), [run])

  return { ...state, reload: run }
}
