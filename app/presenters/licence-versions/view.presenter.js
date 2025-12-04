'use strict'

/**
 * Formats data for the `/licence-versions/{id}` page
 * @module ViewPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/licence-versions/{id}` page
 *
 * @param {object} licenceVersion - the licence version with the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} The data formatted for the view template
 */
function go(licenceVersion, auth) {
  const { licence } = licenceVersion

  const billingAndDataRole = auth.credentials.scope.includes('billing')

  return {
    backLink: {
      href: `/system/licences/${licence.id}/history`,
      text: 'Go back to history'
    },
    changeType: licenceVersion.administrative ? 'no licence issued' : 'licence issued',
    errorInDataEmail: _errorInDataEmail(billingAndDataRole),
    notes: _notes(licenceVersion, billingAndDataRole),
    pageTitle: `Licence version starting ${formatLongDate(licenceVersion.startDate)}`,
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    reason: _reason(licenceVersion, billingAndDataRole)
  }
}
function _errorInDataEmail(billingAndDataRole) {
  if (billingAndDataRole) {
    return null
  }

  return 'water_abstractiondigital@environment-agency.gov.uk'
}

function _notes(licenceVersion, billingAndDataRole) {
  if (!billingAndDataRole) {
    return null
  }

  const notes = licenceVersion.$notes()

  return notes.length > 0 ? notes : null
}

function _reason(licenceVersion, billingAndDataRole) {
  const reason = licenceVersion.$reason()
  const createdBy = licenceVersion.$createdBy()
  const createdAt = formatLongDate(licenceVersion.createdAt)

  if (!billingAndDataRole) {
    return reason
  }

  if (!reason) {
    return `Created on ${createdAt}`
  }

  if (!createdBy) {
    return `${reason} created on ${createdAt}`
  }

  return `${reason} created on ${createdAt} by ${createdBy}`
}

module.exports = {
  go
}
