'use strict'

/**
 * Sends transactions to the Charging Module
 * @module SendTransactionsService
 */

const BillRunError = require('../../errors/bill-run.error.js')
const BillRunModel = require('../../models/bill-run.model.js')
const ChargingModuleCreateTransactionRequest = require('../../requests/charging-module/create-transaction.request.js')
const ChargingModuleCreateTransactionPresenter = require('../../presenters/charging-module/create-transaction.presenter.js')

/**
 * Sends the provided transactions to the Charging Module and returns an array of the sent transactions
 *
 * Each sent transaction is updated with a status of `charge_created` and the external id returned by the
 * Charging Module.
 *
 * @param {object[]} transactions - The transactions to be sent to the Charging Module
 * @param {string} billRunExternalId - The Charging Module bill run id that the transactions are to be created on
 * @param {string} accountNumber - The billing account number for the transactions
 * @param {module:LicenceModel} licence - The licence that each transaction is linked to
 *
 * @returns {Promise<object[]>} Array of transactions which have been sent to the Charging Module and updated with its
 * response
 */
async function go(transactions, billRunExternalId, accountNumber, licence) {
  // NOTE: we purposefully loop through all the transactions to send without awaiting them. This is for performance
  // purposes. If for example we have 3 transactions to send we'll send the requests 1 straight after the other. We
  // then wait for all 3 to complete. The overall process time will only be that of the one that takes the longest. If
  // we await instead the overall time will be the sum of the time to complete each one.
  const sendRequests = transactions.map((transaction) => {
    return _sendTransactionToChargingModule(transaction, billRunExternalId, accountNumber, licence)
  })

  // We use Promise.all() to ensure we wait for all the send requests to resolve. The service that awaits the call to
  // SendTransactionsService.go() will still get the updated transactions as Promise.all() returns what each promise
  // resolves to as an array.
  return Promise.all(sendRequests)
}

async function _sendTransactionToChargingModule(transaction, billRunExternalId, accountNumber, licence) {
  try {
    const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(transaction, accountNumber, licence)

    const chargingModuleResponse = await ChargingModuleCreateTransactionRequest.send(
      billRunExternalId,
      chargingModuleRequest
    )

    transaction.status = 'charge_created'
    transaction.externalId = chargingModuleResponse.response.body.transaction.id

    return transaction
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToCreateCharge)
  }
}

module.exports = {
  go
}
