'use strict'

/**
 * Fetches the debit transactions for a the last 'sent' billrun if one exists
 * @module FetchPreviousBillingTransactionsService
 */

const { db } = require('../../../db/db.js')

/**
 * Return either a new billing transaction object to use or an existing one if it exists
 *
 * This first checks whether billing transactions for the same licence ID & financial year exists in
 * `foundBillingTransactions`. The calling service is expected to provide and keep track of this variable between
 * between calls. If it does, it returns that instance along with the original array unchanged.
 *
 * If it doesn't, we generate a new instance and create a new array, based on the one provided plus our new instance.
 * We then return the instance and the new array as the result.
 *
 * For context, this is all to avoid searching for `billing_transaction` records unnecessarily.
 *
 * @param {Array} foundLicenceIds
 * @param {*} licenceId UUID of the licence the billing invoice licence is linked to
 * @param {*} financialYearEnding The financial year ending of the related billing invoice
 *
 * @returns {Object} A result object containing either the found or generated billing transaction object, and an
 * array of generated billing transactions which includes the one being returned
 */
async function go (foundLicenceIds, licenceId, financialYearEnding) {
  if (foundLicenceIds.includes(licenceId)) {
    return {
      billingTransactions: [],
      foundLicenceIds
    }
  }

  const billingTransactions = await _fetch(licenceId, financialYearEnding)

  const updatedFoundLicenceIds = [...foundLicenceIds, licenceId]

  return {
    billingTransactions,
    foundLicenceIds: updatedFoundLicenceIds
  }
}

async function _fetch (licenceId, financialYearEnding) {
  const result = db
    .select(
      'authorisedDays',
      'billableDays',
      'isWaterUndertaker',
      'chargeElementId',
      'startDate',
      'endDate',
      'source',
      'season',
      'loss',
      'isCredit',
      'chargeType',
      'authorisedQuantity',
      'billableQuantity',
      'description',
      'volume',
      'section126Factor',
      'section127Agreement',
      'section130Agreement',
      'isTwoPartSecondPartCharge',
      'scheme',
      'aggregateFactor',
      'adjustmentFactor',
      'chargeCategoryCode',
      'chargeCategoryDescription',
      'isSupportedSource',
      'supportedSourceName',
      'isWaterCompanyCharge',
      'isWinterOnly',
      'purposes',
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
        .max('bil.date_created as latest_date_created')
        .from('water.billingInvoiceLicences as bil')
        .innerJoin('water.licences as l', 'bil.licenceId', 'l.licenceId')
        .innerJoin('water.billingInvoices as bi', 'bil.billingInvoiceId', 'bi.billingInvoiceId')
        .innerJoin('water.billingBatches as bb', 'bi.billingBatchId', 'bb.billingBatchId')
        .where({
          'bi.financialYearEnding': financialYearEnding,
          'bb.status': 'sent',
          'bb.scheme': 'sroc',
          'l.licenceId': licenceId
        })
        .groupBy('bil.billingInvoiceLicenceId')
        .as('validBillingInvoices'),
      'bt.billingInvoiceLicenceId', 'validBillingInvoices.billingInvoiceLicenceId'
    )
    .where({
      'bt.isCredit': false
    })

  return result
}

module.exports = {
  go
}
