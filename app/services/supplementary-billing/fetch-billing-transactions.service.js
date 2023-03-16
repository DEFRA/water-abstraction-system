'use strict'

/**
 * Fetches a licence's debit transactions from the last 'sent' billing batch it was in
 * @module FetchBillingTransactionsService
 */

const { db } = require('../../../db/db.js')

async function go (processedLicences, licence, financialYearEnding) {
  const { licenceId } = licence
  let billingTransactions = []

  const processedLicence = _existing(processedLicences, licenceId)

  if (processedLicence) {
    return {
      billingTransactions,
      processedLicences
    }
  }

  billingTransactions = await _fetch(licenceId, financialYearEnding)

  const updatedProcessedLicences = [...processedLicences, licence]

  return {
    billingTransactions,
    processedLicences: updatedProcessedLicences
  }
}

function _existing (processedLicences, licenceId) {
  return processedLicences.find((licence) => {
    return licenceId === licence.licenceId
  })
}

async function _fetch (licenceId, financialYearEnding) {
  const result = db
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
        .innerJoin('water.licences as l', 'bil.licenceId', 'l.licenceId')
        .innerJoin('water.billingInvoices as bi', 'bil.billingInvoiceId', 'bi.billingInvoiceId')
        .innerJoin('water.billingBatches as bb', 'bi.billingBatchId', 'bb.billingBatchId')
        .where({
          'bi.financialYearEnding': financialYearEnding,
          'bb.status': 'sent',
          'bb.scheme': 'sroc',
          'l.licenceId': licenceId
        })
        .groupBy('bil.billingInvoiceLicenceId', 'bi.invoiceAccountId', 'bi.invoiceAccountNumber')
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
