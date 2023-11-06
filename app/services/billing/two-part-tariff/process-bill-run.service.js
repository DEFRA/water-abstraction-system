'use strict'

/**
 * Process a given two-part tariff bill run for the given billing periods
 * @module ProcessBillRunService
 */

/**
 * Functionality not yet implemented
 */
async function go (_billRun, _billingPeriods, financialYear) {
  throw new Error(`Two Part Tariff is not yet implemented for Financial Year: ${financialYear}`)
}

module.exports = {
  go
}
