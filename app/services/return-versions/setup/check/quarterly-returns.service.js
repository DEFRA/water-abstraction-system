'use strict'

/**
 * Quarterly returns service
 * @module QuarterlyReturnsService
 */

/**
 * Quarterly returns service
 *
 * When the start date changes to or from a quarterly return we need to recalculate the additional options.
 *
 * We have introduced defaults for a water company for its additional options
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} - The data formatted for the view template
 */
async function go (session) {
  const {
    licence: { waterUndertaker },
    returnVersionStartDate, additionalSubmissionOptions, startDateUpdated
  } = session

  const quarterlyReturnSubmissions = _quarterlyReturnSubmissions(returnVersionStartDate)

  session.quarterlyReturnSubmissions = quarterlyReturnSubmissions
  session.additionalSubmissionOptions = _additionalSubmissionOptions(
    additionalSubmissionOptions, waterUndertaker, startDateUpdated, quarterlyReturnSubmissions)

  session.startDateUpdated = false

  return session.$update()
}

/**
 * Checks if the return version is a quarterly returns submission
 *
 * A return version is due for quarterly returns submissions when they:
 * - are a water company and the return version start date > 1 April 2025
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
 * Determines the additional options
 *
 * If the return version start date has not been updated, then we use the session data to maintain the users choice.
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
    return additionalSubmissionOptions
  }

  return _defaultAdditionalOptions(waterUndertaker, quarterlyReturnSubmissions)
}

/**
 * Determines the additional options
 *
 * If the licence is not for a water company then it just defaults to an empty array
 *
 * @param {boolean} waterUndertaker - If the licence is for a water company
 * @param {boolean} quarterlyReturnSubmissions - If the return version is a quarterly return
 *
 * @returns {string[]}
 *
 * @private
 */
function _defaultAdditionalOptions (waterUndertaker, quarterlyReturnSubmissions) {
  const options = []

  if (waterUndertaker && quarterlyReturnSubmissions) {
    options.push('multiple-upload')
    options.push('quarterly-return-submissions')
  } else if (waterUndertaker) {
    options.push('multiple-upload')
  }

  return options
}

module.exports = {
  go
}
