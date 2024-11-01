'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/additional-submission-options` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go (session) {
  const {
    id: sessionId, licence: { id: licenceId, licenceRef, waterUndertaker },
    startDateYear, startDateMonth, startDateDay, additionalSubmissionOptions
  } = session

  const quarterlyReturnSubmissions = _quarterlyReturnSubmissions(startDateYear, startDateMonth, startDateDay)

  return {
    additionalSubmissionOptions:
      _additionalSubmissionOptions(additionalSubmissionOptions, waterUndertaker),
    backLink: `/system/return-versions/setup/${sessionId}/check`,
    licenceId,
    licenceRef,
    sessionId,
    quarterlyReturnSubmissions
  }
}

/**
 * Checks if the return version is a quarterly returns submission
 *
 * A return version is due for quarterly returns submissions when they:
 * - are a water company and the return version start date is > 1 April 2025
 *
 * @param {string} startDateYear - The return version start year
 * @param {string} startDateMonth - The return version start month
 * @param {string} startDateDay - The return version start day
 *
 * @returns {boolean}
 *
 * @private
 */
function _quarterlyReturnSubmissions (startDateYear, startDateMonth, startDateDay) {
  const returnVersionStartDate = new Date(`${startDateYear}-${startDateMonth}-${startDateDay}`)

  const quarterlyReturnSubmissionsStartDate = new Date('2025-04-01')

  return returnVersionStartDate.getTime() >= quarterlyReturnSubmissionsStartDate.getTime()
}

/**
 * Determines the default options
 *
 * Previous session data takes priority
 * If a return version is for quarterly return submissions then it has it's own defaults to set
 * Otherwise default to none
 *
 * @param {string[]} additionalSubmissionOptions - The options set already from session
 * @param {boolean} waterUndertaker - If the return version is for water company
 *
 * @returns {string[]}
 *
 * @private
 */
function _additionalSubmissionOptions (additionalSubmissionOptions, waterUndertaker) {
  if (additionalSubmissionOptions) {
    return additionalSubmissionOptions
  }

  if (waterUndertaker) { return ['multiple-upload', 'quarterly-return-submissions'] }

  return ['none']
}

module.exports = {
  go
}
