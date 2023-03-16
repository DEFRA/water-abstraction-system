'use strict'

/**
 * Fetches a billingInvoiceLicenceId for a the last 'sent' billrun if one exists
 * @module FetchBillingInvoiceLicenceService
 */

const { db } = require('../../../db/db.js')

/**
 * Return either a new billing invoice licence object to use to find the transactions or an existing one if it exists
 *
 * This first checks whether a billing invoice licence with the same licence ID & financial year exists in
 * `foundBillingInvoiceLicenceIds`. The calling service is expected to provide and keep track of this variable between
 * between calls. If it does, it returns that instance along with the original array unchanged.
 *
 * If it doesn't, we generate a new instance and create a new array, based on the one provided plus our new instance.
 * We then return the instance and the new array as the result.
 *
 * For context, this is all to avoid searching for `billing_invoice_licence` records unnecessarily.
 *
 * @param {Object[]} foundBillingInvoiceLicenceIds An array of previously generated billing invoice licence objects
 * @param {*} licenceId UUID of the licence the billing invoice licence is linked to
 * @param {*} financialYearEnding The financial year ending of the related billing invoice
 *
 * @returns {Object} A result object containing either the found or generated billing invoice licence object, and an
 * array of generated billing invoices which includes the one being returned
 */
async function go (foundBillingTransactions, licenceId, financialYearEnding) {
  let billingTransaction = _existing(foundBillingTransactions, licenceId, financialYearEnding)

  if (billingTransaction) {
    return {
      billingTransaction,
      billingInvoiceLicences: foundBillingTransactions
    }
  }

  const billingTransactionsData = await _fetch(licenceId, financialYearEnding)

  billingTransaction = {
    billingTransactionsData,
    licenceId,
    financialYearEnding
  }
  const updatedBillingTransactions = [...foundBillingTransactions, billingTransaction]

  return {
    billingTransaction,
    billingTransactions: updatedBillingTransactions
  }
}

function _existing (foundBillingTransactions, licenceId, financialYearEnding) {
  return foundBillingTransactions.find((billingTransaction) => {
    return licenceId === billingTransaction.licenceId && financialYearEnding === billingTransaction.financialYearEnding
  })
}

async function _fetch (licenceId, financialYearEnding) {
  const result = db
    .select('bt.*')
    .from('water.billingTransactions as bt')
    .innerJoin(
      db
        .select('bil.billingInvoiceLicenceId')
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

  return result
}

module.exports = {
  go
}
