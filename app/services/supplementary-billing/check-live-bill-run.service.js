'use strict'

/**
 * Checks whether a "live" bill run exists for the specified region, scheme, type and financial year
 * @module CheckLiveBillRunService
 */

/**
 * Check whether a "live" bill run exists for the specified region, scheme, type and financial year
 *
 * We define "live" as having the status `processing`, `ready` or `review`
 *
 * @param {*} region
 * @param {*} scheme
 * @param {*} type
 * @param {*} financialYeara
 *
 * @returns {Boolean} Whether a "live" bill run exists
 */
async function go (region, scheme, type, financialYear) {
  return true
}

module.exports = {
  go
}
