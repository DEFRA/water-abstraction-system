'use strict'

/**
 * Process a given annual bill run for the given billing periods
 * @module ProcessBillRunService
 */

/**
 * Functionality not yet implemented
 */
async function go (billRun, _billingPeriods) {
  global.GlobalNotifier.omg(`Annual not implemented: Cannot process ${billRun.id}`)
}

module.exports = {
  go
}
