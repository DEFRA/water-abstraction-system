'use strict'

/**
 * Fetches the previously billed transactions that match, removing any debits which cancelled out by previous credits
 * @module FetchPreviousTransactionsService
 */

const { db } = require('../../../../db/db.js')
const { transactionsMatch } = require('../../../lib/general.lib.js')
const TransactionModel = require('../../../models/transaction.model.js')

/**
 * Fetches the previously billed transactions that match, removing any debits which cancelled out by previous credits
 *
 * @param {string} billingAccountId - The UUID that identifies the billing account we need to fetch transactions for
 * @param {string} licenceId - The UUID that identifies the licence we need to fetch transactions for
 * @param {number} financialYearEnding - The year the financial billing period ends that we need to fetch transactions
 * for
 *
 * @returns {Promise<object[]>} The resulting matched transactions
 */
async function go (billingAccountId, licenceId, financialYearEnding) {
  const transactions = await _fetch(billingAccountId, licenceId, financialYearEnding)

  return _cleanse(transactions)
}

/**
 * Cleanse the transactions by cancelling out matching pairs of debits and credits, and return the remaining debits.
 *
 * If a credit matches to a debit then its something that was dealt with in a previous supplementary bill run. We need
 * to know only about debits that have not been credited.
 *
 * @private
 */
function _cleanse (transactions) {
  const credits = transactions.filter((transaction) => {
    return transaction.credit
  })
  const debits = transactions.filter((transaction) => {
    return !transaction.credit
  })

  credits.forEach((credit) => {
    const debitIndex = debits.findIndex((debit) => {
      return transactionsMatch(debit, credit)
    })

    if (debitIndex > -1) {
      debits.splice(debitIndex, 1)
    }
  })

  return debits
}

async function _fetch (billingAccountId, licenceId, financialYearEnding) {
  return TransactionModel.query()
    .select([
      'transactions.authorisedDays',
      'transactions.billableDays',
      'transactions.waterUndertaker',
      'transactions.chargeReferenceId',
      'transactions.startDate',
      'transactions.endDate',
      'transactions.source',
      'transactions.season',
      'transactions.loss',
      'transactions.credit',
      'transactions.chargeType',
      'transactions.authorisedQuantity',
      'transactions.billableQuantity',
      'transactions.description',
      'transactions.volume',
      'transactions.section126Factor',
      'transactions.section127Agreement',
      'transactions.secondPartCharge',
      'transactions.scheme',
      'transactions.aggregateFactor',
      'transactions.adjustmentFactor',
      'transactions.chargeCategoryCode',
      'transactions.chargeCategoryDescription',
      'transactions.supportedSource',
      'transactions.supportedSourceName',
      'transactions.newLicence',
      'transactions.waterCompanyCharge',
      'transactions.winterOnly',
      'transactions.purposes',
      // NOTE: The section130Agreement field is a varchar in the DB for historic reasons. It seems some early PRESROC
      // transactions recorded values other than 'true' or 'false'. For SROC though, it will only ever be true/false. We
      // generate our calculated billing transaction lines based on the Section130 flag against charge_elements which is
      // always a boolean. So, to avoid issues when we need to compare the values we cast this to a boolean when
      // fetching the data.
      db.raw('transactions.section_130_agreement::boolean')
    ])
    .innerJoin('billLicences', 'transactions.billLicenceId', 'billLicences.id')
    .innerJoin('bills', 'billLicences.billId', 'bills.id')
    .innerJoin('billRuns', 'bills.billRunId', 'billRuns.id')
    .where({
      'billLicences.licenceId': licenceId,
      'bills.billingAccountId': billingAccountId,
      'bills.financialYearEnding': financialYearEnding,
      'billRuns.status': 'sent',
      'billRuns.scheme': 'sroc'
    })
}

module.exports = {
  go
}
