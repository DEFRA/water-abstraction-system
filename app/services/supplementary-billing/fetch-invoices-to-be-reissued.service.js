'use strict'

/**
 * Fetches billing invoices to be reissued
 * @module FetchInvoicesToBeReissuedService
 */

const BillingInvoiceModel = require('../../models/water/billing-invoice.model.js')

/**
 * Takes a region and fetches billing invoices in that region marked for reissuing, along with their transactions
 *
 * @param {String} regionId The uuid of the region
 *
 * @returns {module:BillingInvoiceModel[]} Array of billing invoices to be reissued
 */
async function go (regionId) {
  try {
    const result = await BillingInvoiceModel.query()
      .select(
        'billingInvoices.externalId',
        'invoiceAccountId',
        'invoiceAccountNumber',
        'originalBillingInvoiceId'
      )
      .where('isFlaggedForRebilling', true)
      .joinRelated('billingBatch')
      .where('billingBatch.regionId', regionId)
      .withGraphFetched('billingInvoiceLicences.billingTransactions')
      .modifyGraph('billingInvoiceLicences', (builder) => {
        builder.select(
          'licenceRef',
          'licenceId'
        )
      })

    return result
  } catch (error) {
    // If getting invoices errors then we log the error and return an empty array; the db hasn't yet been modified at
    // this stage so we can simply move on to the next stage of processing the billing batch.

    global.GlobalNotifier.omfg('Could not fetch reissue invoices', {
      region: regionId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    })

    return []
  }
}

module.exports = {
  go
}
