'use strict'

/**
 * Takes an array of transactions and returns an array of transactions which will reverse them.
 * @module ReverseTransactionsService
 */

const { generateUUID } = require('../../../lib/general.lib.js')

/**
 * Takes an array of transactions and returns an array of transactions which will reverse them.
 *
 * In some situations we need to "reverse" transactions; this is done by issuing new transactions which cancel them out.
 * This service takes an array of transactions and a bill licence, and returns an array of transactions which will
 * reverse the original transactions, with their bill licence id set to the ID of the supplied billing licence.
 *
 * @param {module:TransactionModel[]} transactions - Array of transactions to be reversed
 * @param {string} billLicenceId - The bill licence UUID these transactions are to be added to
 *
 * @returns {object[]} Array of reversed transactions with `billLicenceId` set to the id of the supplied `billLicence`
 */
function go(transactions, billLicenceId) {
  return transactions.map((transaction) => {
    return {
      ...transaction,
      id: generateUUID(),
      billLicenceId,
      credit: true,
      status: 'candidate'
    }
  })
}

module.exports = {
  go
}
