'use strict'

/**
 * Sends transactions to the Charging Module
 * @module SendTransactionsService
 */

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const ChargingModuleCreateTransactionService = require('../../charging-module/create-transaction.service.js')
const ChargingModuleCreateTransactionPresenter = require('../../../presenters/charging-module/create-transaction.presenter.js')

/**
 * Sends the provided transactions to the Charging Module and returns an array of the sent transactions
 *
 * Each sent transaction is updated with a status of `charge_created` and the external id returned by the
 * Charging Module.
 *
 * @param {module:LicenceModel} licence The licence that each transaction is linked to
 * @param {module:BillModel} bill The bill each transaction is to be linked to
 * @param {string} billRunExternalId The Charging Module bill run id that the transactions are to be created on
 * @param {Object[]} transactions The transactions to be sent to the Charging Module
 * @param {Object} billingPeriod The billing period of the transactions
 *
 * @returns {Promise<Object[]>} Array of transactions which have been sent to the Charging Module
 */
async function go (licence, bill, billRunExternalId, transactions) {
  try {
    const sentTransactions = []

    for (const transaction of transactions) {
      const chargingModuleResponse = await _sendTransactionToChargingModule(
        transaction,
        bill,
        licence,
        billRunExternalId
      )

      transaction.status = 'charge_created'
      transaction.externalId = chargingModuleResponse.response.body.transaction.id

      sentTransactions.push(transaction)
    }

    return sentTransactions
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToCreateCharge)
  }
}

async function _sendTransactionToChargingModule (transaction, bill, licence, billRunExternalId) {
  const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
    transaction,
    bill.accountNumber,
    licence
  )

  return ChargingModuleCreateTransactionService.go(billRunExternalId, chargingModuleRequest)
}

module.exports = {
  go
}
