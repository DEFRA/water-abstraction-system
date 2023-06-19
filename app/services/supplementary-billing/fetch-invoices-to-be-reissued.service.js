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
    // TODO: optimise this to only return what we need from the billing invoice licences and the transactions
    const result = await BillingInvoiceModel.query()
      .joinRelated('billingBatch')
      .withGraphFetched('billingInvoiceLicences.billingTransactions')
      .where({
        'billingBatch.regionId': regionId,
        isFlaggedForRebilling: true
      })

    return result
  } catch (_error) {
    // If getting invoices errors then we log the error and return an empty array; the db hasn't yet been modified at
    // this stage so we can simply move on to the next stage of processing the billing batch.

    // TODO: add logging
    return []
  }
}

module.exports = {
  go
}
