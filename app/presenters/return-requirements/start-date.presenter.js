'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDatePresenter
*/

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/start-date` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go (session) {
  const {
    id: sessionId,
    licence,
    startDateOptions,
    startDateDay,
    startDateMonth,
    startDateYear
  } = session

  return {
    anotherStartDateDay: startDateDay ?? null,
    anotherStartDateMonth: startDateMonth ?? null,
    anotherStartDateYear: startDateYear ?? null,
    backLink: _backLink(session),
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    licenceVersionStartDate: _licenceVersionStartDate(licence),
    sessionId,
    startDateOption: startDateOptions ?? null
  }
}

function _backLink (session) {
  const { checkPageVisited, id, licence } = session

  if (checkPageVisited) {
    return `/system/return-requirements/${id}/check`
  }

  if (FeatureFlagsConfig.enableSystemLicenceView) {
    return `/system/licences/${licence.id}/set-up`
  } else {
    return `/licences/${licence.id}#charge`
  }
}

function _licenceVersionStartDate (licence) {
  const { currentVersionStartDate } = licence

  // NOTE: because the session data is stored in a JSONB field when we get the instance from the DB the date values are
  // in JS Date format (string). So, we have to convert it to a date before calling `formatLongDate()`
  const dateObj = new Date(currentVersionStartDate)

  return formatLongDate(dateObj)
}

module.exports = {
  go
}
