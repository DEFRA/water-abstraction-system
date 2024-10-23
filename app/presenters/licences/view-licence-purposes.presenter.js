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
    licencePurposes: _formatLicencePurposes(licence.licenceVersions[0].licenceVersionPurposes),
    licenceRef: licence.licenceRef,
    pageTitle: 'Licence purpose details'
  }
}

// NOTE: Maps over the `licenceVersionPurposes` array, formatting each `licenceVersionPurpose` object to extract
// relevant information while ensuring uniqueness. A Set is used to track already processed licence details by
// "stringify-ing" each object. If a duplicate is found, it returns null for that entry. After mapping, it filters out
// any null values.
function _formatLicencePurposes (licenceVersionPurposes) {
  const uniquePurposeDetails = new Set()

  return licenceVersionPurposes.map((licenceVersionPurpose) => {
    const licenceString = JSON.stringify(licenceVersionPurpose)

    if (uniquePurposeDetails.has(licenceString)) {
      return null
    } else {
      uniquePurposeDetails.add(licenceString)
    }

    return {
      abstractionAmounts: _formatAbstractionAmounts(licenceVersionPurpose),
      abstractionPeriod: _abstractionPeriod(licenceVersionPurpose),
      abstractionPoints: _formatAbstractionPoints(licenceVersionPurpose.points),
      purposeDescription: licenceVersionPurpose.purpose.description
    }
  }).filter((item) => {
    return item !== null
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
