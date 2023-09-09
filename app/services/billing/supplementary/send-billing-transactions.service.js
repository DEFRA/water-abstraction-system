'use strict'

/**
 * Sends transactions to the Charging Module
 * @module SendBillingTransactionsService
 */

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/water/bill-run.model.js')
const ChargingModuleCreateTransactionService = require('../../charging-module/create-transaction.service.js')
const ChargingModuleCreateTransactionPresenter = require('../../../presenters/charging-module/create-transaction.presenter.js')

/**
 * Sends the provided transactions to the Charging Module and returns an array of the sent transactions, each updated
 * with a status of `charge_created`; the external id returned by the Charging Module; and the appropriate billing
 * invoice licence id
 *
 * @param {module:LicenceModel} licence The licence that each transaction is linked to
 * @param {module:BillingInvoiceModel} billingInvoice The billing invoice each transaction is to be linked to
 * @param {module:BillingInvoiceLicenceModel} billingInvoiceLicence The billing invoice licence each transaction is to be linked to
 * @param {string} billRunExternalId The Charging Module bill run id that the transactions are to be created on
 * @param {Object[]} billingTransactions The transactions to be sent to the Charging Module
 * @param {Object} billingPeriod The billing period of the transactions
 *
 * @returns {Object[]} Array of transactions which have been sent to the Charging Module
 */
async function go (licence, billingInvoice, billingInvoiceLicence, billRunExternalId, billingTransactions, billingPeriod) {
  try {
    const sentTransactions = []

    for (const transaction of billingTransactions) {
      const chargingModuleResponse = await _sendTransactionToChargingModule(
        transaction,
        billingPeriod,
        billingInvoice,
        licence,
        billRunExternalId
      )

      _updateTransaction(transaction, chargingModuleResponse, billingInvoiceLicence)

      sentTransactions.push(transaction)
    }

    return sentTransactions
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToCreateCharge)
  }
}

async function _sendTransactionToChargingModule (transaction, billingPeriod, billingInvoice, licence, billRunExternalId) {
  const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
    transaction,
    billingPeriod,
    billingInvoice.invoiceAccountNumber,
    licence
  )

  return ChargingModuleCreateTransactionService.go(billRunExternalId, chargingModuleRequest)
}

function _updateTransaction (transaction, chargingModuleResponse, billingInvoiceLicence) {
  transaction.status = 'charge_created'
  transaction.externalId = chargingModuleResponse.response.body.transaction.id
  transaction.billingInvoiceLicenceId = billingInvoiceLicence.billingInvoiceLicenceId
}

module.exports = {
  go
}
