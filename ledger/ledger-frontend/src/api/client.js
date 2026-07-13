import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
})

/** @param {unknown} error */
export function extractErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return 'Something went wrong. Please try again.'
}

export default client
