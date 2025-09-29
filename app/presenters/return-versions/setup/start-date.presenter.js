'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/start-date` page
 * @module StartDatePresenter
 */

const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')
const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats data for the `/return-versions/setup/{sessionId}/start-date` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, licence, startDateOptions, startDateDay, startDateMonth, startDateYear } = session

  return {
    startDateDay: startDateDay ?? null,
    startDateMonth: startDateMonth ?? null,
    startDateYear: startDateYear ?? null,
    backLink: { href: _backLinkHref(session), text: 'Back' },
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    licenceVersionStartDate: _licenceVersionStartDate(licence),
    pageTitle: 'Select the start date for the requirements for returns',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    sessionId,
    startDateOption: startDateOptions ?? null
  }
}

function _backLinkHref(session) {
  const { checkPageVisited, id, licence } = session

  if (checkPageVisited) {
    return `/system/return-versions/setup/${id}/check`
  } else if (FeatureFlagsConfig.enableSystemLicenceView) {
    return `/system/licences/${licence.id}/set-up`
  }

  return `/licences/${licence.id}#charge`
}

function _licenceVersionStartDate(licence) {
  const { currentVersionStartDate } = licence

  // NOTE: because the session data is stored in a JSONB field when we get the instance from the DB the date values are
  // in JS Date format (string). So, we have to convert it to a date before calling `formatLongDate()`
  const dateObj = new Date(currentVersionStartDate)

  return formatLongDate(dateObj)
}

module.exports = {
  go
}
