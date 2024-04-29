'use strict'

/**
 * Formats data for the `/licences/{id}` page's summary tab
 * @module ViewLicencePresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}` page's summary tab
 *
 * @param {module:LicenceModel} licence - The licence where the data will be extracted for from
 *
 * @returns {Object} The data formatted for the view template
 */
function go (licence) {
  const {
    ends,
    id,
    includeInPresrocBilling,
    includeInSrocBilling,
    licenceName,
    licenceRef,
    registeredTo,
  } = licence

  return {
    licenceName,
    licenceRef,
    notification: _determineNotificationBanner(includeInPresrocBilling, includeInSrocBilling),
    pageTitle: `Licence ${licenceRef}`,
    registeredTo,
    warning: _generateWarningMessage(ends)
  }
}


function _determineNotificationBanner (includeInPresrocBilling, includeInSrocBilling) {
  const baseMessage = 'This license has been marked for the next supplementary bill run'

  if (includeInPresrocBilling === 'yes' && includeInSrocBilling === true) {
    return baseMessage + 's for the current and old charge schemes.'
  }
  if (includeInPresrocBilling === 'yes') {
    return baseMessage + ' for the old charge scheme.'
  }

  if (includeInSrocBilling === true) {
    return baseMessage + '.'
  }

  return null
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
