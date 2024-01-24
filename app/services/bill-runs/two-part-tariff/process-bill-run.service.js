'use strict'

/**
 * Process a given two-part tariff bill run for the given billing periods
 * @module ProcessBillRunService
 */

/**
 * Functionality not yet implemented
 */
async function go (billRun, billingPeriods) {
  throw new Error(`Two Part Tariff is not yet implemented for Financial Year Ending: ${billingPeriods[0].endDate.getFullYear()}`)
}

module.exports = {
  go
}
