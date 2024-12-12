'use strict'

/**
 * Formats data for minimum charge transaction for the bill-licence page
 * @module ViewMinimumChargeTransactionPresenter
 */

const { formatMoney } = require('../base.presenter.js')

/**
 * Formats data for minimum charge transaction for the bill-licence page
 *
 * @param {module:TransactionModel} transaction - an instance of `TransactionModel` that represents a minimum charge
 * transaction
 *
 * @returns {object} a formatted representation of the transaction specifically for the bill-licence page
 */
function go(transaction) {
  const { chargeType, credit, netAmount } = transaction

  return {
    billableDays: '',
    chargeType,
    creditAmount: credit ? formatMoney(netAmount) : '',
    debitAmount: credit ? '' : formatMoney(netAmount),
    description: 'Minimum charge',
    quantity: ''
  }
}

module.exports = {
  go
}
