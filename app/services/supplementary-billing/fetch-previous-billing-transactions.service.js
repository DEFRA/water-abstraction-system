'use strict'

/**
 * Fetches the previously billed transactions that match the invoice, licence and year provided, removing any debits
 * which are cancelled out by previous credits.
 * @module FetchPreviousBillingTransactionsService
 */

const { db } = require('../../../db/db.js')

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
 * debits. We judge a pair of credits and debits to be matching if they have the same number of billable days and the
 * same charge type.
 */
function _cleanse (billingTransactions) {
  const credits = billingTransactions.filter((transaction) => transaction.isCredit)
  const debits = billingTransactions.filter((transaction) => !transaction.isCredit)

  for (const credit of credits) {
    const debitIndex = debits.findIndex((debit) => {
      return debit.billableDays === credit.billableDays && debit.chargeType === credit.chargeType
    })

    if (debitIndex > -1) {
      debits.splice(debitIndex, 1)
    }
  }

  return debits
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
