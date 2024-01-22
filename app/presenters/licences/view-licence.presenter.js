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
  const { expiredDate, id, lapsedDate, licenceRef, region, revokedDate, startDate } = licence
  const warning = _generateWarningMessage(expiredDate, lapsedDate, revokedDate)

  return {
    id,
    endDate: _endDate(expiredDate),
    licenceRef,
    region: region.displayName,
    startDate: formatLongDate(startDate),
    warning
  }
}

/**
 * Compares two end dates and chooses the correct one to return
 *
 * @param {date} firstEndDate - The first date to compare
 *
 * @param {date} secondEndDate - The second date to compare
 *
 * @module ViewLicencePresenter
 */
function _compareEndDates (firstEndDate, secondEndDate) {
  if (firstEndDate.date.getTime() === secondEndDate.date.getTime()) {
    if (firstEndDate.name === 'revoked') return firstEndDate
    if (secondEndDate.name === 'revoked') return secondEndDate
    if (firstEndDate.name === 'lapsed') return firstEndDate
  } else if (firstEndDate.date < secondEndDate.date) {
    return firstEndDate
  }
  return secondEndDate
}

/**
  * Formats the expired date of the licence as the end date for the view
  *
  * @param {date} expiredDate - The expired date to be formatted if it is in the past
  *
  * @module ViewLicencePresenter
*/
function _endDate (expiredDate) {
  if (!expiredDate || expiredDate < Date.now()) {
    return null
  }

  return formatLongDate(expiredDate)
}

/**
 * When given up to three possible end dates for a licence this function will determine the correct one to show
 * and return it formatted in the standard way
 *
 * @module ViewLicencePresenter
 *
 * @param {date} expiredDate - The expired date or null if not present
 *
 * @param {date} lapsedDate - The lapsed date or null if not present
 *
 * @param {date} revokedDate - The revoked date or null if not present
 *
 * @returns {string} The warning message formatted for the view template
 */
function _generateWarningMessage (expiredDate, lapsedDate, revokedDate) {
  const endDates = []

  if (lapsedDate) {
    endDates.push({
      name: 'lapsed',
      message: `This licence lapsed on ${formatLongDate(lapsedDate)}`,
      date: lapsedDate
    })
  }

  if (expiredDate) {
    endDates.push({
      name: 'expired',
      message: `This licence expired on ${formatLongDate(expiredDate)}`,
      date: expiredDate
    })
  }

  if (revokedDate) {
    endDates.push({
      name: 'revoked',
      message: `This licence was revoked on ${formatLongDate(revokedDate)}`,
      date: revokedDate
    })
  }

  if (endDates.length === 0) {
    return null
  }

  if (endDates.length === 1) {
    return endDates[0].message
  }

  if (endDates.length > 1) {
    return endDates.reduce((result, endDate) => {
      return _compareEndDates(result, endDate)
    }).message
  }

  return null
}

module.exports = {
  go
}
