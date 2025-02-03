'use strict'

/**
 * Determines the returns period data for the selected returns period
 * @module DetermineReturnsPeriod
 */

const { determineUpcomingReturnPeriods } = require('../../../lib/return-periods.lib.js')

/**
 * Determines the returns period data for the selected returns period
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

function _returnsPeriod(returnsPeriod) {
  const periods = determineUpcomingReturnPeriods()

  return periods.find((period) => {
    return period.name === returnsPeriod
  })
}

function _summer(returnsPeriod) {
  return returnsPeriod === 'summer' ? 'true' : 'false'
}

module.exports = {
  go
}
