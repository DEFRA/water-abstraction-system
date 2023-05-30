'use strict'

/**
 * Fetches the previously billed transactions that match the invoice, licence and year provided, removing any debits
 * which are cancelled out by previous credits.
 * @module FetchPreviousBillingTransactionsService
 */

const { db } = require('../../../db/db.js')

/**
 * Fetches the previously billed transactions that match the invoice, licence and year provided, removing any debits
 * which are cancelled out by previous credits.
 *
 * @param {Object} billingInvoice A generated billing invoice that identifies the invoice account ID we need to match
 *  against
 * @param {Object} billingInvoiceLicence A generated billing invoice licence that identifies the licence we need to
 *  match against
 * @param {Number} financialYearEnding The year the financial billing period ends that we need to match against
 *
 * @returns {Object} The resulting matched billing transactions
 */
async function go (billingInvoice, billingInvoiceLicence, financialYearEnding) {
  const billingTransactions = await _fetch(
    billingInvoiceLicence.licenceId,
    billingInvoice.invoiceAccountId,
    financialYearEnding
  )

  return _cleanse(billingTransactions)
}

/**
 * Cleanse the billing transactions by cancelling out matching pairs of debits and credits, and return the remaining
 * debits.
 *
 * If a credit matches to a debit then its something that was dealt with in a previous supplementary bill run. We need
 * to know only about debits that have not been credited.
 */
function _cleanse (billingTransactions) {
  const credits = billingTransactions.filter((transaction) => transaction.isCredit)
  const debits = billingTransactions.filter((transaction) => !transaction.isCredit)

  credits.forEach((credit) => {
    const debitIndex = debits.findIndex((debit) => {
      return _matchTransactions(debit, credit)
    })

    if (debitIndex > -1) {
      debits.splice(debitIndex, 1)
    }
  })

  return debits
}

/**
 * Compares a debit transaction to a credit transaction
 *
 * We compare those properties which determine the charge value calculated by the charging module. If the debit
 * transaction's properties matches the credit's we return true. This will tell the calling method
 * to remove the debit from the service's final results.
 *
 * The key properties are charge type, category code, and billable days. But we also need to compare agreements and
 * additional charges because if those have changed, we'll need to credit the previous transaction and calculate the
 * new debit value. Because what we are checking does not match up to what you see in the UI we have this reference
 *
 * - Abatement agreement - section126Factor
 * - Two-part tariff agreement - section127Agreement
 * - Canal and River Trust agreement - section130Agreement
 * - Aggregate - aggregateFactor
 * - Charge Adjustment - adjustmentFactor
 * - Winter discount - isWinterOnly
 *
 * - Additional charges - isSupportedSource
 * - Additional charges - supportedSourceName
 * - Additional charges - isWaterCompanyCharge
 */
function _matchTransactions (debit, credit) {
  // TODO: This logic is a duplicate of what we are doing in
  // app/services/supplementary-billing/process-billing-transactions.service.js. This also means we are running the
  // same kind of unit tests on 2 places. We need to refactor this duplication in the code and the tests out.

  // When we put together this matching logic our instincts were to try and do something 'better' than this long,
  // chained && statement. But whatever we came up with was
  // - more complex
  // - less performant
  // We found this easy to see what properties are being compared. Plus the moment something doesn't match we bail. So,
  // much as it feels 'wrong', we are sticking with it!
  return debit.chargeType === credit.chargeType &&
    debit.chargeCategoryCode === credit.chargeCategoryCode &&
    debit.billableDays === credit.billableDays &&
    debit.section126Factor === credit.section126Factor &&
    debit.section127Agreement === credit.section127Agreement &&
    debit.section130Agreement === credit.section130Agreement &&
    debit.aggregateFactor === credit.aggregateFactor &&
    debit.adjustmentFactor === credit.adjustmentFactor &&
    debit.isWinterOnly === credit.isWinterOnly &&
    debit.isSupportedSource === credit.isSupportedSource &&
    debit.supportedSourceName === credit.supportedSourceName &&
    debit.isWaterCompanyCharge === credit.isWaterCompanyCharge
}

async function _fetch (licenceId, invoiceAccountId, financialYearEnding) {
  return db
    .select(
      'bt.authorisedDays',
      'bt.billableDays',
      'bt.isWaterUndertaker',
      'bt.chargeElementId',
      'bt.startDate',
      'bt.endDate',
      'bt.source',
      'bt.season',
      'bt.loss',
      'bt.isCredit',
      'bt.chargeType',
      'bt.authorisedQuantity',
      'bt.billableQuantity',
      'bt.description',
      'bt.volume',
      'bt.section126Factor',
      'bt.section127Agreement',
      // NOTE: The section130Agreement field is a varchar in the DB for historic reasons. It seems some early PRESROC
      // transactions recorded values other than 'true' or 'false'. For SROC though, it will only ever be true/false. We
      // generate our calculated billing transaction lines based on the Section130 flag against charge_elements which is
      // always a boolean. So, to avoid issues when we need to compare the values we cast this to a boolean when
      // fetching the data.
      db.raw('bt.section_130_agreement::boolean'),
      'bt.isTwoPartSecondPartCharge',
      'bt.scheme',
      'bt.aggregateFactor',
      'bt.adjustmentFactor',
      'bt.chargeCategoryCode',
      'bt.chargeCategoryDescription',
      'bt.isSupportedSource',
      'bt.supportedSourceName',
      'bt.isNewLicence',
      'bt.isWaterCompanyCharge',
      'bt.isWinterOnly',
      'bt.purposes',
      'validBillingInvoices.invoiceAccountId',
      'validBillingInvoices.invoiceAccountNumber'
    )
    .from('water.billingTransactions as bt')
    .innerJoin(
      db
        .select(
          'bil.billingInvoiceLicenceId',
          'bi.invoiceAccountId',
          'bi.invoiceAccountNumber'
        )
        .from('water.billingInvoiceLicences as bil')
        .innerJoin('water.billingInvoices as bi', 'bil.billingInvoiceId', 'bi.billingInvoiceId')
        .innerJoin('water.billingBatches as bb', 'bi.billingBatchId', 'bb.billingBatchId')
        .where({
          'bil.licenceId': licenceId,
          'bi.invoiceAccountId': invoiceAccountId,
          'bi.financialYearEnding': financialYearEnding,
          'bb.status': 'sent',
          'bb.scheme': 'sroc'
        })
        .as('validBillingInvoices'),
      'bt.billingInvoiceLicenceId', 'validBillingInvoices.billingInvoiceLicenceId'
    )
}

module.exports = {
  go
}
