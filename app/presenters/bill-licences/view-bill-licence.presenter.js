'use strict'

/**
 * Formats data for a bill licence including its transactions into what is needed for the bill-licence page
 * @module ViewBillLicencePresenter
 */

const { formatMoney } = require('../base.presenter.js')
const CompensationChargeTransactionPresenter = require('./compensation-charge-transaction.presenter.js')
const MinimumChargeTransactionPresenter = require('./minimum-charge-transaction.presenter.js')
const StandardChargeTransactionPresenter = require('./standard-charge-transaction.presenter.js')

/**
 * Formats data for a bill licence including its transactions into what is needed for the bill-licence page
 *
 * @param {module:BillLicenceModel} billLicence an instance of `BillLicence` with linked bill, bill run and
 * transactions
 *
 * @returns {Object} a formatted representation of the bill licence and its transactions specifically for the
 * view bill-licence page
 */
function go (billLicence) {
  const { bill, licenceId, licenceRef, transactions } = billLicence

  const displayCreditDebitTotals = _displayCreditDebitTotals(bill.billRun)

  const { creditTotal, debitTotal, total } = _totals(transactions)

  return {
    accountNumber: bill.invoiceAccountNumber,
    billingInvoiceId: bill.billingInvoiceId,
    creditTotal,
    debitTotal,
    displayCreditDebitTotals,
    licenceId,
    licenceRef,
    scheme: bill.billRun.scheme,
    tableCaption: _tableCaption(transactions),
    transactions: _transactions(transactions),
    transactionsTotal: total
  }
}

function _displayCreditDebitTotals (billRun) {
  const { batchType } = billRun

  return batchType === 'supplementary'
}

function _tableCaption (transactions) {
  const numberOfTransactions = transactions.length

  if (numberOfTransactions === 1) {
    return '1 transaction'
  }

  return `${numberOfTransactions} transactions`
}

function _totals (transactions) {
  let creditTotal = 0
  let debitTotal = 0
  let total = 0

  transactions.forEach((transaction) => {
    const { isCredit, netAmount } = transaction

    total += netAmount
    if (isCredit) {
      creditTotal += netAmount
    } else {
      debitTotal += netAmount
    }
  })

  return {
    creditTotal: formatMoney(creditTotal),
    debitTotal: formatMoney(debitTotal),
    total: formatMoney(total, true)
  }
}

function _transactions (transactions) {
  return transactions.map((transaction) => {
    const { chargeType } = transaction

    if (chargeType === 'minimum_charge') {
      return MinimumChargeTransactionPresenter.go(transaction)
    }

    if (chargeType === 'compensation') {
      return CompensationChargeTransactionPresenter.go(transaction)
    }

    return StandardChargeTransactionPresenter.go(transaction)
  })
}

module.exports = {
  go
}
