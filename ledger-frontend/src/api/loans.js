import client, { extractErrorMessage } from './client'

/**
 * @typedef {object} LoanRequest
 * @property {string} bankName
 * @property {string} borrowerName
 * @property {number} principal
 * @property {number} years
 * @property {number} rate
 */

/**
 * @typedef {object} LoanResponse
 * @property {string} bankName
 * @property {string} borrowerName
 * @property {number} principal
 * @property {number} years
 * @property {number} rate
 * @property {number} totalInterest
 * @property {number} totalAmount
 * @property {number} emi
 * @property {number} totalMonths
 */

/**
 * @typedef {object} PaymentInfo
 * @property {number} amount
 * @property {number} afterEmi
 */

/**
 * @typedef {object} PaymentRequest
 * @property {string} bankName
 * @property {string} borrowerName
 * @property {number} amount
 * @property {number} afterEmi
 */

/**
 * @typedef {object} BalanceResponse
 * @property {string} bankName
 * @property {string} borrowerName
 * @property {number} amountPaid
 * @property {number} emisLeft
 */

/** @param {LoanRequest} payload @returns {Promise<LoanResponse>} */
export async function createLoan(payload) {
  try {
    const { data } = await client.post('/loans', payload)
    return data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

/** @returns {Promise<LoanResponse[]>} */
export async function getAllLoans() {
  try {
    const { data } = await client.get('/loans')
    return data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

/** @param {string} bankName @param {string} borrowerName @returns {Promise<LoanResponse>} */
export async function getLoan(bankName, borrowerName) {
  try {
    const { data } = await client.get(
      `/loans/${encodeURIComponent(bankName)}/${encodeURIComponent(borrowerName)}`,
    )
    return data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

/** @param {string} bankName @param {string} borrowerName @returns {Promise<PaymentInfo[]>} */
export async function getLoanPayments(bankName, borrowerName) {
  try {
    const { data } = await client.get(
      `/loans/${encodeURIComponent(bankName)}/${encodeURIComponent(borrowerName)}/payments`,
    )
    return data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

/** @param {PaymentRequest} payload */
export async function addPayment(payload) {
  try {
    const { data } = await client.post('/payments', payload)
    return data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

/** @param {string} bankName @param {string} borrowerName @param {number} emi @returns {Promise<BalanceResponse>} */
export async function getBalance(bankName, borrowerName, emi) {
  try {
    const { data } = await client.get(
      `/balance/${encodeURIComponent(bankName)}/${encodeURIComponent(borrowerName)}`,
      { params: { emi } },
    )
    return data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}
