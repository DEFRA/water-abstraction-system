'use strict'

/**
 * Formats data for the view `/licences/{id}/` page
 * @module ViewLicencePresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}/` page
 * @param {module:LicenceModel} licence - The licence where the data will be extracted for from
 * @module ViewLicencePresenter
 */
function go (licence) {
  const { expiredDate, id, licenceRef, region, startDate } = licence

  return {
    id,
    endDate: _endDate(expiredDate),
    licenceRef,
    region: region.displayName,
    startDate: formatLongDate(startDate)
  }
}

/**
 * Formats the end date of the licence
 * @module ViewLicencePresenter
 */
function _endDate (expiredDate) {
  if (!expiredDate || new Date(expiredDate) < Date.now()) {
    return null
  }

  return formatLongDate(expiredDate)
}

module.exports = {
  go
}
