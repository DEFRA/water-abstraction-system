'use strict'

/**
 * Formats data for a compensation charge transaction for the bill-licence page
 * @module ViewCompensationChargeTransactionPresenter
 */

const { formatLongDate, formatMoney } = require('../base.presenter.js')

/**
 * Formats data for a compensation charge transaction for the bill-licence page
 *
 * The format of the object the presenter returns will differ depending on the scheme the transaction is for.
 *
 * @param {module:TransactionModel} transaction - an instance of `TransactionModel` that represents a compensation
 * charge transaction
 *
 * @returns {object} a formatted representation of the transaction specifically for the bill-licence page
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
    credit,
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
    creditAmount: credit ? formatMoney(netAmount) : '',
    debitAmount: credit ? '' : formatMoney(netAmount),
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
    credit,
    netAmount,
    startDate,
    volume
  } = transaction

  return {
    billableDays: `${billableDays}/${authorisedDays}`,
    chargePeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    chargeType,
    creditAmount: credit ? formatMoney(netAmount) : '',
    debitAmount: credit ? '' : formatMoney(netAmount),
    description: 'Compensation charge',
    quantity: `${volume}ML`
  }
}

module.exports = {
  go
}
