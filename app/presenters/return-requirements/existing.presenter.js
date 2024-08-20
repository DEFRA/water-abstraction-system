'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/existing` page
 * @module ExistingPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const { returnRequirementReasons } = require('../../lib/static-lookups.lib.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/existing` page
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
    const { id, reason, startDate } = returnVersion

    // NOTE: because the session data is stored in a JSONB field when we get the instance from the DB the date values
    // are in JS Date format (string). So, we have to convert it to a date before calling `formatLongDate()`
    const dateObj = new Date(startDate)
    const formattedStartDate = formatLongDate(dateObj)

    return {
      value: id,
      text: reason ? `${formattedStartDate} - ${returnRequirementReasons[reason]}` : formattedStartDate
    }
  })
}

module.exports = {
  go
}
