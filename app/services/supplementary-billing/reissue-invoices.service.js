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
 * We get all invoices to be reissued for the given billing batch (ie. same region, and marked for reissuing). For each
 * one of these we call `ReissueInvoiceService` which handles the actual reissuing process and collect the returned
 * invoice, invoice licence and transaction data which we batch persist one all invoices have been reissued
 *
 * @param {module:BillingBatchModel} originalBillingBatch The billing batch to check for invoices to be reissued
 * @param {module:BillingBatchModel} reissueBillingBatch The billing batch that the reissued invoices will be created on
 *
 * @returns {Boolean} `true` if any invoices were reissued; `false` if not
*/

async function go (originalBillingBatch, reissueBillingBatch) {
  const sourceInvoices = await FetchInvoicesToBeReissuedService.go(originalBillingBatch.regionId)

  if (sourceInvoices.length === 0) {
    return false
  }

  const dataToPersist = {
    billingInvoices: [],
    billingInvoiceLicences: [],
    transactions: []
  }

  for (const sourceInvoice of sourceInvoices) {
    const newData = await ReissueInvoiceService.go(sourceInvoice, originalBillingBatch, reissueBillingBatch)

    _addNewDataToDataToPersist(dataToPersist, newData)
  }

  await _persistData(dataToPersist)

  return true
}

/**
 * Iterate over each key in `dataToPersist` and add to it the corresponding data in `newData`
 */
function _addNewDataToDataToPersist (dataToPersist, newData) {
  Object.keys(dataToPersist).forEach((key) => {
    dataToPersist[key].push(...newData[key])
  })
}

async function _persistData (dataToPersist) {
  await BillingInvoiceModel.query().insert(dataToPersist.billingInvoices)
  await BillingInvoiceLicenceModel.query().insert(dataToPersist.billingInvoiceLicences)
  await BillingTransactionModel.query().insert(dataToPersist.transactions)
}

module.exports = {
  go
}
