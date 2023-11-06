'use strict'

/**
 * Formats data for a compensation charge transaction for the bill-licence page
 * @module CompensationChargeTransactionPresenter
 */

const { formatLongDate, formatMoney } = require('../base.presenter.js')

/**
 * Formats data for a compensation charge transaction for the bill-licence page
 *
 * The format of the object the presenter returns will differ depending on the scheme the transaction is for.
 *
 * @param {module:TransactionModel} transaction an instance of `TransactionModel` that represents a compensation charge
 * transaction
 *
 * @returns {Object} a formatted representation of the transaction specifically for the bill-licence page
 */
function go (transaction) {
  if (transaction.scheme === 'sroc') {
    return _srocContent(transaction)
  }

  return _presrocContent(transaction)
}

function _agreement (section127Agreement) {
  if (section127Agreement) {
    return 'Two-part tariff'
  }

  return null
}

function _presrocContent (transaction) {
  const {
    authorisedDays,
    billableDays,
    chargeType,
    endDate,
    isCredit,
    netAmount,
    section127Agreement,
    startDate,
    volume
  } = transaction

  return {
    agreement: _agreement(section127Agreement),
    billableDays: `${billableDays}/${authorisedDays}`,
    chargePeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    chargeType,
    creditAmount: isCredit ? formatMoney(netAmount) : '',
    debitAmount: isCredit ? '' : formatMoney(netAmount),
    description: 'Compensation charge',
    quantity: `${volume}ML`
  }
}

function _srocContent (transaction) {
  const {
    authorisedDays,
    billableDays,
    chargeType,
    endDate,
    isCredit,
    netAmount,
    startDate,
    volume
  } = transaction

  return {
    billableDays: `${billableDays}/${authorisedDays}`,
    chargePeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    chargeType,
    creditAmount: isCredit ? formatMoney(netAmount) : '',
    debitAmount: isCredit ? '' : formatMoney(netAmount),
    description: 'Compensation charge',
    quantity: `${volume}ML`
  }
}

module.exports = {
  go
}
