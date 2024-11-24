'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsPresenter
 */

const { isQuarterlyReturnSubmissions } = require('../../../lib/dates.lib.js')

/**
 * Formats data for the `/return-versions/setup/{sessionId}/additional-submission-options` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const {
    id: sessionId,
    licence: { id: licenceId, licenceRef },
    multipleUpload,
    noAdditionalOptions,
    returnVersionStartDate,
    quarterlyReturns
  } = session

  return {
    backLink: `/system/return-versions/setup/${sessionId}/check`,
    licenceId,
    licenceRef,
    multipleUpload,
    noAdditionalOptions,
    quarterlyReturnSubmissions: isQuarterlyReturnSubmissions(returnVersionStartDate),
    quarterlyReturns,
    sessionId
  }
}

module.exports = {
  go
}
