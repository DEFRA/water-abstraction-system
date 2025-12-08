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
    points: _points(licenceVersion.licenceVersionPurposes),
    changeType: licenceVersion.administrative ? 'no licence issued' : 'licence issued',
    errorInDataEmail: _errorInDataEmail(billingAndDataRole),
    notes: _notes(licenceVersion, billingAndDataRole),
    pageTitle: `Licence version starting ${formatLongDate(licenceVersion.startDate)}`,
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    pagination: _pagination(licenceVersionsForPagination, licenceVersion),
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

function _points(licenceVersionPurposes) {
  const points = licenceVersionPurposes
    .flatMap((licenceVersionPurpose) => {
      return licenceVersionPurpose.points
    })
    .sort((a, b) => {
      return a.description.localeCompare(b.description, 'en', {
        sensitivity: 'base',
        ignorePunctuation: true
      })
    })

  return formatLicencePoints(points)
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
