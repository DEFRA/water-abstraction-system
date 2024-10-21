'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/existing` page
 * @module ExistingPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')
const { returnRequirementReasons } = require('../../../lib/static-lookups.lib.js')

/**
 * Formats data for the `/return-versions/setup/{sessionId}/existing` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go (session) {
  const { id: sessionId, licence } = session

  return {
    existingOptions: _existingOptions(licence.returnVersions),
    licenceRef: licence.licenceRef,
    sessionId
  }
}

function _existingOptions (returnVersions) {
  return returnVersions.map((returnVersion) => {
    const { id, startDate } = returnVersion
    const reason = _reason(returnVersion)

    // NOTE: because the session data is stored in a JSONB field when we get the instance from the DB the date values
    // are in JS Date format (string). So, we have to convert it to a date before calling `formatLongDate()`
    const dateObj = new Date(startDate)
    const formattedStartDate = formatLongDate(dateObj)

    return {
      value: id,
      text: reason ? `${formattedStartDate} - ${reason}` : formattedStartDate
    }
  })
}

function _reason (returnVersion) {
  const { modLogs, reason } = returnVersion

  // The return version was created in WRLS or we were able to map the NALD reason during import
  if (reason) {
    return returnRequirementReasons[reason]
  }

  // The return version has no mod logs or the first entry does not have a reason recorded
  if (modLogs.length === 0 || !modLogs[0].reasonDescription) {
    return null
  }

  // Fallback to the reason against the first mod log entry for the return version
  return modLogs[0].reasonDescription
}

module.exports = {
  go
}
