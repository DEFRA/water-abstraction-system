'use strict'

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/check`
 * @module CheckPresenter
 */

const { formatAbstractionPeriod } = require('../../base.presenter.js')

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/check`
 *
 * // TODO: JS Docs
 * @param {module:SessionModel} session - The licence monitoring station setup session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const {
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth,
    conditionDisplayText,
    label,
    reduceAtThreshold,
    stopOrReduce,
    threshold,
    unit
  } = session

  return {
    abstractionPeriod: formatAbstractionPeriod(
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth,
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth
    ),
    condition: conditionDisplayText,
    monitoringStationLabel: label,
    pageTitle: 'Check the restriction details',
    threshold: `${threshold}${unit}`,
    type: _type(stopOrReduce, reduceAtThreshold)
  }
}

function _type(stopOrReduce, reduceAtThreshold) {
  if (stopOrReduce === 'stop') {
    return 'Stop'
  }

  if (reduceAtThreshold === 'no') {
    return 'Reduce'
  }

  return 'Reduce with a maximum volume limit'
}

module.exports = {
  go
}
