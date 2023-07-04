'use strict'

/**
 * Handles the reissuing of invoices
 * @module ReissueInvoicesService
 */

const BillingInvoiceModel = require('../../models/water/billing-invoice.model.js')
const BillingInvoiceLicenceModel = require('../../models/water/billing-invoice-licence.model.js')
const BillingTransactionModel = require('../../models/water/billing-transaction.model.js')
const FetchInvoicesToBeReissuedService = require('./fetch-invoices-to-be-reissued.service.js')
const ReissueInvoiceService = require('./reissue-invoice.service.js')

/**
 * Handles the reissuing of invoices
 *
 * We receive the billing batch that the reissued invoices are to be created on and infer from this the region to be
 * reissued. We check this region for invoices marked for reissuing. For each one of these we call
 * `ReissueInvoiceService` which handles the actual reissuing of an invoice and collects the returned invoice, invoice
 * licence and transaction data which we batch persist once all invoices have been reissued. Finally we return a boolean
 * to indicate whether or not any invoices were reissued.
 *
 * @param {module:BillingBatchModel} reissueBillingBatch The billing batch that the reissued invoices will be created on
 *
 * @returns {Boolean} `true` if any invoices were reissued; `false` if not
*/

async function go (reissueBillingBatch) {
  const sourceInvoices = await FetchInvoicesToBeReissuedService.go(reissueBillingBatch.regionId)

  if (sourceInvoices.length === 0) {
    return false
  }

  const dataToPersist = {
    billingInvoices: [],
    billingInvoiceLicences: [],
    billingTransactions: []
  }

  for (const sourceInvoice of sourceInvoices) {
    const newData = await ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)

    _addNewDataToDataToPersist(dataToPersist, newData)
  }

  await _persistData(dataToPersist)

  return true
}

/**
 * Iterate over each key in `dataToPersist` and add to it the corresponding data in `newData`
 */
function _addNewDataToDataToPersist (dataToPersist, newData) {
  console.log('🚀 ~ file: reissue-invoices.service.js:56 ~ _addNewDataToDataToPersist ~ dataToPersist:', dataToPersist)
  Object.keys(dataToPersist).forEach((key) => {
    dataToPersist[key].push(...newData[key])
  })
}

async function _persistData (dataToPersist) {
  await BillingInvoiceModel.query().insert(dataToPersist.billingInvoices)
  await BillingInvoiceLicenceModel.query().insert(dataToPersist.billingInvoiceLicences)
  await BillingTransactionModel.query().insert(dataToPersist.billingTransactions)
}

module.exports = {
  go
}
