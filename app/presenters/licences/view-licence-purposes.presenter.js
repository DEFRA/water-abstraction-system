'use strict'

/**
 * Formats the licence and related licenceVersionPurposes data for the view licence purposes page
 * @module ViewLicencePurposesPresenter
 */

const { formatAbstractionPeriod } = require('../base.presenter.js')

/**
 * Formats the licence and related licenceVersionPurposes data for the view licence purposes page
 *
 * @param {module:LicenceModel} licence - The licence and related licenceVersionPurposes data returned by
 * `FetchLicencePurposesService`
 *
 * @returns {object} licence and licenceVersionPurposes data needed by the view template
 */
function go (licence) {
  return {
    id: licence.id,
    licencePurposes: _formatLicencePurposes(licence.licenceVersions[0].licenceVersionPurposes),
    licenceRef: licence.licenceRef,
    pageTitle: 'Licence purpose details'
  }
}

function _abstractionPeriod (licenceVersionPurpose) {
  const {
    abstractionPeriodStartDay: startDay,
    abstractionPeriodStartMonth: startMonth,
    abstractionPeriodEndDay: endDay,
    abstractionPeriodEndMonth: endMonth
  } = licenceVersionPurpose

  return formatAbstractionPeriod(startDay, startMonth, endDay, endMonth)
}

function _formatAbstractionAmounts (licenceVersionPurpose) {
  const details = []

  if (!licenceVersionPurpose) {
    return details
  }

  const { annualQuantity, dailyQuantity, hourlyQuantity, instantQuantity } = licenceVersionPurpose

  if (annualQuantity) {
    details.push(`${parseFloat(annualQuantity).toFixed(2)} cubic metres per year`)
  }

  if (dailyQuantity) {
    details.push(`${parseFloat(dailyQuantity).toFixed(2)} cubic metres per day`)
  }

  if (hourlyQuantity) {
    details.push(`${parseFloat(hourlyQuantity).toFixed(2)} cubic metres per hour`)
  }

  if (instantQuantity) {
    details.push(`${parseFloat(instantQuantity).toFixed(2)} cubic metres per second`)
  }

  return details
}

function _formatAbstractionPoints (points) {
  return points.map((point) => {
    return point.$describe()
  })
}

function _formatLicencePurposes (licenceVersionPurposes) {
  return licenceVersionPurposes.map((licenceVersionPurpose) => {
    const abstractionPoints = _formatAbstractionPoints(licenceVersionPurpose.points)
    const abstractionAmounts = _formatAbstractionAmounts(licenceVersionPurpose)

    return {
      abstractionAmounts,
      abstractionAmountsTitle: abstractionAmounts.length > 1 ? 'Abstraction amounts' : 'Abstraction amount',
      abstractionPeriod: _abstractionPeriod(licenceVersionPurpose),
      abstractionPoints,
      abstractionPointsTitle: abstractionPoints.length > 1 ? 'Abstraction points' : 'Abstraction point',
      purposeDescription: licenceVersionPurpose.purpose.description
    }
  })
}

module.exports = {
  go
}
