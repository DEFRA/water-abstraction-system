'use strict'

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/check`
 * @module CheckPresenter
 */

const { formatAbstractionPeriod, formatValueUnit } = require('../../base.presenter.js')

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/check`
 *
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
    conditionId,
    label,
    licenceRef,
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
    abstractionPeriodManuallyEntered: conditionId === 'no_condition',
    condition: conditionDisplayText,
    licenceRef,
    links: _links(session.id),
    monitoringStationLabel: label,
    pageTitle: 'Check the restriction details',
    threshold: formatValueUnit(threshold, unit),
    type: _type(stopOrReduce, reduceAtThreshold)
  }
}

function _links(sessionId) {
  const base = `/system/licence-monitoring-station/setup/${sessionId}`

  return {
    threshold: `${base}/threshold-and-unit`,
    type: `${base}/stop-or-reduce`,
    licenceNumber: `${base}/licence-number`,
    licenceCondition: `${base}/full-condition`,
    abstractionPeriod: `${base}/abstraction-period`
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
