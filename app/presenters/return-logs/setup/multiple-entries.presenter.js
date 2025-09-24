'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/multiple-entries` page
 * @module MultipleEntriesPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')
const { returnRequirementFrequencies } = require('../../../lib/static-lookups.lib.js')

/**
 * Format data for the `/return-log/setup/{sessionId}/multiple-entries` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, lines, multipleEntries, returnReference, returnsFrequency, reported } = session

  const measurementType = reported === 'abstractionVolumes' ? 'volumes' : 'readings'
  const frequency = returnRequirementFrequencies[returnsFrequency]

  return {
    backLink: `/system/return-logs/setup/${sessionId}/check`,
    caption: `Return reference ${returnReference}`,
    endDate: formatLongDate(new Date(lines[lines.length - 1].startDate)),
    frequency,
    lineCount: lines.length,
    measurementType,
    multipleEntries: multipleEntries ?? null,
    pageTitle: `Enter multiple ${frequency} ${measurementType}`,
    sessionId,
    startDate: formatLongDate(new Date(lines[0].startDate))
  }
}

module.exports = {
  go
}
