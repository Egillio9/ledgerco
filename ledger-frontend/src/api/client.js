import axios from 'axios'

// In dev, Vite proxies /api to the Spring Boot server (see vite.config.js).
// For a deployed frontend, set VITE_API_URL to the backend origin, e.g. https://ledgerco.onrender.com
const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const client = axios.create({
  baseURL: `${apiOrigin}/api`,
  headers: { 'Content-Type': 'application/json' },
})

/** @param {unknown} error */
export function extractErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return 'Something went wrong. Please try again.'
}

export default client
