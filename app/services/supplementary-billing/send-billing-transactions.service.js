'use strict'

/**
 * Sends transactions to the Charging Module
 * @module SendBillingTransactionsService
 */

const BillingBatchError = require('../../errors/billing-batch.error.js')
const BillingBatchModel = require('../../models/water/billing-batch.model.js')
const ChargingModuleCreateTransactionService = require('../charging-module/create-transaction.service.js')
const ChargingModuleCreateTransactionPresenter = require('../../presenters/charging-module/create-transaction.presenter.js')

/**
 * Sends the provided transactions to the Charging Module and returns an array of the sent transactions, each updated
 * with a status of `charge_created`; the external id returned by the Charging Module; and the appropriate billing
 * invoice licence id
 *
 * TODO: document and test this
 *
 * @param {*} licence
 * @param {*} billingInvoice
 * @param {*} billingInvoiceLicence
 * @param {*} billingBatchExternalId
 * @param {*} billingTransactions
 * @param {*} billingPeriod
 *
 * @returns
 */
async function go (licence, billingInvoice, billingInvoiceLicence, billingBatchExternalId, billingTransactions, billingPeriod) {
  try {
    const sentTransactions = []

    for (const transaction of billingTransactions) {
      const chargingModuleResponse = await _sendTransactionToChargingModule(
        transaction,
        billingPeriod,
        billingInvoice,
        licence,
        billingBatchExternalId
      )

      _updateTransaction(transaction, chargingModuleResponse, billingInvoiceLicence)

      sentTransactions.push(transaction)
    }

    return sentTransactions
  } catch (error) {
    throw new BillingBatchError(error, BillingBatchModel.errorCodes.failedToCreateCharge)
  }
}

async function _sendTransactionToChargingModule (transaction, billingPeriod, billingInvoice, licence, billingBatchExternalId) {
  const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
    transaction,
    billingPeriod,
    billingInvoice.invoiceAccountNumber,
    licence
  )

  return ChargingModuleCreateTransactionService.go(billingBatchExternalId, chargingModuleRequest)
}

function _updateTransaction (transaction, chargingModuleResponse, billingInvoiceLicence) {
  transaction.status = 'charge_created'
  transaction.externalId = chargingModuleResponse.response.body.transaction.id
  transaction.billingInvoiceLicenceId = billingInvoiceLicence.billingInvoiceLicenceId
}

module.exports = {
  go
}
