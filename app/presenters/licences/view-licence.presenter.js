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
  const { expiredDate, id, licenceRef, region, startDate } = licence
  const warning = _generateWarningMessage(licence)

  return {
    id,
    endDate: _endDate(expiredDate),
    licenceRef,
    region: region.displayName,
    startDate: formatLongDate(startDate),
    warning
  }
}

function _endDate (expiredDate) {
  if (!expiredDate || expiredDate < Date.now()) {
    return null
  }

  return formatLongDate(expiredDate)
}

function _generateWarningMessage (licence) {
  const ends = licence.$ends()

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
