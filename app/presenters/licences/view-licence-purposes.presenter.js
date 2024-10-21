'use strict'

/**
 * Formats the licence purposes data for the view licence purposes page
 * @module ViewLicencePurposesPresenter
 */

const { formatAbstractionPeriod } = require('../base.presenter.js')

/**
 * Formats the licence purposes data for the view licence purposes page
 *
 * @param {module:LicenceModel} licence - The licence and related licenceVersionPurposes data returned by
 * `FetchLicencePurposesService`
 *
 * @returns {object} licence and licenceVersionPurposes data needed by the view template
 */
function go (licence) {
  return {
    id: licence.id,
    licenceRef: licence.licenceRef,
    licencePurposes: _formatLicencePurposes(licence.licenceVersions[0].licenceVersionPurposes),
    pageTitle: 'Licence purpose details'
  }
}

function _formatLicencePurposes (licenceVersionPurposes) {
  return licenceVersionPurposes.map((licenceVersionPurpose) => {
    return {
      abstractionAmounts: _formatAbstractionAmounts(licenceVersionPurpose),
      abstractionPeriod: _abstractionPeriod(licenceVersionPurpose),
      abstractionPoints: _formatAbstractionPoints(licenceVersionPurpose.points),
      purposeDescription: licenceVersionPurpose.purpose.description ? licenceVersionPurpose.purpose.description : ''
    }
  })
}

function _abstractionPeriod (licenceVersionPurpose) {
  const startDay = licenceVersionPurpose.abstractionPeriodStartDay
  const startMonth = licenceVersionPurpose.abstractionPeriodStartMonth
  const endDay = licenceVersionPurpose.abstractionPeriodEndDay
  const endMonth = licenceVersionPurpose.abstractionPeriodEndMonth

  return formatAbstractionPeriod(startDay, startMonth, endDay, endMonth)
}

function _formatAbstractionPoints (points) {
  return points.map((point) => {
    return point.$describe()
  })
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
    details.push(`${parseFloat(instantQuantity).toFixed(2)} cubic metres per second (Instantaneous Quantity)`)
  }

  return details
}

module.exports = {
  go
}
