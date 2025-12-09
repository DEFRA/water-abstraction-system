'use strict'

const PointModel = require('../models/point.model.js')
const { formatAbstractionPeriod } = require('./base.presenter.js')
const { formatAbstractionAmounts } = require('./licences/base-licences.presenter.js')

/**
 * Formats Licence points for the view
 *
 * Used by the 'pointsSummaryCards' macro
 *
 * @param {object[]} points - points from the licence version purposes
 *
 * @returns {object[]} - the points formatted to be displayed
 */
function formatLicencePoints(points) {
  return points.map((point) => {
    // NOTE: We create a `PointModel` instance so we can use the `$describe()` instance method
    const pointInstance = PointModel.fromJson(point)

    return {
      bgsReference: pointInstance.bgsReference ?? '',
      category: pointInstance.category ?? '',
      depth: pointInstance.depth.toString(),
      description: pointInstance.description ?? '',
      gridReference: pointInstance.$describe(),
      hydroInterceptDistance: pointInstance.hydroInterceptDistance.toString(),
      hydroOffsetDistance: pointInstance.hydroOffsetDistance.toString(),
      hydroReference: pointInstance.hydroReference ?? '',
      locationNote: pointInstance.locationNote ?? '',
      note: pointInstance.note ?? '',
      primaryType: pointInstance.primaryType ?? '',
      secondaryType: pointInstance.secondaryType ?? '',
      sourceDescription: pointInstance.sourceDescription ?? '',
      sourceType: pointInstance.sourceType ?? '',
      wellReference: pointInstance.wellReference ?? ''
    }
  })
}

/**
 * Formats Licence purposes for the view
 *
 * Used by the 'purposesSummaryCards' macro
 *
 * @param {object[]} purposes - purposes from the licence version purposes
 *
 * @returns {object[]} - the purposes formatted to be displayed
 */
function formatLicencePurposes(purposes) {
  return purposes.map((purpose) => {
    const abstractionAmounts = _formatAbstractionAmounts(purpose)
    const abstractionMethods = _formatAbstractionMethod(purpose.licenceVersionPurposePoints)
    const abstractionPoints = _formatAbstractionPoints(purpose.points)

    return {
      abstractionAmounts,
      abstractionAmountsTitle: abstractionAmounts.length > 1 ? 'Abstraction amounts' : 'Abstraction amount',
      abstractionMethods,
      abstractionMethodsTitle:
        purpose.licenceVersionPurposePoints.length > 1 ? 'Methods of abstraction' : 'Method of abstraction',
      abstractionPeriod: _abstractionPeriod(purpose),
      abstractionPoints,
      abstractionPointsTitle: abstractionPoints.length > 1 ? 'Abstraction points' : 'Abstraction point',
      purposeDescription: purpose.purpose.description
    }
  })
}

function _abstractionPeriod(licenceVersionPurpose) {
  const {
    abstractionPeriodStartDay: startDay,
    abstractionPeriodStartMonth: startMonth,
    abstractionPeriodEndDay: endDay,
    abstractionPeriodEndMonth: endMonth
  } = licenceVersionPurpose

  return formatAbstractionPeriod(startDay, startMonth, endDay, endMonth)
}

function _formatAbstractionAmounts(licenceVersionPurpose) {
  if (!licenceVersionPurpose) {
    return []
  }

  return formatAbstractionAmounts(licenceVersionPurpose)
}

function _formatAbstractionMethod(licenceVersionPurposePoints) {
  const abstractionMethods = licenceVersionPurposePoints.map((licenceVersionPurposePoint) => {
    return licenceVersionPurposePoint.abstractionMethod
  })

  const uniqueAbstractionMethods = Array.from(new Set(abstractionMethods))

  if (uniqueAbstractionMethods.length === 1) {
    return uniqueAbstractionMethods[0]
  }

  if (uniqueAbstractionMethods.length === 2) {
    return uniqueAbstractionMethods.join(' and ')
  }

  return (
    uniqueAbstractionMethods.slice(0, uniqueAbstractionMethods.length - 1).join(', ') +
    ', and ' +
    uniqueAbstractionMethods[uniqueAbstractionMethods.length - 1]
  )
}

function _formatAbstractionPoints(points) {
  return points.map((point) => {
    return point.$describe()
  })
}

module.exports = {
  formatLicencePoints,
  formatLicencePurposes
}
