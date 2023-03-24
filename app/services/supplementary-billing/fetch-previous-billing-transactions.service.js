'use strict'

/**
 * Fetches the previously billed transactions that match the invoice, licence and year provided
 * @module FetchPreviousBillingTransactionsService
 */

const { db } = require('../../../db/db.js')

async function go (billingInvoice, billingInvoiceLicence, financialYearEnding) {
  const billingTransactions = await _fetch(
    billingInvoiceLicence.licenceId,
    billingInvoice.invoiceAccountId,
    financialYearEnding
  )

  return billingTransactions
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
      'bt.section130Agreement',
      'bt.isTwoPartSecondPartCharge',
      'bt.scheme',
      'bt.aggregateFactor',
      'bt.adjustmentFactor',
      'bt.chargeCategoryCode',
      'bt.chargeCategoryDescription',
      'bt.isSupportedSource',
      'bt.supportedSourceName',
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
        .max('bil.date_created as latest_date_created')
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
        .groupBy('bil.billingInvoiceLicenceId', 'bi.invoiceAccountId', 'bi.invoiceAccountNumber')
        .as('validBillingInvoices'),
      'bt.billingInvoiceLicenceId', 'validBillingInvoices.billingInvoiceLicenceId'
    )
    .where({
      'bt.isCredit': false
    })
}

module.exports = {
  go
}
