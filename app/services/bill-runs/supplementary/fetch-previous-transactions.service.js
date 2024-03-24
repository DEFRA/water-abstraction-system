'use strict'

/**
 * Fetches the previously billed transactions that match the bill, licence and year provided, removing any debits
 * which are cancelled out by previous credits.
 * @module FetchPreviousTransactionsService
 */

const { db } = require('../../../../db/db.js')
const { transactionsMatch } = require('../../../lib/general.lib.js')

/**
 * Fetches the previously billed transactions that match the bill, licence and year provided, removing any debits
 * which are cancelled out by previous credits.
 *
 * @param {Object} bill A generated bill that identifies the billing account ID we need to match
 *  against
 * @param {Object} billLicence A generated bill licence that identifies the licence we need to
 *  match against
 * @param {Number} financialYearEnding The year the financial billing period ends that we need to match against
 *
 * @returns {Promise<Object>} The resulting matched transactions
 */
async function go (bill, billLicence, financialYearEnding) {
  const transactions = await _fetch(
    billLicence.licenceId,
    bill.billingAccountId,
    financialYearEnding
  )

  return _cleanse(transactions)
}

/**
 * Cleanse the transactions by cancelling out matching pairs of debits and credits, and return the remaining debits.
 *
 * If a credit matches to a debit then its something that was dealt with in a previous supplementary bill run. We need
 * to know only about debits that have not been credited.
 */
function _cleanse (transactions) {
  const credits = transactions.filter((transaction) => transaction.credit)
  const debits = transactions.filter((transaction) => !transaction.credit)

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

async function _fetch (licenceId, billingAccountId, financialYearEnding) {
  return db
    .select(
      't.authorisedDays',
      't.billableDays',
      't.waterUndertaker',
      't.chargeReferenceId',
      't.startDate',
      't.endDate',
      't.source',
      't.season',
      't.loss',
      't.credit',
      't.chargeType',
      't.authorisedQuantity',
      't.billableQuantity',
      't.description',
      't.volume',
      't.section126Factor',
      't.section127Agreement',
      // NOTE: The section130Agreement field is a varchar in the DB for historic reasons. It seems some early PRESROC
      // transactions recorded values other than 'true' or 'false'. For SROC though, it will only ever be true/false. We
      // generate our calculated billing transaction lines based on the Section130 flag against charge_elements which is
      // always a boolean. So, to avoid issues when we need to compare the values we cast this to a boolean when
      // fetching the data.
      db.raw('t.section_130_agreement::boolean'),
      't.secondPartCharge',
      't.scheme',
      't.aggregateFactor',
      't.adjustmentFactor',
      't.chargeCategoryCode',
      't.chargeCategoryDescription',
      't.supportedSource',
      't.supportedSourceName',
      't.newLicence',
      't.waterCompanyCharge',
      't.winterOnly',
      't.purposes',
      'validBills.billingAccountId',
      'validBills.accountNumber'
    )
    .from('transactions as t')
    .innerJoin(
      db
        .select(
          'bl.id',
          'b.billingAccountId',
          'b.accountNumber'
        )
        .from('billLicences as bl')
        .innerJoin('bills as b', 'bl.billId', 'b.id')
        .innerJoin('billRuns as br', 'br.id', 'b.billRunId')
        .where({
          'bl.licenceId': licenceId,
          'b.billingAccountId': billingAccountId,
          'b.financialYearEnding': financialYearEnding,
          'br.status': 'sent',
          'br.scheme': 'sroc'
        })
        .as('validBills'),
      't.billLicenceId', 'validBills.id'
    )
}

module.exports = {
  go
}
