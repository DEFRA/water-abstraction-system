'use strict'

/**
 * Formats the licence and related licenceVersionPurposes data for the view licence purposes page
 * @module PurposesPresenter
 */

const { formatAbstractionPeriod } = require('../base.presenter.js')
const { formatAbstractionAmounts, pluralise } = require('./base-licences.presenter.js')

/**
 * Formats the licence and related licenceVersionPurposes data for the view licence purposes page
 *
 * @param {object} licenceVersionPurposes - The licenceVersionPurposes data returned by `FetchLicencePurposesService`
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} licence and licenceVersionPurposes data needed by the view template
 */
function go(licenceVersionPurposes, licence) {
  const { id, licenceRef } = licence

  const licencePurposes = _formatLicencePurposes(licenceVersionPurposes)

  return {
    backLink: {
      href: `/system/licences/${id}/summary`,
      text: 'Go back to summary'
    },
    licencePurposes,
    pageTitle: 'Purposes, periods and amounts',
    pageTitleCaption: `Licence ${licenceRef}`,
    showingPurposes: `Showing ${licencePurposes.length} ${pluralise('purpose', licencePurposes.length)}`
  }
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

function _formatLicencePurposes(licenceVersionPurposes) {
  return licenceVersionPurposes.map((licenceVersionPurpose) => {
    const abstractionAmounts = _formatAbstractionAmounts(licenceVersionPurpose)
    const abstractionMethods = _formatAbstractionMethod(licenceVersionPurpose.licenceVersionPurposePoints)
    const abstractionPoints = _formatAbstractionPoints(licenceVersionPurpose.points)

    return {
      abstractionAmounts,
      abstractionAmountsTitle: abstractionAmounts.length > 1 ? 'Abstraction amounts' : 'Abstraction amount',
      abstractionMethods,
      abstractionMethodsTitle:
        licenceVersionPurpose.licenceVersionPurposePoints.length > 1
          ? 'Methods of abstraction'
          : 'Method of abstraction',
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
