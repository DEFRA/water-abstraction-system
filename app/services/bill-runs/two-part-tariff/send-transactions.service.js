'use strict'

/**
 * Sends transactions to the Charging Module
 * @module SendTransactionsService
 */

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const ChargingModuleCreateTransactionPresenter = require('../../../presenters/charging-module/create-transaction.presenter.js')
const { generateUUID } = require('../../../lib/general.lib.js')

async function go (transactions, billRunExternalId, accountNumber, licence) {
  const sendRequests = transactions.map((transaction) => {
    return _sendTransactionToChargingModule(transaction, billRunExternalId, accountNumber, licence)
  })

  return Promise.all(sendRequests)
}

async function _sendTransactionToChargingModule (transaction, billRunExternalId, accountNumber, licence) {
  try {
    const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(transaction, accountNumber, licence)
    // console.log('🚀 ~ _sendTransactionToChargingModule ~ chargingModuleRequest:', chargingModuleRequest)

    transaction.status = 'charge_created'
    transaction.externalId = generateUUID()

    return transaction
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToCreateCharge)
  }
}

module.exports = {
  go
}
