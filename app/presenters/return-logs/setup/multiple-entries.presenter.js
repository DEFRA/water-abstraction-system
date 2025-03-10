'use strict'

const { multipleEntries } = require('../../../controllers/return-logs-setup.controller.js')
/**
 * Format data for the `/return-log/setup/{sessionId}/multiple-entries` page
 * @module MultipleEntiresPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Format data for the `/return-log/setup/{sessionId}/multiple-entries` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, lines, multipleEntries, returnReference, returnsFrequency, reported } = session

  const measurementType = reported === 'abstraction-volumes' ? 'volumes' : 'readings'
  const frequency = _frequency(returnsFrequency)

  return {
    backLink: `/system/return-logs/setup/${sessionId}/check`,
    endDate: formatLongDate(new Date(lines[lines.length - 1].endDate)),
    frequency,
    measurementType,
    multipleEntries: multipleEntries ?? null,
    pageTitle: `Enter multiple ${frequency} ${measurementType}`,
    returnReference,
    sessionId,
    startDate: formatLongDate(new Date(lines[0].startDate))
  }
}

function _frequency(returnsFrequency) {
  if (returnsFrequency === 'day') {
    return 'daily'
  } else if (returnsFrequency === 'week') {
    return 'weekly'
  } else if (returnsFrequency === 'month') {
    return 'monthly'
  }
}

module.exports = {
  go
}
