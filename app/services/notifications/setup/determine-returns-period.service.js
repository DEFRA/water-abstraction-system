'use strict'

/**
 * Determines the returns period data for the provided returns period
 * @module DetermineReturnsPeriod
 */

const { determineUpcomingReturnPeriods } = require('../../../lib/return-periods.lib.js')

/**
 * Determines the returns period data for the provided returns period
 *
 * All the returns periods will be calculated from the upcoming return periods.
 *
 * The `returnsPeriod` arg will be found and returned
 *
 * @param {string} returnsPeriod
 *
 * @returns {object} - the returns period and the if the period is `summer`
 */
function go(returnsPeriod) {
  return {
    returnsPeriod: _returnsPeriod(returnsPeriod),
    summer: _summer(returnsPeriod)
  }
}

/**
 * Finds the provided returns period from the determined upcoming return periods.
 *
 * @private
 */
function _returnsPeriod(returnsPeriod) {
  const periods = determineUpcomingReturnPeriods()

  return periods.find((period) => {
    return period.name === returnsPeriod
  })
}

/**
 * When the returns period is summer then need return 'true'
 *
 * The string value is used when querying crm which expects a string and not a boolean
 *
 * @param {string} returnsPeriod
 *
 *  @returns {string} - CRM expects a string of the boolean value ("true" | "false")
 *
 * @private
 */
function _summer(returnsPeriod) {
  return returnsPeriod === 'summer' ? 'true' : 'false'
}

module.exports = {
  go
}
