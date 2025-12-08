'use strict'

/**
 * Formats data for the `/licence-versions/{id}` page
 * @module ViewPresenter
 */

const PreviousAndNextPresenter = require('../previous-and-next.presenter.js')
const { formatLongDate } = require('../base.presenter.js')
const { formatLicencePoints } = require('../licence.presenter.js')

/**
 * Formats data for the `/licence-versions/{id}` page
 *
 * @param {object} licenceVersionData - the licence version with the licence, and the licence versions for pagination
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} The data formatted for the view template
 */
function go(licenceVersionData, auth) {
  const { licenceVersion, licenceVersionsForPagination } = licenceVersionData

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
    pagination: _pagination(licenceVersionsForPagination, licenceVersion),
    points: _points(licenceVersion.licenceVersionPurposes),
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

/**
 * Calculate the previous and next licence versions to create the pagination object. This feeds directly into the GDS
 * component.
 *
 * @private
 */
function _pagination(licenceVersionsForPagination, licenceVersion) {
  const { previous, next } = PreviousAndNextPresenter.go(licenceVersionsForPagination, licenceVersion)

  if (!next && !previous) {
    return null
  }

  const pagination = {}

  if (previous) {
    pagination.previous = {
      text: 'Previous version',
      labelText: `Starting ${formatLongDate(previous.startDate)}`,
      href: `/system/licence-versions/${previous.id}`
    }
  }

  if (next) {
    pagination.next = {
      text: 'Next version',
      labelText: `Starting ${formatLongDate(next.startDate)}`,
      href: `/system/licence-versions/${next.id}`
    }
  }

  return pagination
}

/**
 * Format the points for the view
 *
 * The view uses the macro 'pointsSummaryCards' and we have a corresponding presenter to map a points for this macro.
 * The points page uses the macro and presenter, and was the first to use it.
 *
 * That is why we need to map the source onto a point in this function.
 *
 * We also need to sort here as other logic depends on the 'licenceVersionPurposes'. We can not sort this in the query
 * as there could be multiple 'licenceVersionPurposes' with multiple 'points'.
 *
 * @private
 */
function _points(licenceVersionPurposes) {
  const formattedPoints = licenceVersionPurposes
    .flatMap((licenceVersionPurpose) => {
      return licenceVersionPurpose.points
    })
    .map(({ source, ...point }) => {
      return {
        ...point,
        sourceDescription: source.description,
        sourceType: source.sourceType
      }
    })
    .sort((a, b) => {
      return a.description.localeCompare(b.description, 'en', {
        sensitivity: 'base',
        ignorePunctuation: true
      })
    })

  return formatLicencePoints(formattedPoints)
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
