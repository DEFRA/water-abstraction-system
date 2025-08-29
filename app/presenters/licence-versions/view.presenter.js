'use strict'

/**
 * Formats licence version data ready for presenting in the view licence version page
 * @module ViewPresenter
 */

const { formatAbstractionPeriod, formatLongDate } = require('../base.presenter.js')
const { formatAbstractionAmounts } = require('../licences/base-licences.presenter.js')

/**
 * Formats licence version data ready for presenting in the view licence version page
 *
 * @param {ReturnVersionModel} licenceVersion - licence version and associated licence, points, purposes, and conditions
 * data
 *
 * @returns {object} page data needed by the view template
 */
function go(licenceVersion) {
  const { administrative, endDate, increment, issue, licence, licenceVersionPurposes, startDate } = licenceVersion

  return {
    backLink: { href: `/system/licences/${licence.id}/set-up`, text: 'Go back to summary' },
    changeType: administrative ? 'administrative' : 'substantive',
    createdBy: licenceVersion.$createdBy() ?? '',
    createdDate: formatLongDate(licenceVersion.$createdAt()),
    endDate: endDate ? formatLongDate(endDate) : null,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    notes: licenceVersion.$notes(),
    pageTitle: `Licence version ${issue}-${increment}`,
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    purposes: _purposes(licenceVersionPurposes),
    reason: licenceVersion.$reason() ?? '',
    startDate: formatLongDate(startDate)
  }
}

function _abstractionMethod(licenceVersionPurposePoints) {
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

function _abstractionPeriod(licenceVersionPurpose) {
  const {
    abstractionPeriodStartDay: startDay,
    abstractionPeriodStartMonth: startMonth,
    abstractionPeriodEndDay: endDay,
    abstractionPeriodEndMonth: endMonth
  } = licenceVersionPurpose

  return formatAbstractionPeriod(startDay, startMonth, endDay, endMonth)
}

function _abstractionPoints(points) {
  return points.map((point) => {
    return point.$describe()
  })
}

function _purposes(licenceVersionPurposes) {
  return licenceVersionPurposes.map((licenceVersionPurpose) => {
    const abstractionAmounts = formatAbstractionAmounts(licenceVersionPurpose)
    const abstractionMethods = _abstractionMethod(licenceVersionPurpose.licenceVersionPurposePoints)
    const abstractionPoints = _abstractionPoints(licenceVersionPurpose.points)

    return {
      abstractionAmounts,
      abstractionAmountsTitle: abstractionAmounts.length > 1 ? 'Abstraction amounts' : 'Abstraction amount',
      abstractionMethods,
      abstractionMethodsTitle: abstractionMethods.includes(', and')
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
