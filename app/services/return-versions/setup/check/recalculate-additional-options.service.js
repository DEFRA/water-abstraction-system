'use strict'

/**
 * Recalculate additional options when the start date has changed
 * @module RecalculateAdditionalOptions
 */

/**
 * Recalculate additional options when the start date has changed
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go (session) {
  const {
    licence: { waterUndertaker },
    returnVersionStartDate, additionalSubmissionOptions, startDateUpdated
  } = session

  const quarterlyReturnSubmissions = _quarterlyReturnSubmissions(returnVersionStartDate)

  session.quarterlyReturnSubmissions = quarterlyReturnSubmissions
  session.additionalSubmissionOptions = _additionalSubmissionOptions(
    additionalSubmissionOptions, waterUndertaker, startDateUpdated, quarterlyReturnSubmissions)

  // We need to set this to false to allow the session
  session.startDateUpdated = false

  return session.$update()
}

/**
 * Checks if the return version is a quarterly returns submission
 *
 * A return version is due for quarterly returns submissions when they:
 * - are a water company and the return version start date is > 1 April 2025
 *
 * @param {string} returnVersionStartDate - The return version start date
 *
 * @returns {boolean}
 *
 * @private
 */
function _quarterlyReturnSubmissions (returnVersionStartDate) {
  const quarterlyReturnSubmissionsStartDate = new Date('2025-04-01')

  return new Date(returnVersionStartDate).getTime() >= quarterlyReturnSubmissionsStartDate.getTime()
}

/**
 * Determines the default options
 *
 * Previous session data takes priority
 * If a return version is for quarterly return submissions then it has its own defaults to set
 * Otherwise default to none
 *
 * @param {string[]} additionalSubmissionOptions - The options set already from session
 * @param {boolean} waterUndertaker - If the return version is for water company
 * @param {boolean} startDateUpdated - If start date has been updated
 * @param {boolean} quarterlyReturnSubmissions - If the return version is a quarterly return
 *
 * @returns {string[]}
 *
 * @private
 */
function _additionalSubmissionOptions (
  additionalSubmissionOptions, waterUndertaker, startDateUpdated, quarterlyReturnSubmissions) {
  if (!startDateUpdated && additionalSubmissionOptions) {
    //  fix this logic
    if (additionalSubmissionOptions) {
      return additionalSubmissionOptions
    } else {
      return _calculateDefaults(waterUndertaker, quarterlyReturnSubmissions)
    }
  } else {
    return _calculateDefaults(waterUndertaker, quarterlyReturnSubmissions)
  }
}

function _calculateDefaults (waterUndertaker, quarterlyReturnSubmissions) {
  const options = []

  if (waterUndertaker && quarterlyReturnSubmissions) {
    options.push('multiple-upload')
    options.push('quarterly-return-submissions')
  } else if (waterUndertaker) {
    options.push('multiple-upload')
  } else {
    options.push('none')
  }

  return options
}

module.exports = {
  go
}
