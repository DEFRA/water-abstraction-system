'use strict'

/**
 * Formats data for the view `/licences/{id}/` page
 * @module ViewLicencePresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}/` page
 *
 * @param {module:LicenceModel} licence - The licence where the data will be extracted for from
 *
 * @returns {Object} The data formatted for the view template
 */
function go (licence) {
  const {
    ends,
    expiredDate,
    id,
    licenceDocumentHeader,
    licenceHolder,
    licenceName,
    licenceRef,
    licenceVersions,
    region,
    registeredTo,
    startDate
  } = licence

  return {
    id,
    documentId: licenceDocumentHeader.id,
    endDate: _endDate(expiredDate),
    licenceHolder: _generateLicenceHolder(licenceHolder),
    licenceName,
    licenceRef,
    pageTitle: `Licence ${licenceRef}`,
    purposes: _generatePurposes(licenceVersions),
    region: region.displayName,
    registeredTo,
    startDate: formatLongDate(startDate),
    warning: _generateWarningMessage(ends)
  }
}

function _endDate (expiredDate) {
  if (!expiredDate || expiredDate < Date.now()) {
    return null
  }

  return formatLongDate(expiredDate)
}

function _generateLicenceHolder (licenceHolder) {
  if (!licenceHolder) {
    return 'Unregistered licence'
  }

  return licenceHolder
}

function _generatePurposes (licenceVersions) {
  if (!licenceVersions || licenceVersions.length === 0 || licenceVersions[0]?.purposes.length === 0) {
    return null
  }
  const allPurposeDescriptions = licenceVersions[0].purposes.map((item) => {
    return item.description
  })

  const uniquePurposes = [...new Set(allPurposeDescriptions)]

  return {
    caption: uniquePurposes.length === 1 ? 'Purpose' : 'Purposes',
    data: uniquePurposes
  }
}

function _generateWarningMessage (ends) {
  if (!ends) {
    return null
  }

  const { date, reason } = ends
  const today = new Date()

  if (date > today) {
    return null
  }

  if (reason === 'revoked') {
    return `This licence was revoked on ${formatLongDate(date)}`
  }

  if (reason === 'lapsed') {
    return `This licence lapsed on ${formatLongDate(date)}`
  }

  return `This licence expired on ${formatLongDate(date)}`
}

module.exports = {
  go
}
