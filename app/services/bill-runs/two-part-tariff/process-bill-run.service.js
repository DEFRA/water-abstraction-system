'use strict'

/**
 * Process a given two-part tariff bill run for the given billing periods
 * @module ProcessBillRunService
 */

const MatchAndAllocateService = require('./match-and-allocate.service.js')

/**
 * Functionality not yet implemented
 */
async function go (billRun, billingPeriods) {
  console.log('Bill Run :', billRun)
  await MatchAndAllocateService.go(billRun, billingPeriods)
  // throw new Error(`Two Part Tariff is not yet implemented for Financial Year Ending: ${billingPeriods[0].endDate.getFullYear()}`)
}

module.exports = {
  go
}
