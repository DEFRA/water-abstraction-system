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
 * @param {object} purposes - The licenceVersionPurposes data returned by `FetchLicencePurposesService`
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} licence and licenceVersionPurposes data needed by the view template
 */
function go(purposes, licence) {
  const { id, licenceRef } = licence

  const licencePurposes = formatPurposes(purposes)

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

function formatPurposes(purposes) {
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

module.exports = {
  go
}
