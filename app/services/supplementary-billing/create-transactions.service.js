'use strict'

/**
 * Creates transaction lines based on the charge referece and abstraction period
 * @module CreateTransactionsService
 */

const AbstractionBillingPeriodService = require('./abstraction-billing-period.service.js')

/**
 * @param {Object} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 * @param {Object[]} chargeElements An array of `chargeElements` containing an array of `chargePurposes` which define
 * the abstraction periods
 *
 * @returns {Object[]} An array that has the `reference` and `billableDays` for each charge element on a charge version
 */
function go (billingPeriod, chargeElements) {
  const transactionLines = []
  for (const chargeElement of chargeElements) {
    const transactionLine = {}
    transactionLine.reference = chargeElement.billingChargeCategory.reference
    transactionLine.billableDays = _calculateBillableDays(billingPeriod, chargeElement.chargePurposes)
    transactionLines.push(transactionLine)
  }
  return transactionLines
}

function _calculateBillableDays (billingPeriod, chargePurposes) {
  let billableDays = 0
  for (const chargePurpose of chargePurposes) {
    const abstractionPeriods = AbstractionBillingPeriodService.go(billingPeriod, chargePurpose)
    for (const abstractionPeriod of abstractionPeriods) {
      billableDays = billableDays + abstractionPeriod.billableDays
    }
  }
  return billableDays
}

module.exports = {
  go
}
