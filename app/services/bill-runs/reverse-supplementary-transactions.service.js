'use strict'

/**
 * Takes previously billed transactions and returns reversed and cleansed versions of them for supplementary billing
 * @module ReverseSupplementaryTransactionsService
 */

const { generateUUID } = require('../../lib/general.lib.js')

/**
 * Takes previously billed transactions and returns reversed and cleansed versions of them for supplementary billing
 *
 * In supplementary we need to "reverse" transactions. We start by identifying previous debit transactions that have not
 * been cancelled out by a previous credit transaction.
 *
 * We then "reverse" these previous debits as credits and compare them to the transactions generated as part of the
 * bill run currently in progress.
 *
 * If the "reversed" transaction matches the generated transaction, we know including both will just result in £0.
 * If like the legacy service we included them, it could lead to a zero value bill which our users hate! So, we drop\
 * both from the bill run.
 *
 * Those reversed and generated transactions that don't match, are what gets included and eventually billed.
 *
 * This service takes the previous debit transactions and a bill licence ID, and returns a copy of them, but with
 *
 * - `credit` set to `true`
 * - `status` set to `candidate`
 * - `billLicenceId` set to the supplied ID
 * - `id` set to a new UUID
 *
 * @param {module:TransactionModel[]} transactions - The transactions to be reversed
 * @param {string} billLicenceId - The bill licence UUID these transactions are to be added to
 *
 * @returns {object[]} The "reversed" transactions
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
