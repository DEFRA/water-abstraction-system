'use strict'

/**
 * Sends transactions to the Charging Module
 * @module SendTransactionsService
 */

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const ChargingModuleCreateTransactionService = require('../../charging-module/create-transaction.service.js')
const ChargingModuleCreateTransactionPresenter = require('../../../presenters/charging-module/create-transaction.presenter.js')

async function go (transactions, billRunExternalId, accountNumber, licence) {
  try {
    for (const transaction of transactions) {
      const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
        transaction,
        accountNumber,
        licence
      )

      const chargingModuleResponse = await ChargingModuleCreateTransactionService.go(billRunExternalId, chargingModuleRequest)

      transaction.status = 'charge_created'
      transaction.externalId = chargingModuleResponse.response.body.transaction.id
    }

    return transactions

    // const requests = transactions.map((transaction) => {
    //   return _sendTransactionToChargingModule(transaction, billRunExternalId, accountNumber, licence)
    // })

    // return Promise.all(requests)
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToCreateCharge)
  }
}

async function _sendTransactionToChargingModule (transaction, billRunExternalId, accountNumber, licence) {
  const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
    transaction,
    accountNumber,
    licence
  )

  const chargingModuleResponse = await ChargingModuleCreateTransactionService.go(billRunExternalId, chargingModuleRequest)

  transaction.status = 'charge_created'
  transaction.externalId = chargingModuleResponse.response.body.transaction.id

  return transaction
}

module.exports = {
  go
}
