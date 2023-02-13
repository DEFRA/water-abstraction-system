'use strict'

/**
 * Generates the transaction lines for a supplementary bill run
 * @module CreateTransactionsService
 */

const AbstractionBillingPeriodService = require('./abstraction-billing-period.service.js')

/**
 * Creates a transaction line and calculates the billable days for each charge element
 * 
 * Each SROC charge version linked to a licence will have one or more charge elements that are linked to a charge reference.
 *
 * A transaction line is needed for each of these charge references. Linked to the charge element are one or more abstraction periods.
 *
 * We need to calculate the sum of the billable days for these periods and apply it to the transaction line.
 *
 * @param {Object} billingPeriod Object that has a `startDate` and `endDate` that defines the billing period
 * @param {Object[]} chargeElements An array of `chargeElements` containing an array of `chargePurposes` which define
 * the abstraction periods
 *
 * @returns {Object[]} An array that has the `reference` and `billableDays` for each charge element on a charge version
 */
function go (billingPeriod, chargeElements) {
  const transactionLines = chargeElements.map((chargeElement) => {
    return {
      reference: chargeElement.billingChargeCategory.reference,
      billableDays: _calculateBillableDays(billingPeriod, chargeElement.chargePurposes)
    }
  })

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
