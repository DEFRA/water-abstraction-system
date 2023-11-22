'use strict'

/**
 * Formats data for minimum charge transaction for the bill-licence page
 * @module ViewMinimumChargeTransactionPresenter
 */

const { formatMoney } = require('../base.presenter.js')

/**
 * Formats data for minimum charge transaction for the bill-licence page
 *
 * @param {module:TransactionModel} transaction an instance of `TransactionModel` that represents a minimum charge
 * transaction
 *
 * @returns {Object} a formatted representation of the transaction specifically for the bill-licence page
 */
function go (transaction) {
  const {
    chargeType,
    isCredit,
    netAmount
  } = transaction

  return {
    billableDays: '',
    chargeType,
    creditAmount: isCredit ? formatMoney(netAmount) : '',
    debitAmount: isCredit ? '' : formatMoney(netAmount),
    description: 'Minimum charge',
    quantity: ''
  }
}

module.exports = {
  go
}
